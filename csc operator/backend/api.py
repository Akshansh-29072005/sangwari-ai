from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, Citizen, SchemeApplication, EligibilityResult, Scheme, SchemeRule, DeathRecord, AnomalyCase, Notification, Grievance, GrievanceStatusHistory, Officer, DepartmentMapping, EscalationLog, GrievanceNotification, Application, ApplicationStatusHistory, ServiceSLA, GrievanceCluster
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Session
import json
import uuid
from datetime import datetime, timedelta
from grievance_engine import classify_complaint
from typing import List, Dict, Any
from eligibility_engine import evaluate_rule, discover_beneficiaries, get_all_eligible_candidates
from ai_classifier import analyze_grievance, predict_sla, predict_rejection
from pydantic import BaseModel

class GrievanceRequest(BaseModel):
    complaint_text: str
    citizen_name: str = "Anonymous"
    mobile: str = "0000000000"
    district: str = "Raipur"

class SLARequest(BaseModel):
    complaint_type: str
    department: str
    district: str = "Raipur"

class RejectionRequest(BaseModel):
    age: int
    income: float
    doc_completeness: float          # 0.0 (none) – 1.0 (fully complete)
    address_match: int = 1           # 1=match, 0=mismatch
    previous_rejection: int = 0      # 1=yes, 0=no
app = FastAPI(title="Proactive Beneficiary Discovery API")

# Setup CORS for React frontend (allow all for local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

NOTIFICATION_TEMPLATES = {
    "REGISTERED": "Dear {name}, your complaint has been registered with ID #{id} and routed to {dept}. You will receive updates on this number.",
    "Under Investigation": "Dear {name}, your complaint #{id} is now Under Investigation by the {dept} officer. Expected resolution: {sla} days.",
    "Documents Requested": "Dear {name}, your complaint #{id} requires additional documents. Please visit the nearest CSC center or upload via portal.",
    "Escalated": "Dear {name}, your complaint #{id} has been escalated to a senior officer due to delay. We apologise for the inconvenience.",
    "Resolved": "Dear {name}, your complaint #{id} has been RESOLVED by {dept}. Thank you for using NagarikAI. Please rate your experience.",
}

def trigger_notification(db, identifier: str, mobile: str, citizen_name: str,
                        event_type: str, department: str = "", sla: int = 5, is_grievance: bool = True):
    """Simulate sending SMS — stores notification in DB. identifier can be grievance_id or application_id."""
    template = NOTIFICATION_TEMPLATES.get(event_type, "Dear {name}, your complaint #{id} status has been updated to: " + event_type)
    message = template.format(
        name=citizen_name or "Citizen",
        id=str(identifier)[:8],
        dept=department,
        sla=sla
    )
    notif = GrievanceNotification(
        grievance_id=identifier if is_grievance else None,
        application_id=identifier if not is_grievance else None,
        mobile=mobile,
        citizen_name=citizen_name,
        event_type=event_type,
        message=message,
        delivery_status="simulated"
    )
    db.add(notif)
    db.commit()
    return message
def cosine_sim(a, b):
    try:
        dot = sum(x*y for x,y in zip(a,b))
        norm_a = sum(x*x for x in a)**0.5
        norm_b = sum(x*x for x in b)**0.5
        return dot / (norm_a * norm_b) if norm_a and norm_b else 0.0
    except:
        return 0.0

@app.post("/grievance/analyze")
async def analyze_and_register_grievance(request: GrievanceRequest, db: Session = Depends(get_db)):
    """
    Analyzes the grievance text with the multilingual AI model,
    detects the department, saves to DB, checks for duplicates, and returns the result.
    """
    # Use AI model to predict department and confidence
    ai_result = analyze_grievance(request.complaint_text)
    detected_dept = ai_result.get("department", "Unknown")
    confidence = ai_result.get("confidence", 0.0)
    embedding = ai_result.get("embedding", [])

    is_duplicate = False
    assigned_cluster_id = None
    
    if embedding:
        # Check for semantic duplicates
        existing_grievances = db.query(Grievance).filter(Grievance.complaint_embedding != None).all()
        best_match = None
        max_sim = 0.0
        
        for eg in existing_grievances:
            if eg.complaint_embedding:
                try:
                    sim = cosine_sim(embedding, eg.complaint_embedding)
                    if sim > max_sim:
                        max_sim = sim
                        best_match = eg
                except:
                    pass
        
        # If highly similar, mark as duplicate
        if max_sim > 0.85 and best_match:
            is_duplicate = True
            if best_match.cluster_id:
                cluster = db.query(GrievanceCluster).filter(GrievanceCluster.id == best_match.cluster_id).first()
                if cluster:
                    cluster.complaint_count += 1
                    assigned_cluster_id = cluster.id
            else:
                # Create a new cluster since none exists for this duplicate pair
                new_cluster = GrievanceCluster(
                    primary_grievance=best_match.complaint_text,
                    complaint_count=2, # Best match + new one
                    department=detected_dept
                )
                db.add(new_cluster)
                db.commit()
                db.refresh(new_cluster)
                assigned_cluster_id = new_cluster.id
                
                # Update the best match to point to this new cluster
                best_match.cluster_id = new_cluster.id

    # Convert UUID to string for DB ID
    grievance_id = str(uuid.uuid4())

    new_grievance = Grievance(
        id=grievance_id,
        citizen_name=request.citizen_name,
        mobile=request.mobile,
        district=request.district,
        complaint_text=request.complaint_text,
        detected_department=detected_dept,
        confidence_score=confidence,
        department=detected_dept, # Set assigned department to detected one
        complaint_embedding=embedding,
        cluster_id=assigned_cluster_id,
        status="Under Investigation",
        priority="High" if confidence > 0.8 else "Medium"
    )
    db.add(new_grievance)
    db.commit()

    # Trigger mock notification
    trigger_notification(
        db=db,
        identifier=grievance_id,
        mobile=request.mobile,
        citizen_name=request.citizen_name,
        event_type="REGISTERED",
        department=detected_dept,
        is_grievance=True
    )

    return {
        "status": "success",
        "grievance_id": grievance_id,
        "department": detected_dept,
        "confidence": confidence,
        "is_duplicate": is_duplicate,
        "cluster_id": assigned_cluster_id,
        "message": f"Grievance successfully routed to {detected_dept}"
    }

@app.get("/grievance-clusters")
async def get_grievance_clusters(db: Session = Depends(get_db)):
    """
    Returns all grievance clusters for the frontend dashboard.
    """
    clusters = db.query(GrievanceCluster).order_by(GrievanceCluster.complaint_count.desc()).all()
    return [
        {
            "cluster_id": c.id,
            "primary_grievance": c.primary_grievance,
            "complaint_count": c.complaint_count,
            "department": c.department
        } for c in clusters
    ]

