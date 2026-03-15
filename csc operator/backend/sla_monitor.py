"""
SLA Monitoring Service
======================
This module runs a background thread that checks all open grievances
every hour and auto-escalates any complaint whose elapsed time has
exceeded the predicted SLA.

Usage (called once from api.py startup):
    from sla_monitor import start_sla_monitor
    start_sla_monitor()
"""

import threading
import time
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from database import SessionLocal, Grievance, EscalationLog, GrievanceStatusHistory, Officer, GrievanceNotification
from ai_classifier import predict_sla

CHECK_INTERVAL_SECONDS = 3600  # Run every 1 hour
DISTRICT_OFFICER_FALLBACK = "DISTRICT_OFFICER_HQ"


def _get_district_officer(db: Session, department: str, district: str) -> str:
    """
    Look up the district-level officer for the given department + district.
    Falls back to the generic district HQ officer id if none found.
    """
    officer = db.query(Officer).filter(
        Officer.department == department,
        Officer.district == district
    ).first()
    if officer:
        return officer.officer_id
    return DISTRICT_OFFICER_FALLBACK


def _log_escalation(db: Session, grievance: Grievance, escalated_to: str, reason: str):
    """Write an escalation log record and a status history entry."""
    log = EscalationLog(
        grievance_id=grievance.id,
        previous_officer=grievance.assigned_officer_id,
        escalated_to=escalated_to,
        reason=reason,
    )
    db.add(log)

    history = GrievanceStatusHistory(
        grievance_id=grievance.id,
        status="Escalated",
        updated_by="SLA_MONITOR",
    )
    db.add(history)


def _send_notification(db: Session, grievance: Grievance, escalated_to: str):
    """Simulate sending a notification message to the district officer."""
    message = (
        f"[SLA BREACH] Grievance {grievance.id[:8]}... "
        f"from {grievance.citizen_name} ({grievance.district}) has exceeded its predicted SLA. "
        f"Complaint: {grievance.complaint_text[:60]}... has been escalated to you."
    )
    notif = GrievanceNotification(
        grievance_id=grievance.id,
        citizen_name=grievance.citizen_name,
        event_type="Escalated",
        message=message,
        delivery_status="simulated",
    )
    db.add(notif)


def _check_and_escalate_grievances():
    """Core hourly job: scan open grievances and escalate SLA breaches."""
    db: Session = SessionLocal()
    try:
        now = datetime.now(tz=timezone.utc)

        # Fetch all open grievances that are not already escalated or resolved
        open_grievances = db.query(Grievance).filter(
            Grievance.status.notin_(["Resolved", "Escalated", "Closed"])
        ).all()

        escalated_count = 0

        for g in open_grievances:
            if g.created_at is None:
                continue

            # Make created_at timezone-aware if needed
            created_utc = g.created_at
            if created_utc.tzinfo is None:
                created_utc = created_utc.replace(tzinfo=timezone.utc)

            elapsed_days = (now - created_utc).total_seconds() / 86400

            # Use stored expected_resolution_time if available, otherwise predict
            sla_days = g.expected_resolution_time
            if not sla_days:
                complaint_type = g.category or "general"
                dept = g.department or g.detected_department or "Unknown"
                district = g.district or "Raipur"
                sla_result = predict_sla(complaint_type, dept, district)
                sla_days = sla_result.get("predicted_days", 5)
                # Cache the prediction back to the DB
                g.expected_resolution_time = sla_days

            if elapsed_days > sla_days:
                # Determine officer to escalate to
                dept = g.department or g.detected_department or "Unknown"
                escalated_to = _get_district_officer(db, dept, g.district or "")

                reason = (
                    f"Elapsed {elapsed_days:.1f} days exceeds predicted SLA of {sla_days} days."
                )
                _log_escalation(db, g, escalated_to, reason)
                _send_notification(db, g, escalated_to)

                # Update grievance
                g.status = "Escalated"
                g.assigned_officer_id = escalated_to
                escalated_count += 1
                print(
                    f"[SLA Monitor] Escalated grievance {g.id[:8]} "
                    f"(elapsed={elapsed_days:.1f}d, sla={sla_days}d) -> officer={escalated_to}"
                )

        db.commit()
        if escalated_count:
            print(f"[SLA Monitor] Escalated {escalated_count} grievances at {now.isoformat()}")
        else:
            print(f"[SLA Monitor] No SLA breaches at {now.isoformat()}")

    except Exception as e:
        db.rollback()
        print(f"[SLA Monitor] Error: {e}")
    finally:
        db.close()


def _monitor_loop():
    """Infinite loop that runs the SLA check every CHECK_INTERVAL_SECONDS."""
    print("[SLA Monitor] Service started. Running every hour.")
    while True:
        _check_and_escalate_grievances()
        time.sleep(CHECK_INTERVAL_SECONDS)


def start_sla_monitor():
    """
    Start the SLA monitoring service as a daemon background thread so it
    does not block the FastAPI server.
    """
    t = threading.Thread(target=_monitor_loop, daemon=True, name="SLAMonitor")
    t.start()
    return t
