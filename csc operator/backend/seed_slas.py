from database import SessionLocal, ServiceSLA, init_db

def seed_slas():
    init_db()
    db = SessionLocal()
    
    slas = [
        {"service_name": "Income Certificate", "sla_days": 3, "department": "Revenue Department"},
        {"service_name": "Caste Certificate", "sla_days": 5, "department": "Revenue Department"},
        {"service_name": "Widow Pension", "sla_days": 10, "department": "Social Welfare Department"},
        {"service_name": "Birth Certificate", "sla_days": 7, "department": "Municipal Corporation"},
        {"service_name": "Farmer Insurance", "sla_days": 15, "department": "Agriculture Department"},
    ]
    
    for s in slas:
        existing = db.query(ServiceSLA).filter(ServiceSLA.service_name == s["service_name"]).first()
        if not existing:
            db.add(ServiceSLA(**s))
    
    db.commit()
    db.close()
    print("SLAs seeded successfully!")

if __name__ == "__main__":
    seed_slas()