@app.post("/grievance/predict-sla")
async def predict_grievance_sla(request: SLARequest):
    """
    Predicts the estimated SLA resolution time for a grievance.
    Returns predicted_days and a confidence score.
    """
    result = predict_sla(
        complaint_type=request.complaint_type,
        department=request.department,
        district=request.district
    )
    return {
        "predicted_days": result["predicted_days"],
        "confidence": result["confidence"],
        "message": f"Predicted resolution: {result['predicted_days']} days (Confidence: {int(result['confidence'] * 100)}%)"
    }

@app.post("/application/predict-rejection")
async def predict_application_rejection(request: RejectionRequest):
    """
    Predicts the likelihood of an application being rejected using the
    trained XGBoost model.
    """
    result = predict_rejection(
        age=request.age,
        income=request.income,
        doc_completeness=request.doc_completeness,
        address_match=request.address_match,
        previous_rejection=request.previous_rejection,
    )
    probability_pct = int(result["rejection_probability"] * 100)
    return {
        "rejection_probability": result["rejection_probability"],
        "rejection_probability_pct": probability_pct,
        "risk_level": result["risk_level"],
        "reasons": result["reasons"],
        "message": f"Rejection probability: {probability_pct}%"
    }


# ─── Analytics Endpoints ─────────────────────────────────────────────────────

@app.get("/analytics/overview")
async def analytics_overview(db: Session = Depends(get_db)):
    """KPI summary: totals, resolution rate, average resolution time."""
    from sqlalchemy import func as sqlfunc
    total = db.query(Grievance).count()
    resolved = db.query(Grievance).filter(Grievance.status == "Resolved").count()
    escalated = db.query(Grievance).filter(Grievance.status == "Escalated").count()
    pending = total - resolved - escalated

    # Average resolution_time_days from records that have it
    avg_result = db.query(sqlfunc.avg(Grievance.resolution_time_days)).filter(
        Grievance.resolution_time_days.isnot(None)
    ).scalar()
    avg_days = round(float(avg_result), 1) if avg_result else 0.0

    # Average predicted SLA
    avg_sla = db.query(sqlfunc.avg(Grievance.expected_resolution_time)).filter(
        Grievance.expected_resolution_time.isnot(None)
    ).scalar()
    avg_sla = round(float(avg_sla), 1) if avg_sla else 0.0

    return {
        "total_complaints": total,
        "resolved_complaints": resolved,
        "escalated_complaints": escalated,
        "pending_complaints": pending,
        "resolution_rate_pct": round((resolved / total * 100) if total else 0, 1),
        "avg_resolution_days": avg_days,
        "avg_predicted_sla_days": avg_sla,
    }


@app.get("/analytics/by-department")
async def analytics_by_department(db: Session = Depends(get_db)):
    """Complaint count grouped by department."""
    from sqlalchemy import func as sqlfunc
    rows = db.query(
        sqlfunc.coalesce(Grievance.department, Grievance.detected_department, "Unknown").label("department"),
        sqlfunc.count(Grievance.id).label("count")
    ).group_by("department").order_by(sqlfunc.count(Grievance.id).desc()).all()
    return [{"department": r.department, "count": r.count} for r in rows]


@app.get("/analytics/by-district")
async def analytics_by_district(db: Session = Depends(get_db)):
    """Complaint count grouped by district — used for heatmap."""
    from sqlalchemy import func as sqlfunc
    rows = db.query(
        sqlfunc.coalesce(Grievance.district, "Unknown").label("district"),
        sqlfunc.count(Grievance.id).label("count"),
        sqlfunc.sum(
            sqlfunc.case((Grievance.status == "Resolved", 1), else_=0)
        ).label("resolved")
    ).group_by("district").order_by(sqlfunc.count(Grievance.id).desc()).all()
    return [{"district": r.district, "count": r.count, "resolved": int(r.resolved or 0)} for r in rows]


@app.get("/analytics/by-status")
async def analytics_by_status(db: Session = Depends(get_db)):
    """Complaint count grouped by status."""
    from sqlalchemy import func as sqlfunc
    rows = db.query(
        sqlfunc.coalesce(Grievance.status, "Unknown").label("status"),
        sqlfunc.count(Grievance.id).label("count")
    ).group_by("status").order_by(sqlfunc.count(Grievance.id).desc()).all()
    return [{"status": r.status, "count": r.count} for r in rows]


@app.get("/grievance/status/{grievance_id}")

async def get_grievance_status(grievance_id: str, db: Session = Depends(get_db)):
    """
    Returns the full tracking status for a grievance by its ID (or prefix).
    Used by the citizen self-tracking page.
    """
    # Try exact match first, then substring/prefix match
    g = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not g:
        g = db.query(Grievance).filter(Grievance.id.startswith(grievance_id)).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found")

    # Fetch officer name
    officer_name = "Pending Assignment"
    if g.assigned_officer_id:
        officer = db.query(Officer).filter(Officer.officer_id == g.assigned_officer_id).first()
        if officer:
            officer_name = f"{officer.name} – {officer.department}"

    # Fetch status history
    history = db.query(GrievanceStatusHistory).filter(
        GrievanceStatusHistory.grievance_id == g.id
    ).order_by(GrievanceStatusHistory.updated_at.asc()).all()

    timeline = [{"status": h.status, "updated_by": h.updated_by or "System",
                 "timestamp": h.updated_at.isoformat() if h.updated_at else None}
                for h in history]

    # Ensure at least the initial "Submitted" step
    if not timeline:
        timeline = [{"status": "Submitted", "updated_by": "CSC Operator",
                     "timestamp": g.created_at.isoformat() if g.created_at else None}]

    return {
        "complaint_id": g.id,
        "department": g.department or g.detected_department or "Unknown",
        "officer": officer_name,
        "status": g.status,
        "priority": g.priority,
        "district": g.district,
        "complaint_text": g.complaint_text,
        "citizen_name": g.citizen_name,
        "expected_resolution": g.expected_resolution_time,
        "created_at": g.created_at.isoformat() if g.created_at else None,
        "timeline": timeline,
    }


@app.get("/grievance/by-mobile/{mobile}")
async def get_grievances_by_mobile(mobile: str, db: Session = Depends(get_db)):
    """Returns all grievances filed by a mobile number."""
    grievances = db.query(Grievance).filter(Grievance.mobile == mobile).all()
    if not grievances:
        raise HTTPException(status_code=404, detail="No grievances found for this mobile number")
    return [
        {
            "complaint_id": g.id,
            "department": g.department or g.detected_department or "Unknown",
            "status": g.status,
            "district": g.district,
            "complaint_text": (g.complaint_text or "")[:80],
            "created_at": g.created_at.isoformat() if g.created_at else None,
        }
        for g in grievances
    ]


