import sqlite3
import sys
sys.path.insert(0, 'backend')

conn = sqlite3.connect('backend/nagarikai.db')
c = conn.cursor()

# Get all scheme rules
rules = c.execute("SELECT rule_id, scheme_id, field, operator, value FROM scheme_rules").fetchall()
schemes = {r[0]: r[1] for r in c.execute("SELECT scheme_id, scheme_name FROM schemes").fetchall()}
scheme_names = {r[0]: r[1] for r in c.execute("SELECT scheme_id, scheme_name FROM schemes").fetchall()}

# Group rules by scheme
rules_by_scheme = {}
for rule_id, scheme_id, field, operator, value in rules:
    rules_by_scheme.setdefault(scheme_id, []).append((field, operator, value))

# Evaluate each citizen against each scheme
citizens = c.execute("""
    SELECT citizen_id, full_name, aadhar_number, mobile_number, district,
           age, gender, annual_income, caste, occupation
    FROM citizens
""").fetchall()

eligible = []

def eval_rule(citizen_dict, field, op, value):
    attr = citizen_dict.get(field)
    if attr is None:
        return False
    try:
        if isinstance(attr, (int, float)):
            value = float(value)
        else:
            attr = str(attr).lower()
            value = str(value).lower()
    except:
        attr = str(attr).lower()
        value = str(value).lower()

    if op in ("==", "="):   return attr == value
    elif op == ">":         return float(attr) > float(value)
    elif op == "<":         return float(attr) < float(value)
    elif op == ">=":        return float(attr) >= float(value)
    elif op == "<=":        return float(attr) <= float(value)
    elif op.lower() == "in": return str(attr).lower() in [v.strip().lower() for v in str(value).split(",")]
    elif op == "!=":        return str(attr).lower() != str(value).lower()
    return False

fields = ['citizen_id','full_name','aadhar_number','mobile_number','district','age','gender','annual_income','caste','occupation']

for row in citizens:
    cit = dict(zip(fields, row))
    for scheme_id, scheme_rules in rules_by_scheme.items():
        results = [eval_rule(cit, f, op, v) for f, op, v in scheme_rules]
        if all(results) and len(results) > 0:
            eligible.append({
                'name': cit['full_name'],
                'aadhaar': cit['aadhar_number'],
                'mobile': cit['mobile_number'],
                'district': cit['district'],
                'scheme': scheme_names.get(scheme_id, '?'),
                'pass': f"{sum(results)}/{len(results)} rules"
            })

conn.close()
# Remove temp file
import os

print(f"\n{'Name':<25} {'Aadhaar':<15} {'Mobile':<14} {'District':<18} {'Scheme':<35} Rules")
print("-"*115)
for e in eligible[:40]:
    print(f"{e['name']:<25} {e['aadhaar']:<15} {e['mobile']:<14} {e['district']:<18} {e['scheme']:<35} {e['pass']}")

print(f"\nTotal fully eligible (first 40 shown): {len(eligible)}")
