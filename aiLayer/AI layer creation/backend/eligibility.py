import re
from sqlalchemy.orm import Session
from models import Scheme, SchemeRule
from schemas import CitizenMasterBase

def evaluate_eligibility(citizen: CitizenMasterBase, db: Session):
    """
    Evaluates citizen attributes against dynamic rule operators from the database
    to calculate eligibility and missing criteria.
    """
    # Convert incoming citizen data into a comparable dictionary
    citizen_dict = citizen.dict()
    # Flatten extra_data into root dict for easier rule evaluation
    if citizen_dict.get('extra_data'):
        for k, v in citizen_dict['extra_data'].items():
            citizen_dict[k] = v
            
    # Fetch all schemes and their rules
    schemes = db.query(Scheme).all()
    
    results = []
    
    for scheme in schemes:
        rules = scheme.rules
        if not rules:
            continue
            
        is_eligible = True
        matched_rules = 0
        total_rules = len(rules)
        unmet_reasons = []
        
        for rule in rules:
            field = rule.field_name
            op = rule.condition
            val = rule.value
            
            c_val = citizen_dict.get(field)
            
            # If citizen doesn't have the field at all, they fail this rule
            if c_val is None:
                is_eligible = False
                unmet_reasons.append(f"Missing information for {field}")
                continue
                
            # Evaluate condition
            rule_passed = False
            try:
                if op == '>=':
                    rule_passed = float(c_val) >= float(val)
                elif op == '<=':
                    rule_passed = float(c_val) <= float(val)
                elif op == '>':
                    rule_passed = float(c_val) > float(val)
                elif op == '<':
                    rule_passed = float(c_val) < float(val)
                elif op == '==':
                    rule_passed = str(c_val).lower() == str(val).lower()
                elif op == '!=':
                    rule_passed = str(c_val).lower() != str(val).lower()
                elif op.lower() == 'in':
                    # Parse comma separated values
                    allowed_vals = [v.strip().lower() for v in val.split(',')]
                    rule_passed = str(c_val).lower() in allowed_vals
            except ValueError:
                # Type mismatch during float parsing means evaluate as strings if possible
                if op == '==':
                    rule_passed = str(c_val).lower() == str(val).lower()
                elif op.lower() == 'in':
                    allowed_vals = [v.strip().lower() for v in val.split(',')]
                    rule_passed = str(c_val).lower() in allowed_vals
                else:
                    rule_passed = False
                    
            if rule_passed:
                matched_rules += 1
            else:
                is_eligible = False
                unmet_reasons.append(f"{field} ({c_val}) does not meet requirement: {op} {val}")
                
        # Calculate coverage score / confidence
        score = (matched_rules / total_rules) * 100 if total_rules > 0 else 0
        
        results.append({
            "scheme_id": str(scheme.id),
            "scheme_name": scheme.title,
            "department": getattr(scheme, 'department', ''),
            "is_eligible": is_eligible,
            "match_score": round(score, 2),
            "unmet_reasons": unmet_reasons
        })
        
    # Sort results: eligible first, then by match_score descending
    results.sort(key=lambda x: (not x['is_eligible'], -x['match_score']))
    return results