@app.get("/beneficiaries/all")

async def get_all_beneficiaries(db: Session = Depends(get_db)):
    """
    Returns all citizens along with their enrollment/eligibility status.
    """
    citizens = db.query(Citizen).all()
    results = []
    
    for cit in citizens:
        eligibility = db.query(EligibilityResult).filter(EligibilityResult.citizen_id == cit.citizen_id).all()
        enrollments = db.query(SchemeApplication).filter(SchemeApplication.citizen_id == cit.citizen_id).all()
        
        status = "Pending Enrollment" if eligibility else "Enrolled" if enrollments else "No Flags"
        scheme_name = "N/A"
        reason = ""
        
        if eligibility:
             scheme_obj = db.query(Scheme).filter(Scheme.scheme_id == eligibility[0].scheme_id).first()
             scheme_name = scheme_obj.scheme_name if scheme_obj else "Unknown Scheme"
             reason = eligibility[0].reasoning
        elif enrollments:
             scheme_obj = db.query(Scheme).filter(Scheme.scheme_id == enrollments[0].scheme_id).first()
             scheme_name = scheme_obj.scheme_name if scheme_obj else "Unknown Scheme"
        
        # Only include people with flags or enrollments for the demo dashboard, or optionally everyone
        if status != "No Flags":
            results.append({
                "id": cit.citizen_id,
                "name": cit.full_name,
                "district": cit.district,
                "scheme": scheme_name,
                "status": status,
                "reason": reason,
                "age": cit.age,
                "gender": cit.gender,
                "annual_income": cit.annual_income
            })
        
    return {"data": results}

@app.get("/beneficiaries/district/{district}")
async def get_beneficiaries_by_district(district: str, db: Session = Depends(get_db)):
    """
    Returns all citizens in a district along with their enrollment/eligibility status.
    """
    citizens = db.query(Citizen).filter(Citizen.district == district).all()
    results = []
    
    for cit in citizens:
        eligibility = db.query(EligibilityResult).filter(EligibilityResult.citizen_id == cit.citizen_id).all()
        enrollments = db.query(SchemeApplication).filter(SchemeApplication.citizen_id == cit.citizen_id).all()
        
        status = "Pending Enrollment" if eligibility else "Enrolled" if enrollments else "No Flags"
        scheme_name = "N/A"
        reason = ""
        
        if eligibility:
             scheme_obj = db.query(Scheme).filter(Scheme.scheme_id == eligibility[0].scheme_id).first()
             scheme_name = scheme_obj.scheme_name if scheme_obj else "Unknown Scheme"
             reason = eligibility[0].reasoning
        elif enrollments:
             scheme_obj = db.query(Scheme).filter(Scheme.scheme_id == enrollments[0].scheme_id).first()
             scheme_name = scheme_obj.scheme_name if scheme_obj else "Unknown Scheme"
        
        if status != "No Flags":
            results.append({
                "id": cit.citizen_id,
                "name": cit.full_name,
                "district": cit.district,
                "scheme": scheme_name,
                "status": status,
                "reason": reason,
                "age": cit.age,
                "gender": cit.gender,
                "annual_income": cit.annual_income
            })
        
    return {"data": results}

@app.get("/beneficiaries/scheme/{scheme_name}")
async def get_beneficiaries_by_scheme(scheme_name: str, db: Session = Depends(get_db)):
    """
    Returns all citizens flagged for a specific scheme
    """
    target_scheme = db.query(Scheme).filter(Scheme.scheme_name == scheme_name).first()
    if not target_scheme:
         return {"data": []}

    eligibility = db.query(EligibilityResult).filter(EligibilityResult.scheme_id == target_scheme.scheme_id).all()
    results = []
    
    for el in eligibility:
        cit = db.query(Citizen).filter(Citizen.citizen_id == el.citizen_id).first()
        if cit:
            results.append({
                "id": cit.citizen_id,
                "name": cit.full_name,
                "district": cit.district,
                "scheme": target_scheme.scheme_name,
                "status": "Awaiting Outreach",
                "reason": el.reasoning,
                "age": cit.age,
                "gender": cit.gender,
                "annual_income": cit.annual_income
            })
    return {"data": results}

@app.get("/citizen/{citizen_id}")
async def get_citizen_details(citizen_id: str, db: Session = Depends(get_db)):
    """
    Retrieve full 360-degree view of a single citizen.
    """
    cit = db.query(Citizen).filter(Citizen.citizen_id == citizen_id).first()
    if not cit:
        raise HTTPException(status_code=404, detail="Citizen not found")
        
    eligibility = db.query(EligibilityResult).filter(EligibilityResult.citizen_id == cit.citizen_id).all()
    enrollments = db.query(SchemeApplication).filter(SchemeApplication.citizen_id == cit.citizen_id).all()
    
    flags_list = []
    for e in eligibility:
         scheme_obj = db.query(Scheme).filter(Scheme.scheme_id == e.scheme_id).first()
         if scheme_obj:
              flags_list.append({"scheme": scheme_obj.scheme_name, "reason": e.reasoning, "status": e.status})

    enrollments_list = []
    for e in enrollments:
         scheme_obj = db.query(Scheme).filter(Scheme.scheme_id == e.scheme_id).first()
         if scheme_obj:
              enrollments_list.append({"scheme": scheme_obj.scheme_name, "district": cit.district, "status": e.status})
    
    return {
        "citizen": {
            "id": cit.citizen_id,
            "name": cit.full_name,
            "gender": cit.gender,
            "address": cit.address,
            "district": cit.district,
            "is_deceased": cit.is_deceased,
            "age": cit.age,
            "annual_income": cit.annual_income,
            "caste": cit.caste,
            "mobile_number": cit.mobile_number,
            "aadhar_number": cit.aadhar_number
        },
        "flags": flags_list,
        "enrollments": enrollments_list
    }


