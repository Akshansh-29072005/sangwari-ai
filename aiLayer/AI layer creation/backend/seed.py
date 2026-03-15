import pandas as pd
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models

def configure_db():
    print("Ensuring AI layer tables are created (without dropping existing Go tables)...")
    Base.metadata.create_all(bind=engine)

def seed_data(db: Session):
    print("Seeding operators...")
    operator = models.Operator(
        employee_id="EMP001",
        password_hash="testhash", # would be hashed in prod
        email="operator1@sangwari.gov.in",
        department="Revenue"
    )
    db.add(operator)
    
    print("Seeding test citizen...")
    citizen = models.Citizen(
        mobile_number="9999999999",
        mpin_hash="hash"
    )
    db.add(citizen)
    db.flush() # get citizen ID

    master = models.CitizenMaster(
        citizen_id=citizen.id,
        name="Ramesh Kumar",
        age=34,
        gender="male",
        address="Raipur",
        district="Raipur",
        income=120000,
        occupation="Farmer",
        marital_status="Married",
        caste="OBC"
    )
    db.add(master)
    
    print("Seeding schemes...")
    schemes_df = pd.read_csv("../datasets/schemes.csv")
    scheme_rules_df = pd.read_csv("../datasets/scheme_rules.csv")
    
    scheme_map = {}
    for _, row in schemes_df.iterrows():
        s = models.Scheme(
            title=row["scheme_name"],
            description=row["description"],
        )
        db.add(s)
        db.flush()
        scheme_map[row["scheme_id"]] = s.id
        
    for _, row in scheme_rules_df.iterrows():
        scheme_id = scheme_map.get(row["scheme_id"])
        if scheme_id:
            rule = models.SchemeRule(
                scheme_id=scheme_id,
                field_name=row["field"],
                condition=row["operator"],
                value=str(row["value"])
            )
            db.add(rule)
            
    db.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    configure_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
