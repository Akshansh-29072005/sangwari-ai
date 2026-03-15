import pandas as pd
import json
import uuid
import random
from database import SessionLocal, Citizen, Scheme, SchemeRule, SchemeApplication, DeathRecord, AnomalyCase, Grievance, DepartmentMapping, Officer, init_db

def load_data():
    db = SessionLocal()

    # ── 1. Citizens ──────────────────────────────────────────────────────────
    print("Loading citizens...")
    citizens_df = pd.read_csv("datasets/citizens_master.csv", dtype={
        'aadhar_number': str,
        'mobile_number': str,
        'pincode': str,
        'citizen_id': str
    })
    for _, row in citizens_df.iterrows():
        citizen = Citizen(
            citizen_id=int(row['citizen_id']),
            full_name=str(row['full_name']),
            dob=str(row['dob']),
            age=int(row['age']),
            gender=str(row['gender']),
            district=str(row['district']),
            village_or_city=str(row['village_or_city']),
            address=str(row['address']),
            pincode=int(row['pincode']),
            occupation=str(row['occupation']),
            annual_income=float(row['annual_income']),
            marital_status=str(row['marital_status']) if 'marital_status' in row and pd.notna(row['marital_status']) else None,
            caste=str(row['caste']) if pd.notna(row['caste']) else None,
            aadhar_number=str(row['aadhar_number']).strip().zfill(12),

            mobile_number=str(row['mobile_number']).strip(),
            is_deceased=False
        )
        db.merge(citizen)
    db.commit()
    print(f"  Loaded {len(citizens_df)} citizens.")

    # ── 2. Schemes ────────────────────────────────────────────────────────────
    print("Loading schemes...")
    schemes_df = pd.read_csv("datasets/schemes.csv")
    for _, row in schemes_df.iterrows():
        scheme = Scheme(
            scheme_id=int(row['scheme_id']),
            scheme_name=str(row['scheme_name']),
            department=str(row['department']),
            description=str(row['description'])
        )
        db.merge(scheme)
    db.commit()
    print(f"  Loaded {len(schemes_df)} schemes.")

    # ── 3. Scheme Rules ───────────────────────────────────────────────────────
    print("Loading scheme rules...")
    rules_df = pd.read_csv("datasets/scheme_rules.csv")
    for _, row in rules_df.iterrows():
        rule = SchemeRule(
            rule_id=int(row['rule_id']),
            scheme_id=int(row['scheme_id']),
            field=str(row['field']),
            operator=str(row['operator']),
            value=str(row['value'])
        )
        db.merge(rule)
    db.commit()
    print(f"  Loaded {len(rules_df)} scheme rules.")

    # ── 4. Scheme Applications ────────────────────────────────────────────────
    print("Loading scheme applications...")
    apps_df = pd.read_csv("datasets/scheme_applications.csv")
    for _, row in apps_df.iterrows():
        app = SchemeApplication(
            application_id=int(row['application_id']),
            citizen_id=int(row['citizen_id']),
            scheme_id=int(row['scheme_id']),
            application_data_json=str(row['application_data_json']),
            approval_confidence=float(row['approval_confidence']),
            status=str(row['status'])
        )
        db.merge(app)
    db.commit()
    print(f"  Loaded {len(apps_df)} scheme applications.")

    # ── 5. Death Records ──────────────────────────────────────────────────────
    print("Loading death records...")
    death_df = pd.read_csv("datasets/death_records.csv")
    
    # Build a set of (normalized_name, district) from death records for cross-matching
    deceased_keys = set()
    for _, row in death_df.iterrows():
        dr = DeathRecord(
            record_id=str(row['record_id']),
            deceased_name=str(row['deceased_name']).strip(),
            spouse_name=str(row['spouse_name']).strip() if pd.notna(row['spouse_name']) and str(row['spouse_name']).strip() else None,
            village=str(row['village']).strip(),
            district=str(row['district']).strip(),
            death_date=str(row['death_date']).strip(),
            death_certificate_id=str(row['death_certificate_id']).strip()
        )
        db.merge(dr)
        # Normalize for matching: lowercase, remove spaces
        norm_name = str(row['deceased_name']).strip().lower().replace(' ', '').replace('.', '')
        norm_dist = str(row['district']).strip().lower()
        deceased_keys.add((norm_name, norm_dist))
    db.commit()
    print(f"  Loaded {len(death_df)} death records.")

    # Mark citizens as deceased if name+district matches death records
    print("Cross-referencing citizens with death records...")
    all_citizens = db.query(Citizen).all()
    marked = 0
    for cit in all_citizens:
        norm_name = cit.full_name.strip().lower().replace(' ', '').replace('.', '')
        # Strip suffixes like " 1", " 2", " 3" etc for matching
        import re
        norm_name_clean = re.sub(r'\s*\d+$', '', cit.full_name.strip()).lower().replace(' ', '').replace('.', '')
        norm_dist = cit.district.strip().lower()
        if (norm_name, norm_dist) in deceased_keys or (norm_name_clean, norm_dist) in deceased_keys:
            cit.is_deceased = True
            marked += 1
    db.commit()
    print(f"  Marked {marked} citizens as deceased from death records.")

    # ── 6. Anomaly Cases ──────────────────────────────────────────────────────
    print("Loading anomaly cases...")
    anomaly_df = pd.read_csv("datasets/anomaly_cases.csv")
    for _, row in anomaly_df.iterrows():
        cid = int(row['citizen_id'])
        # Only load if citizen exists in DB (foreign key safety)
        cit_exists = db.query(Citizen).filter(Citizen.citizen_id == cid).first()
        case = AnomalyCase(
            case_id=int(row['case_id']),
            citizen_id=cid if cit_exists else None,
            anomaly_type=str(row['anomaly_type']),
            description=str(row['description'])
        )
        db.merge(case)
    db.commit()
    print(f"  Loaded {len(anomaly_df)} anomaly cases.")

    # ── 7. Grievances, Department Mappings, and Officers ─────────────────────
    print("Loading grievances, mappings, and officers...")
    try:
        grievances_df = pd.read_csv("datasets/grievances_dataset.csv")
    except FileNotFoundError:
        print("  grievances_dataset.csv not found. Skipping grievance load.")
        grievances_df = pd.DataFrame()

    if not grievances_df.empty:
        # Generate Department Mappings
        print("  Generating Department Mappings...")
        mapping_df = grievances_df[['complaint_text', 'department']].dropna()
        # For mapping, we'll try to find categories or just map common complaint texts to departments.
        # Actually, let's group by typical complaint intents.
        # The prompt mentioned "category" but the dataset seems to have 'complaint_text' and 'department'.
        # Let's extract 'category' from the dataset if it exists, else we'll mock it based on unique departments for now.
        if 'category' in grievances_df.columns:
            mappings = grievances_df[['category', 'department']].drop_duplicates().dropna()
        else:
            # Create dummy categories based on departments if category missing
            mappings = pd.DataFrame({'category': grievances_df['department'].unique(), 'department': grievances_df['department'].unique()})
            # Add 'category' column to grievances to use for AI
            grievances_df['category'] = grievances_df['department']

        for _, row in mappings.iterrows():
            dm = DepartmentMapping(
                category=str(row['category']),
                department=str(row['department'])
            )
            db.merge(dm)
        
        # Generate Officers based on unique (department, district) from citizens and grievances
        print("  Generating Officers...")
        # Since grievance dataset might not have district, we assign random from citizens or just create district generic officers
        districts = all_citizens = [c.district for c in db.query(Citizen).distinct(Citizen.district).all()]
        if not districts:
            districts = ["Raipur", "Bhilai", "Bilaspur", "Korba", "Raigarh"]
        
        depts = grievances_df['department'].unique()
        officer_ids = []
        for dept in depts:
            for dist in set(districts):
                off_id = str(uuid.uuid4())
                off = Officer(
                    officer_id=off_id,
                    name=f"Officer {dist} {dept[:5]}",
                    department=str(dept),
                    district=str(dist),
                    email=f"officer.{dist.lower()}.{dept[:5].lower().replace(' ', '')}@gov.in"
                )
                db.merge(off)
                officer_ids.append(off_id)

        db.commit()

        # Load Grievances (only those with a real citizen)
        print("  Loading Grievances...")
        # Get officers mapping { (dept, dist): officer_id }
        officer_map = {(o.department, o.district): o.officer_id for o in db.query(Officer).all()}
        
        loaded_count = 0
        skipped_count = 0
        for _, row in grievances_df.iterrows():
            cid = int(row['citizen_id']) if 'citizen_id' in row and pd.notna(row['citizen_id']) else None
            cit_obj = db.query(Citizen).filter(Citizen.citizen_id == cid).first() if cid else None
            
            # -- ONLY load grievances tied to real citizens --
            if not cit_obj:
                skipped_count += 1
                continue

            district = cit_obj.district
            dept = str(row['department'])
            assigned_off = officer_map.get((dept, district), officer_ids[0] if officer_ids else None)

            g = Grievance(
                id=str(row['complaint_id']) if 'complaint_id' in row else str(uuid.uuid4()),
                citizen_name=cit_obj.full_name,
                mobile=cit_obj.mobile_number,
                aadhaar_number=cit_obj.aadhar_number,
                district=district,
                complaint_text=str(row['complaint_text']),
                category=str(row['category']) if 'category' in row else dept,
                department=dept,
                status="Pending",
                assigned_officer_id=assigned_off,
                resolution_time_days=int(row['resolution_time_days']) if 'resolution_time_days' in row and pd.notna(row['resolution_time_days']) else None,
                expected_resolution_time=5
            )
            db.merge(g)
            loaded_count += 1
        db.commit()
        print(f"  Loaded {loaded_count} real grievances. Skipped {skipped_count} (no matching citizen).")

    db.close()
    print("\n✅ ETL completed successfully — all real datasets loaded.")

if __name__ == "__main__":
    init_db()
    load_data()