@app.get("/citizen/evaluate/{query}")
async def evaluate_citizen_all_schemes(query: str, search_by: str = "name", db: Session = Depends(get_db)):
    """
    Evaluate ALL scheme rules for a citizen.
    search_by: 'name' (default, partial match), 'aadhaar', or 'mobile'
    """
    from typing import Optional
    cit: Optional[Citizen] = None

    if search_by == "aadhaar":
        q = query.strip()
        # Try exact match first, then strip leading zeros, then zero-pad to 12 digits
        cit = (
            db.query(Citizen).filter(Citizen.aadhar_number == q).first() or
            db.query(Citizen).filter(Citizen.aadhar_number == q.lstrip('0')).first() or
            db.query(Citizen).filter(Citizen.aadhar_number == q.zfill(12)).first()
        )
    elif search_by == "citizen_id":
        try:
             citizen_id = int(query.strip())
             cit = db.query(Citizen).filter(Citizen.citizen_id == citizen_id).first()
        except ValueError:
             pass
    elif search_by == "mobile":
        cit = db.query(Citizen).filter(Citizen.mobile_number == query.strip()).first()
    else:
        # Name: partial case-insensitive match
        cit = db.query(Citizen).filter(Citizen.full_name.ilike(f"%{query}%")).first()

    if not cit:
        raise HTTPException(status_code=404, detail="Citizen not found")

    schemes = db.query(Scheme).all()
    rules   = db.query(SchemeRule).all()

    # Group rules by scheme_id
    rules_by_scheme: Dict[int, list] = {}
    for r in rules:
        rules_by_scheme.setdefault(r.scheme_id, []).append(r)

    # Check existing applications / eligibility results
    applications = {a.scheme_id for a in db.query(SchemeApplication).filter(SchemeApplication.citizen_id == cit.citizen_id).all()}
    flagged      = {e.scheme_id for e in db.query(EligibilityResult).filter(EligibilityResult.citizen_id == cit.citizen_id).all()}

    results = []
    for scheme in schemes:
        scheme_rules = rules_by_scheme.get(scheme.scheme_id, [])
        rule_evals = []
        for r in scheme_rules:
            passed = evaluate_rule(cit, r)
            rule_evals.append({
                "field":    r.field,
                "operator": r.operator,
                "required": r.value,
                "actual":   str(getattr(cit, r.field, "N/A")),
                "passed":   passed
            })

        all_pass   = all(re["passed"] for re in rule_evals) if rule_evals else False
        pass_count = sum(1 for re in rule_evals if re["passed"])

        if scheme.scheme_id in applications:
            enrollment_status = "enrolled"
        elif scheme.scheme_id in flagged:
            enrollment_status = "proactive"
        else:
            enrollment_status = "not_applied"

        results.append({
            "scheme_id":         scheme.scheme_id,
            "scheme_name":       scheme.scheme_name,
            "department":        scheme.department,
            "description":       scheme.description,
            "rules":             rule_evals,
            "all_eligible":      all_pass,
            "pass_count":        pass_count,
            "total_rules":       len(rule_evals),
            "enrollment_status": enrollment_status
        })

    # Sort: fully eligible first, then partial, then none
    results.sort(key=lambda x: (-x["all_eligible"], -x["pass_count"]))

    return {
        "citizen": {
            "id":             cit.citizen_id,
            "name":           cit.full_name,
            "age":            cit.age,
            "gender":         cit.gender,
            "district":       cit.district,
            "annual_income":  cit.annual_income,
            "occupation":     cit.occupation,
            "caste":          cit.caste,
        },
        "schemes": results
    }

import os
import shutil
from fastapi import File, UploadFile, Form
from document_engine import DocumentVerificationEngine

# Ensure storage directory exists
os.makedirs("storage/documents", exist_ok=True)

