from database import SessionLocal, Citizen, SchemeRule
from eligibility_engine import evaluate_rule

db = SessionLocal()
cit = db.query(Citizen).filter(Citizen.citizen_id == 1001).first()
rules = db.query(SchemeRule).filter(SchemeRule.scheme_id == 1).all()

print(f"DEBUG: Citizen {cit.full_name} (ID {cit.citizen_id})")
print(f"Age: {cit.age}, Income: {cit.annual_income}, Occup: {cit.occupation}, Gender: {cit.gender}, Caste: {cit.caste}")

for r in rules:
    res = evaluate_rule(cit, r)
    print(f"Rule {r.rule_id}: {r.field} {r.operator} {r.value} -> {'PASS' if res else 'FAIL'}")

db.close()