@app.post("/documents/upload")
async def upload_document(
    citizen_id: int = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Simulates uploading a document, running OCR, extracting fields, and storing them.
    """
    # 1. Save file locally
    file_ext = os.path.splitext(file.filename)[1]
    file_path = f"storage/documents/{citizen_id}_{document_type}{file_ext}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 2. Process document (Extract -> Parse -> Store in DB)
    engine = DocumentVerificationEngine(db)
    extracted_fields = engine.process_document(citizen_id, document_type, file_path)
    
    return {
        "status": "success",
        "message": f"Document '{document_type}' processed successfully.",
        "extracted_fields": extracted_fields
    }

@app.post("/documents/verify")
async def verify_documents(citizen_id: int = Form(...), db: Session = Depends(get_db)):
    """
    Runs field comparison across all stored documents for a citizen to detect mismatches.
    """
    engine = DocumentVerificationEngine(db)
    mismatches = engine.detect_mismatches(citizen_id)
    
    status = "mismatch_detected" if mismatches else "verified_clean"
    
    # Calculate an optional rejection risk based on mismatches (Step 10 stub)
    rejection_risk = 0.0
    if mismatches:
        severity_weights = {'minor': 0.1, 'moderate': 0.4, 'critical': 0.8}
        total_weight = sum([severity_weights.get(m['severity'], 0.1) for m in mismatches])
        rejection_risk = round(min(1.0, total_weight / len(mismatches) if len(mismatches) > 0 else 0), 2)
    
    return {
        "citizen_id": citizen_id,
        "status": status,
        "mismatches": mismatches,
        "rejection_risk_score": rejection_risk,
        "correction_guidance": list(set([m['guidance'] for m in mismatches])) if mismatches else []
    }


# ─── Death Records Endpoints ──────────────────────────────────────────────────

@app.get("/death-records")
async def get_all_death_records(db: Session = Depends(get_db)):
    """Returns all death records from the death_records dataset."""
    records = db.query(DeathRecord).all()
    return {"data": [
        {
            "record_id": r.record_id,
            "deceased_name": r.deceased_name,
            "spouse_name": r.spouse_name,
            "village": r.village,
            "district": r.district,
            "death_date": r.death_date,
            "death_certificate_id": r.death_certificate_id,
        } for r in records
    ], "total": len(records)}

@app.get("/death-records/district/{district}")
async def get_death_records_by_district(district: str, db: Session = Depends(get_db)):
    """Returns death records for a specific district."""
    records = db.query(DeathRecord).filter(DeathRecord.district.ilike(f"%{district}%")).all()
    return {"data": [
        {
            "record_id": r.record_id,
            "deceased_name": r.deceased_name,
            "spouse_name": r.spouse_name,
            "village": r.village,
            "district": r.district,
            "death_date": r.death_date,
            "death_certificate_id": r.death_certificate_id,
        } for r in records
    ], "total": len(records)}

# ─── Anomaly Endpoints ────────────────────────────────────────────────────────

@app.get("/anomalies")
async def get_all_anomalies(db: Session = Depends(get_db)):
    """Returns all anomaly cases from the anomaly_cases dataset."""
    cases = db.query(AnomalyCase).all()
    result = []
    for c in cases:
        cit = db.query(Citizen).filter(Citizen.citizen_id == c.citizen_id).first() if c.citizen_id else None
        result.append({
            "case_id": c.case_id,
            "citizen_id": c.citizen_id,
            "citizen_name": cit.full_name if cit else "Unknown",
            "district": cit.district if cit else "Unknown",
            "anomaly_type": c.anomaly_type,
            "description": c.description,
        })
    return {"data": result, "total": len(result)}

@app.get("/anomalies/type/{anomaly_type}")
async def get_anomalies_by_type(anomaly_type: str, db: Session = Depends(get_db)):
    """Returns anomaly cases filtered by type."""
    cases = db.query(AnomalyCase).filter(AnomalyCase.anomaly_type == anomaly_type).all()
    result = []
    for c in cases:
        cit = db.query(Citizen).filter(Citizen.citizen_id == c.citizen_id).first() if c.citizen_id else None
        result.append({
            "case_id": c.case_id,
            "citizen_id": c.citizen_id,
            "citizen_name": cit.full_name if cit else "Unknown",
            "district": cit.district if cit else "Unknown",
            "anomaly_type": c.anomaly_type,
            "description": c.description,
        })
    return {"data": result, "total": len(result)}

# ─── Overview Stats Endpoint ──────────────────────────────────────────────────

@app.get("/stats/overview")
async def get_stats_overview(db: Session = Depends(get_db)):
    """Returns high-level stats about the dataset for dashboard cards."""
    total_citizens = db.query(Citizen).count()
    deceased_citizens = db.query(Citizen).filter(Citizen.is_deceased == True).count()
    total_death_records = db.query(DeathRecord).count()
    total_anomalies = db.query(AnomalyCase).count()
    total_schemes = db.query(Scheme).count()
    total_applications = db.query(SchemeApplication).count()

    # Anomaly breakdown
    anomaly_types = ["income_mismatch", "age_mismatch", "duplicate_aadhar", "deceased_person_application", "invalid_document_data"]
    anomaly_breakdown = {}
    for at in anomaly_types:
        anomaly_breakdown[at] = db.query(AnomalyCase).filter(AnomalyCase.anomaly_type == at).count()

    # Death by district (top 5)
    from sqlalchemy import func
    death_by_district = db.query(DeathRecord.district, func.count(DeathRecord.record_id).label('count'))\
        .group_by(DeathRecord.district).order_by(func.count(DeathRecord.record_id).desc()).limit(5).all()

    return {
        "total_citizens": total_citizens,
        "deceased_citizens": deceased_citizens,
        "total_death_records": total_death_records,
        "total_anomalies": total_anomalies,
        "total_schemes": total_schemes,
        "total_applications": total_applications,
        "anomaly_breakdown": anomaly_breakdown,
        "top_districts_by_deaths": [{"district": d, "count": c} for d, c in death_by_district]
    }


# Proactive Discovery routes moved to end of file

# Old eligible candidates list moved to end of file


# ─── Notification Endpoints ──────────────────────────────────────────────────

@app.post("/notifications/send")
async def send_notification(data: Dict[str, Any], db: Session = Depends(get_db)):
    """Sends a notification to a specific citizen for a scheme."""
    citizen_id = data.get("citizen_id")
    scheme_id = data.get("scheme_id")
    message = data.get("message")

    if not citizen_id or not scheme_id:
        raise HTTPException(status_code=400, detail="Missing citizen_id or scheme_id")

    # Check if exists
    cit = db.query(Citizen).filter(Citizen.citizen_id == citizen_id).first()
    if not cit: raise HTTPException(status_code=404, detail="Citizen not found")

    # Simulate sending
    notif = Notification(
        citizen_id=citizen_id,
        scheme_id=scheme_id,
        message=message or f"Hi {cit.full_name}, you are eligible for the scheme. Please apply soon!",
        status="sent"
    )
    db.add(notif)
    db.commit()
    return {"status": "success", "notification_id": notif.id}

@app.post("/notifications/broadcast")
async def broadcast_notifications(data: Dict[str, Any], db: Session = Depends(get_db)):
    """Sends notifications to all eligible but not-notified citizens for a scheme."""
    scheme_id = data.get("scheme_id")
    if not scheme_id:
        raise HTTPException(status_code=400, detail="Missing scheme_id")

    # 1. Get all eligible for this scheme
    eligible = db.query(EligibilityResult).filter(EligibilityResult.scheme_id == scheme_id).all()
    
    # 2. Get already notified
    already_notified = db.query(Notification).filter(Notification.scheme_id == scheme_id).all()
    notified_ids = {n.citizen_id for n in already_notified}

    count = 0
    for er in eligible:
        if er.citizen_id not in notified_ids:
            cit = db.query(Citizen).filter(Citizen.citizen_id == er.citizen_id).first()
            if not cit or cit.is_deceased: continue
            
            notif = Notification(
                citizen_id=er.citizen_id,
                scheme_id=scheme_id,
                message=f"Hi {cit.full_name}, system has identified you as eligible. Contact CSC soon.",
                status="sent"
            )
            db.add(notif)
            count += 1
    
    db.commit()
    return {"status": "success", "notifications_sent": count}

@app.get("/notifications")
async def get_notifications(citizen_id: int = None, db: Session = Depends(get_db)):
    """Returns notification history."""
    query = db.query(Notification)
    if citizen_id:
        query = query.filter(Notification.citizen_id == citizen_id)
    notifs = query.order_by(Notification.sent_at.desc()).all()
    
    return {"data": [
        {
            "id": n.id,
            "citizen_id": n.citizen_id,
            "scheme_id": n.scheme_id,
            "message": n.message,
            "sent_at": n.sent_at.isoformat(),
            "status": n.status
        } for n in notifs
    ]}

# ─── Grievance System Endpoints ──────────────────────────────────────────────

class GrievanceConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = GrievanceConnectionManager()

@app.websocket("/ws/grievances")
async def websocket_grievances(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Just keep connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

from pydantic import BaseModel
class GrievanceCreate(BaseModel):
    citizen_name: str
    mobile: str
    aadhaar_number: str = None
    district: str
    complaint_text: str

@app.post("/grievances/register")
async def register_grievance(grievance: GrievanceCreate, db: Session = Depends(get_db)):
    # 1. AI Classification
    predicted_category, confidence = classify_complaint(grievance.complaint_text)
    
    # 2. Department Mapping
    mapped_department = predicted_category
    dept_mapping = db.query(DepartmentMapping).filter(DepartmentMapping.category == predicted_category).first()
    if dept_mapping:
        mapped_department = dept_mapping.department

    # 3. Officer Assignment
    assigned_officer = db.query(Officer).filter(
        Officer.department == mapped_department,
        Officer.district == grievance.district
    ).first()
    officer_id = assigned_officer.officer_id if assigned_officer else None

    # 4. Create Grievance
    g_id = str(uuid.uuid4())
    new_g = Grievance(
        id=g_id,
        citizen_name=grievance.citizen_name,
        mobile=grievance.mobile,
        aadhaar_number=grievance.aadhaar_number,
        district=grievance.district,
        complaint_text=grievance.complaint_text,
        category=predicted_category,
        department=mapped_department,
        status="Pending",
        expected_resolution_time=5,
        assigned_officer_id=officer_id
    )
    db.add(new_g)

    # 5. Create History
    history = GrievanceStatusHistory(
        grievance_id=g_id,
        status="Registered",
        updated_by="System"
    )
    db.add(history)
    db.commit()

    # 6. Send registration notification
    trigger_notification(db, g_id, grievance.mobile, grievance.citizen_name, "REGISTERED",
                      department=mapped_department, sla=5)

    import json
    await manager.broadcast(json.dumps({
        "event": "NEW_GRIEVANCE",
        "data": {
            "id": g_id,
            "citizen_name": grievance.citizen_name,
            "department": mapped_department,
            "category": predicted_category,
            "status": "Pending",
            "confidence": confidence
        }
    }))

    return {"message": "Grievance registered successfully", "grievance_id": g_id, "department": mapped_department, "confidence": confidence}

@app.get("/grievances")
async def get_grievances(db: Session = Depends(get_db)):
    grievances = db.query(Grievance).order_by(Grievance.created_at.desc()).limit(100).all()
    results = []
    for g in grievances:
        results.append({
            "id": g.id,
            "citizen_name": g.citizen_name,
            "mobile": g.mobile,
            "district": g.district,
            "category": g.category,
            "department": g.department,
            "status": g.status,
            "created_at": g.created_at.isoformat() if g.created_at else None,
            "expected_resolution_time": g.expected_resolution_time,
            "assigned_officer_id": g.assigned_officer_id
        })
    return results

@app.put("/grievances/{grievance_id}/status")
async def update_grievance_status(grievance_id: str, payload: dict, db: Session = Depends(get_db)):
    new_status = payload.get("status")
    if not new_status:
        raise HTTPException(400, "status required")

    g = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not g:
        raise HTTPException(404, "Grievance not found")
    
    g.status = new_status
    hist = GrievanceStatusHistory(
        grievance_id=grievance_id,
        status=new_status,
        updated_by="Officer"
    )
    db.add(hist)
    db.commit()

    # Auto-notify citizen on every status change
    trigger_notification(db, grievance_id, g.mobile, g.citizen_name, new_status,
                      department=g.department, sla=g.expected_resolution_time or 5)

    import json
    await manager.broadcast(json.dumps({
        "event": "STATUS_UPDATE",
        "data": {
            "id": grievance_id,
            "status": new_status
        }
    }))
    
    return {"message": "Status updated"}

@app.get("/grievances/{grievance_id}/timeline")
async def get_grievance_timeline(grievance_id: str, db: Session = Depends(get_db)):
    """Returns full timeline history for a single grievance."""
    g = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not g:
        raise HTTPException(404, "Grievance not found")
    
    history = db.query(GrievanceStatusHistory).filter(
        GrievanceStatusHistory.grievance_id == grievance_id
    ).order_by(GrievanceStatusHistory.updated_at.asc()).all()
    
    escalations = db.query(EscalationLog).filter(
        EscalationLog.grievance_id == grievance_id
    ).all()

    # Days elapsed
    days_elapsed = (datetime.utcnow() - g.created_at).days if g.created_at else 0
    sla_breached = days_elapsed > (g.expected_resolution_time or 5)

    return {
        "id": g.id,
        "citizen_name": g.citizen_name,
        "mobile": g.mobile,
        "district": g.district,
        "complaint_text": g.complaint_text,
        "category": g.category,
        "department": g.department,
        "status": g.status,
        "created_at": g.created_at.isoformat() if g.created_at else None,
        "expected_resolution_time": g.expected_resolution_time,
        "days_elapsed": days_elapsed,
        "sla_breached": sla_breached,
        "assigned_officer_id": g.assigned_officer_id,
        "timeline": [
            {
                "status": h.status,
                "updated_by": h.updated_by,
                "updated_at": h.updated_at.isoformat() if h.updated_at else None
            } for h in history
        ],
        "escalations": [
            {
                "escalated_to": e.escalated_to,
                "reason": e.reason,
                "escalated_at": e.escalated_at.isoformat() if e.escalated_at else None
            } for e in escalations
        ]
    }

@app.get("/grievances/department/{department}")
async def get_grievances_by_department(department: str, db: Session = Depends(get_db)):
    """Returns grievances for a specific department (Officer Dashboard)."""
    grievances = db.query(Grievance).filter(
        Grievance.department == department
    ).order_by(Grievance.created_at.desc()).limit(50).all()
    
    results = []
    for g in grievances:
        days_elapsed = (datetime.utcnow() - g.created_at).days if g.created_at else 0
        sla_breached = days_elapsed > (g.expected_resolution_time or 5)
        results.append({
            "id": g.id,
            "citizen_name": g.citizen_name,
            "district": g.district,
            "category": g.category,
            "department": g.department,
            "status": g.status,
            "created_at": g.created_at.isoformat() if g.created_at else None,
            "days_elapsed": days_elapsed,
            "sla_breached": sla_breached,
            "expected_resolution_time": g.expected_resolution_time,
            "complaint_text": g.complaint_text
        })
    return results

@app.get("/grievances/departments/list")
async def list_departments(db: Session = Depends(get_db)):
    """Returns list of all distinct departments with complaint counts."""
    rows = db.query(Grievance.department, func.count(Grievance.id).label("count")).group_by(Grievance.department).all()
    return [{"department": r[0], "count": r[1]} for r in rows if r[0]]

@app.post("/grievances/check-sla")
async def check_sla(db: Session = Depends(get_db)):
    """Check all pending grievances for SLA breach and escalate them."""
    import json
    pending = db.query(Grievance).filter(Grievance.status.in_(["Pending", "Under Investigation"])).all()
    escalated_count = 0

    for g in pending:
        if not g.created_at:
            continue
        days_elapsed = (datetime.utcnow() - g.created_at).days
        sla_days = g.expected_resolution_time or 5
        if days_elapsed > sla_days:
            # Mark escalated
            g.status = "Escalated"
            hist = GrievanceStatusHistory(
                grievance_id=g.id,
                status="Escalated",
                updated_by="SLA Monitor"
            )
            db.add(hist)

            # Log escalation
            esc = EscalationLog(
                grievance_id=g.id,
                escalated_to="District Officer",
                reason="SLA Breach (> {} days)".format(sla_days)
            )
            db.add(esc)
            
            # Send Escalation Notification
            trigger_notification(db, g.id, g.mobile, g.citizen_name, "Escalated",
                              department=g.department, sla=sla_days)

            escalated_count += 1

            # Broadcast
            await manager.broadcast(json.dumps({
                "event": "STATUS_UPDATE",
                "data": {"id": g.id, "status": "Escalated", "reason": "SLA Breach"}
            }))

    db.commit()
    return {"message": "SLA check completed", "escalated": escalated_count}

@app.get("/track")
async def get_citizen_tracking(mobile: str = None, track_id: str = None, db: Session = Depends(get_db)):
    """Citizen self-service tracking by mobile or ID (Grievance ID or Application ID)."""
    if not mobile and not track_id:
        raise HTTPException(400, "mobile or track_id parameter required")
    
    response = []

    # 1. Search Grievances
    g_query = db.query(Grievance)
    if mobile:
        g_query = g_query.filter(Grievance.mobile == mobile)
    if track_id:
        g_query = g_query.filter(Grievance.id == track_id)
    
    for g in g_query.all():
        notifs = db.query(GrievanceNotification).filter(GrievanceNotification.grievance_id == g.id).order_by(GrievanceNotification.sent_at.desc()).all()
        response.append({
            "id": g.id,
            "type": "Grievance",
            "citizen_name": g.citizen_name,
            "mobile": g.mobile,
            "status": g.status,
            "department": g.department,
            "created_at": g.created_at.isoformat() if g.created_at else None,
            "is_delayed": (datetime.utcnow() - g.created_at).days > (g.expected_resolution_time or 5) if g.created_at else False,
            "notifications": [
                {"message": n.message, "event_type": n.event_type, "sent_at": n.sent_at.isoformat()} for n in notifs
            ]
        })

    # 2. Search Applications
    app_query = db.query(Application)
    if mobile:
        app_query = app_query.filter(Application.mobile_number == mobile)
    if track_id:
        app_query = app_query.filter(Application.application_id == track_id)
    
    for a in app_query.all():
        notifs = db.query(GrievanceNotification).filter(GrievanceNotification.application_id == a.application_id).order_by(GrievanceNotification.sent_at.desc()).all()
        response.append({
            "id": a.application_id,
            "type": "Service Application",
            "citizen_name": a.citizen_name,
            "mobile": a.mobile_number,
            "status": a.status,
            "department": a.department,
            "service_type": a.service_type,
            "created_at": a.created_at.isoformat(),
            "is_delayed": a.is_delayed,
            "notifications": [
                {"message": n.message, "event_type": n.event_type, "sent_at": n.sent_at.isoformat()} for n in notifs
            ]
        })

    return response

@app.get("/grievances/notifications")
async def get_grievance_notifications(db: Session = Depends(get_db)):
    """Returns recent notifications for the CSC dashboard feed."""
    notifs = db.query(GrievanceNotification).order_by(GrievanceNotification.sent_at.desc()).limit(50).all()
    return [
        {
            "id": n.id,
            "grievance_id": n.grievance_id,
            "application_id": n.application_id,
            "citizen_name": n.citizen_name,
            "message": n.message,
            "event_type": n.event_type,
            "sent_at": n.sent_at.isoformat() if n.sent_at else None
        } for n in notifs
    ]

# --- NEW APPLICATION ENDPOINTS ---

@app.post("/applications/register")
async def register_application(data: dict, db: Session = Depends(get_db)):
    """Registers a new citizen application (Scheme/Certificate)."""
    app_id = f"APP-{uuid.uuid4().hex[:8].upper()}"
    service = data.get("service_type")
    
    # Simple SLA and Dept lookup
    sla_record = db.query(ServiceSLA).filter(ServiceSLA.service_name == service).first()
    sla_days = sla_record.sla_days if sla_record else 5
    dept = sla_record.department if sla_record else "General"
    
    # Try to link to citizen
    citizen_id = None
    aadhar = data.get("aadhaar_number")
    if aadhar:
        citizen = db.query(Citizen).filter(Citizen.aadhar_number == aadhar).first()
        if citizen:
            citizen_id = citizen.citizen_id

    new_app = Application(
        application_id=app_id,
        citizen_id=citizen_id,
        citizen_name=data.get("citizen_name"),
        mobile_number=data.get("mobile_number"),
        service_type=service,
        department=dept,
        status="Submitted",
        submitted_by=data.get("operator_id", "CSC-001"),
        expected_completion=datetime.utcnow() + timedelta(days=sla_days)
    )
    
    # Removed fallback as timedelta is now imported

    db.add(new_app)
    
    # History record
    hist = ApplicationStatusHistory(
        application_id=app_id,
        status="Submitted",
        updated_by="System"
    )
    db.add(hist)
    db.commit()

    # Notification
    trigger_notification(db, app_id, new_app.mobile_number, new_app.citizen_name, "REGISTERED",
                        department=dept, is_grievance=False)

    return {"message": "Application registered", "application_id": app_id, "department": dept}

@app.get("/applications")
async def list_applications(db: Session = Depends(get_db)):
    """Returns all applications for the CSC dashboard."""
    apps = db.query(Application).order_by(Application.created_at.desc()).all()
    return [{
        "id": a.application_id,
        "citizen_name": a.citizen_name,
        "mobile": a.mobile_number,
        "service": a.service_type,
        "department": a.department,
        "status": a.status,
        "created_at": a.created_at.isoformat(),
        "is_delayed": a.is_delayed
    } for a in apps]

@app.get("/applications/{app_id}/timeline")
async def get_application_timeline(app_id: str, db: Session = Depends(get_db)):
    """Returns lifecycle history for an application."""
    history = db.query(ApplicationStatusHistory).filter(ApplicationStatusHistory.application_id == app_id).order_by(ApplicationStatusHistory.timestamp).all()
    return [{
        "status": h.status,
        "updated_by": h.updated_by,
        "timestamp": h.timestamp.isoformat()
    } for h in history]

@app.put("/applications/{app_id}/status")
async def update_application_status(app_id: str, payload: dict, db: Session = Depends(get_db)):
    """Update application status and notify citizen."""
    new_status = payload.get("status")
    app_obj = db.query(Application).filter(Application.application_id == app_id).first()
    if not app_obj: raise HTTPException(404, "Application not found")
    
    app_obj.status = new_status
    hist = ApplicationStatusHistory(
        application_id=app_id,
        status=new_status,
        updated_by=payload.get("officer_id", "Dept Officer")
    )
    db.add(hist)
    db.commit()

    # Notify
    trigger_notification(db, app_id, app_obj.mobile_number, app_obj.citizen_name, new_status,
                        department=app_obj.department, is_grievance=False)
    
    return {"message": "Status updated"}

@app.post("/applications/check-sla")
async def check_application_sla(db: Session = Depends(get_db)):
    """Detect delayed applications and flag them."""
    now = datetime.utcnow()
    delayed = db.query(Application).filter(
        Application.status != "Resolved",
        Application.status != "Approved",
        Application.status != "Rejected",
        Application.expected_completion < now,
        Application.is_delayed == False
    ).all()
    
    count = 0
    for app in delayed:
        app.is_delayed = True
        trigger_notification(db, app.application_id, app.mobile_number, app.citizen_name, "Escalated",
                            department=app.department, is_grievance=False)
        count += 1
    
    db.commit()
    return {"message": "SLA check complete", "delayed_found": count}

class EligibilityCheckRequest(BaseModel):
    aadhaar_id: str

@app.post("/check_scheme_eligibility")
async def check_scheme_eligibility(request: EligibilityCheckRequest):
    """CSC Operator instant eligibility checker."""
    # Normalize input
    search_id = request.aadhaar_id.strip()
    
    # Use the more comprehensive list function
    all_results = get_all_eligible_candidates()
    
    # Filter for the specific aadhaar_id
    citizen_results = [res for res in all_results if res['citizen_id'] == search_id]
    
    if not citizen_results:
        # Check demographics directly to see if the ID is even valid
        import pandas as pd
        from eligibility_engine import AADHAAR_PATH
        aadhaar_df = pd.read_csv(AADHAAR_PATH, dtype={'aadhaar_id': str})
        cit = aadhaar_df[aadhaar_df['aadhaar_id'] == search_id]
        
        if cit.empty:
             return {"citizen_name": "Not Found", "eligible_schemes": [], "error": "Aadhaar number not registered in demographics."}
        
        return {
            "citizen_name": cit.iloc[0]['citizen_name'],
            "eligible_schemes": [],
            "message": "Citizen is registered but does not currently qualify for any schemes based on processed criteria."
        }

    return {
        "citizen_name": citizen_results[0]['full_name'],
        "eligible_schemes": [
            {
                "scheme_name": res['scheme_name'],
                "reason": " / ".join(res['matched_rules']),
                "confidence": 0.95 if not res['already_enrolled'] else 1.0,
                "already_enrolled": res['already_enrolled']
            }
            for res in citizen_results
        ]
    }

@app.get("/beneficiaries/stats")
async def get_beneficiary_stats():
    """Aggregated report for officers."""
    results = discover_beneficiaries()
    
    # Group by scheme
    scheme_counts = {}
    for res in results:
        sch = res['scheme_name']
        scheme_counts[sch] = scheme_counts.get(sch, 0) + 1
        
    # Group by district
    district_counts = {}
    for res in results:
        dist = res['district'].title()
        district_counts[dist] = district_counts.get(dist, 0) + 1
        
    return {
        "total_eligible_unenrolled": len(results),
        "by_scheme": scheme_counts,
        "by_district": district_counts
    }

@app.get("/eligible-candidates")
async def get_eligible_candidates(scheme_id: int = None, caste: str = None):
    """Returns the full list of eligible candidates for the dashboard."""
    print(f"Fetching eligible candidates (scheme_id={scheme_id}, caste={caste})")
    results = get_all_eligible_candidates()
    print(f"Engine returned {len(results)} results")
    
    # Filter by scheme_id
    if scheme_id:
        results = [r for r in results if r['scheme_id'] == scheme_id]
    
    # Filter by caste
    if caste:
        results = [r for r in results if r['caste'].lower() == caste.lower()]
        
    # Summary
    summary = {
        "total_eligible": len(results),
        "not_yet_enrolled": len([r for r in results if not r['already_enrolled']]),
        "already_enrolled": len([r for r in results if r['already_enrolled']]),
        "anomaly_flagged": len([r for r in results if r['has_anomaly_flag']]),
        "debug_flag": "v2_engine_active"
    }
    
    return {
        "data": results,
        "summary": summary
    }

@app.post("/eligible-candidates/run")
async def run_discovery_engine():
    """Trigger a re-scan of the analytics engine."""
    # For demo, just return success
    return {"status": "success", "message": "Engine scan complete"}

@app.post("/notifications/send")
async def send_single_notification(payload: dict, db: Session = Depends(get_db)):
    """Sends a notification to a specific eligible candidate."""
    citizen_id = payload.get('citizen_id')
    # In demo, just return success
    return {"status": "sent", "citizen_id": citizen_id}

@app.post("/notifications/broadcast")
async def broadcast_notifications(payload: dict, db: Session = Depends(get_db)):
    """Broadcasts notifications to all eligible candidates for a scheme."""
    scheme_id = payload.get('scheme_id')
    return {"status": "broadcast_started", "scheme_id": scheme_id}

@app.get("/notifications/all")
async def get_all_notifications(category: str = None, db: Session = Depends(get_db)):
    """Returns all system notifications with optional category filtering."""
    query = db.query(GrievanceNotification)
    
    if category == 'Grievance Alerts':
        query = query.filter(GrievanceNotification.grievance_id != None)
    elif category == 'Application Status':
        query = query.filter(GrievanceNotification.application_id != None)
    
    notifs = query.order_by(GrievanceNotification.sent_at.desc()).limit(100).all()
    return [
        {
            "id": n.id,
            "grievance_id": n.grievance_id,
            "application_id": n.application_id,
            "citizen_name": n.citizen_name,
            "message": n.message,
            "event_type": n.event_type,
            "sent_at": n.sent_at.isoformat() if n.sent_at else None
        } for n in notifs
    ]

@app.get("/notifications/stats")
async def get_notification_stats(db: Session = Depends(get_db)):
    """Provides summary metrics for the notification dashboard."""
    from datetime import datetime, date, timedelta
    today = date.today()
    
    total_today = db.query(GrievanceNotification).filter(
        func.strftime('%Y-%m-%d', GrievanceNotification.sent_at) == today.strftime('%Y-%m-%d')
    ).count()
    
    critical = db.query(GrievanceNotification).filter(GrievanceNotification.event_type == 'Escalated').count()
    resolved = db.query(GrievanceNotification).filter(GrievanceNotification.event_type == 'RESOLVED').count()
    
    # Pending is often inferred or tracked via status
    pending = db.query(Grievance).filter(Grievance.status != 'RESOLVED').count()
    
    return {
        "total_today": total_today,
        "critical": critical,
        "pending": pending,
        "resolved": resolved
    }

if __name__ == "__main__":
    import uvicorn
    from database import init_db
    from eligibility_engine import sync_citizens_from_csv, seed_schemes_and_rules
    from sla_monitor import start_sla_monitor
    # Ensure database is primed for the demo
    init_db()
    sync_citizens_from_csv()
    seed_schemes_and_rules()
    # Start SLA auto-escalation cron service (runs every hour in background)
    start_sla_monitor()
    uvicorn.run(app, host="0.0.0.0", port=8000)
