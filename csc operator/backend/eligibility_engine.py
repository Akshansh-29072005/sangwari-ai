import pandas as pd
import json
import os
from typing import Dict, Any, List
from database import SessionLocal, Citizen, Scheme, SchemeRule, SchemeApplication, EligibilityResult, DeathRecord

# Dataset Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset.1")
AADHAAR_PATH = os.path.join(DATASET_DIR, "aadhaar_demographics.csv")
RATION_PATH = os.path.join(DATASET_DIR, "ration_card_family.csv")
DEATH_PATH = os.path.join(DATASET_DIR, "death_records (1).csv")
ENROLLMENT_PATH = os.path.join(DATASET_DIR, "scheme_enrollment.csv")
LAND_PATH = os.path.join(DATASET_DIR, "land_farmer_records.csv")

def evaluate_rule(citizen: Citizen, rule: SchemeRule) -> bool:
    """Evaluates a single rule against a citizen's attributes."""
    try:
        attribute_value = getattr(citizen, rule.field)
    except AttributeError:
        return False

    operator = rule.operator
    rule_value = rule.value

    if isinstance(attribute_value, int) or isinstance(attribute_value, float):
        try:
            rule_value = float(rule_value)
        except ValueError:
            pass

    if isinstance(attribute_value, str):
        attribute_value = attribute_value.lower()
        rule_value = str(rule_value).lower()
        
    if operator in ["==", "="]:
         if isinstance(attribute_value, str):
              return attribute_value == rule_value
         return attribute_value == float(rule_value)
    elif operator == ">":
         return float(attribute_value) > float(rule_value)
    elif operator == "<":
         return float(attribute_value) < float(rule_value)
    elif operator == ">=":
         return float(attribute_value) >= float(rule_value)
    elif operator == "<=":
         return float(attribute_value) <= float(rule_value)
    elif operator == "!=":
         if isinstance(attribute_value, str):
              return attribute_value != rule_value
         return attribute_value != float(rule_value)
    elif operator.lower() == "in":
         valid_values = [v.strip().lower() for v in str(rule_value).split(',')]
         return str(attribute_value).lower() in valid_values
    return False

def normalize_string(s: Any) -> str:
    if pd.isna(s):
        return ""
    return str(s).strip().lower()

def load_and_clean_data():
    """Loads all 5 datasets and applies standardization."""
    print("Loading and cleaning datasets...")
    
    # Load with string types for IDs to avoid scientific notation or rounding
    aadhaar_df = pd.read_csv(AADHAAR_PATH, dtype={'aadhaar_id': str})
    ration_df = pd.read_csv(RATION_PATH, dtype={'aadhaar_id': str})
    death_df = pd.read_csv(DEATH_PATH, dtype={'aadhaar_id': str})
    enrollment_df = pd.read_csv(ENROLLMENT_PATH, dtype={'aadhaar_id': str})
    land_df = pd.read_csv(LAND_PATH, dtype={'aadhaar_id': str})
    
    # Cleaning
    for df in [aadhaar_df, ration_df, death_df, enrollment_df, land_df]:
        for col in df.columns:
            if df[col].dtype == 'object':
                df[col] = df[col].apply(normalize_string)
    
    return aadhaar_df, ration_df, death_df, enrollment_df, land_df

def build_household_map(ration_df: pd.DataFrame):
    """Creates a mapping of family_id -> list of members with relationships."""
    household_map = {}
    for _, row in ration_df.iterrows():
        f_id = row['family_id']
        if f_id not in household_map:
            household_map[f_id] = []
        household_map[f_id].append({
            'aadhaar_id': row['aadhaar_id'],
            'name': row['member_name'],
            'relation': row['relation_to_head'],
            'income_category': row['income_category']
        })
    return household_map

def discover_beneficiaries():
    """Main discovery logic."""
    print("Starting Beneficiary Discovery Engine...")
    
    aadhaar_df, ration_df, death_df, enrollment_df, land_df = load_and_clean_data()
    household_map = build_household_map(ration_df)
    
    # Create fast lookup for enrollment (aadhaar_id -> set of schemes)
    enrollment_map = {}
    for _, row in enrollment_df.iterrows():
        a_id = row['aadhaar_id']
        if a_id not in enrollment_map:
            enrollment_map[a_id] = set()
        enrollment_map[a_id].add(row['scheme_name'])
        
    # Create fast lookup for land (aadhaar_id -> land_area)
    land_map = land_df.set_index('aadhaar_id')['land_area_acres'].to_dict()
    
    # Create set of deceased aadhaar_ids
    deceased_ids = set(death_df['aadhaar_id'].tolist())
    
    new_results = []
    
    # Iterate through all citizens in demographics
    for _, citizen in aadhaar_df.iterrows():
        a_id = citizen['aadhaar_id']
        
        # Skip if deceased
        if a_id in deceased_ids:
            continue
            
        eligible_schemes = []
        
        # 1. Rule: Widow Pension
        # Female + Spouse Deceased + BPL + Age >= 18 + Not Enrolled
        if citizen['gender'] == 'female' and int(citizen['age']) >= 18:
            # Find in ration card to get family_id and income_category
            cit_ration = ration_df[ration_df['aadhaar_id'] == a_id]
            if not cit_ration.empty:
                f_id = cit_ration.iloc[0]['family_id']
                income = cit_ration.iloc[0]['income_category']
                if income == 'bpl':
                    # Check if spouse is deceased
                    # Widow detection: If married (head or wife) and spouse is in deceased list
                    family_members = household_map.get(f_id, [])
                    spouse_deceased = False
                    
                    # If she is wife, check head. If she is head, check if there's a husband (usually not in simple ration data but let's look)
                    for member in family_members:
                        if member['aadhaar_id'] != a_id:
                            # If she is wife, spouse is Head. If she is head, spouse is Wife (but she's female, so usually she's wife)
                            if (cit_ration.iloc[0]['relation_to_head'] == 'wife' and member['relation'] == 'head') or \
                               (cit_ration.iloc[0]['relation_to_head'] == 'head' and member['relation'] == 'husband'): # Added husband for completeness
                                if member['aadhaar_id'] in deceased_ids:
                                    spouse_deceased = True
                                    break
                    
                    if spouse_deceased and 'widow pension' not in enrollment_map.get(a_id, set()):
                        eligible_schemes.append({
                            'scheme': 'Widow Pension',
                            'reason': 'Detected deceased spouse in family records and BPL status.',
                            'score': 0.95
                        })

        # 2. Rule: Farmer Welfare (PM Kisan)
        # Land owner + Area > 0 + Not Enrolled
        if a_id in land_map and float(land_map[a_id]) > 0:
            if 'pm kisan' not in enrollment_map.get(a_id, set()) and 'farmer scheme' not in enrollment_map.get(a_id, set()):
                eligible_schemes.append({
                    'scheme': 'Farmer Welfare Scheme',
                    'reason': f"Agricultural land owner ({land_map[a_id]} acres) not currently enrolled.",
                    'score': 0.90
                })

        # 3. Rule: Senior Citizen Pension
        # Age >= 60 + BPL + Not Enrolled
        if int(citizen['age']) >= 60:
            # Check BPL from ration card
            cit_ration = ration_df[ration_df['aadhaar_id'] == a_id]
            if not cit_ration.empty and cit_ration.iloc[0]['income_category'] == 'bpl':
                if 'old age pension' not in enrollment_map.get(a_id, set()) and 'senior citizen pension' not in enrollment_map.get(a_id, set()):
                    eligible_schemes.append({
                        'scheme': 'Senior Citizen Pension',
                        'reason': 'Citizen age matches criteria and belongs to BPL category.',
                        'score': 0.88
                    })

        # Record findings
        for es in eligible_schemes:
            new_results.append({
                'citizen_id': a_id,
                'citizen_name': citizen['citizen_name'],
                'district': citizen['district'],
                'scheme_name': es['scheme'],
                'reasoning': es['reason'],
                'confidence_score': es['score']
            })

    print(f"Discovery complete. Identified {len(new_results)} potential beneficiaries.")
    return new_results

def save_to_db(results):
    db = SessionLocal()
    # For now, we'll map aadhaar_id back to our database citizen_id if exists
    # If not, we might need a separate table or just return JSON for the checker
    # Let's see if we can add them to EligibilityResult
    from database import Citizen, Scheme, EligibilityResult
    
    count = 0
    for res in results:
        cit = db.query(Citizen).filter(Citizen.aadhar_number == res['citizen_id']).first()
        sch = db.query(Scheme).filter(Scheme.scheme_name == res['scheme_name']).first()
        
        if cit and sch:
            # Check if exists
            existing = db.query(EligibilityResult).filter(
                EligibilityResult.citizen_id == cit.citizen_id,
                EligibilityResult.scheme_id == sch.scheme_id
            ).first()
            
            if not existing:
                er = EligibilityResult(
                    citizen_id=cit.citizen_id,
                    scheme_id=sch.scheme_id,
                    status="Eligible - Proactive discovery",
                    reasoning=json.dumps({"reason": res['reasoning'], "score": res['confidence_score']})
                )
                db.add(er)
                count += 1
    
    db.commit()
    db.close()
    print(f"Saved {count} new eligibility results to database.")

def get_all_eligible_candidates():
    """Returns a full list of eligible candidates (enrolled and unenrolled) for the dashboard."""
    aadhaar_df, ration_df, death_df, enrollment_df, land_df = load_and_clean_data()
    household_map = build_household_map(ration_df)
    
    # Lookup maps
    enrollment_map = {}
    for _, row in enrollment_df.iterrows():
        a_id = row['aadhaar_id']
        if a_id not in enrollment_map: enrollment_map[a_id] = set()
        enrollment_map[a_id].add(row['scheme_name'].lower())
        
    land_map = land_df.set_index('aadhaar_id')['land_area_acres'].to_dict()
    deceased_ids = set(death_df['aadhaar_id'].tolist())
    
    # NEW: Fetch applications from database to sync enrollment status
    db = SessionLocal()
    from database import Application, Citizen as DB_Citizen # Avoid conflict
    db_apps = db.query(Application).all()
    for app in db_apps:
        # Link application to Aadhaar ID
        a_id = None
        if app.citizen_id:
            cit_record = db.query(DB_Citizen).filter(DB_Citizen.citizen_id == app.citizen_id).first()
            if cit_record: a_id = cit_record.aadhar_number
        
        if a_id:
            if a_id not in enrollment_map: enrollment_map[a_id] = set()
            enrollment_map[a_id].add(app.service_type.lower())
    db.close()

    # Caste & Occupation synthesis (mocking since not in CSVs)
    districts = aadhaar_df['district'].unique()
    
    final_list = []
    
    for _, citizen in aadhaar_df.iterrows():
        a_id = citizen['aadhaar_id']
        if a_id in deceased_ids: continue
        
        eligible_schemes = []
        is_bpl = False
        cit_ration = ration_df[ration_df['aadhaar_id'] == a_id]
        if not cit_ration.empty:
            is_bpl = (cit_ration.iloc[0]['income_category'] == 'bpl')
            
        # Widow Rule
        if citizen['gender'] == 'female' and int(citizen['age']) >= 18 and is_bpl:
            f_id = cit_ration.iloc[0]['family_id']
            spouse_deceased = False
            for member in household_map.get(f_id, []):
                if member['aadhaar_id'] != a_id and member['aadhaar_id'] in deceased_ids:
                    spouse_deceased = True
                    break
            if spouse_deceased:
                eligible_schemes.append({
                    'id': 2, 'name': 'Widow Pension', 'desc': 'Financial aid for widows in BPL households.',
                    'dept': 'Social Welfare', 'rule': 'BPL + Deceased Spouse'
                })

        # Farmer Rule
        if a_id in land_map and float(land_map[a_id]) > 0:
            eligible_schemes.append({
                'id': 3, 'name': 'PM Kisan', 'desc': 'Income support for land-holding farmer families.', # Changed to match SCHEME_IDS in frontend mapping if possible or just use name
                'dept': 'Agricultural', 'rule': f"Land Owner ({land_map[a_id]} acres)"
            })
            # Also generic farmer welfare if needed
            eligible_schemes.append({
                'id': 5, 'name': 'Family Assistance Scheme', 'desc': 'General aid for rural households.',
                'dept': 'Rural Development', 'rule': 'Rural Land Holder'
            })

        # Senior Rule
        if int(citizen['age']) >= 60 and is_bpl:
            eligible_schemes.append({
                'id': 1, 'name': 'Old Age Pension', 'desc': 'Monthly pension for senior citizens in BPL category.',
                'dept': 'Social Welfare', 'rule': 'Age 60+ BPL'
            })

        # Map to final format
        for es in eligible_schemes:
            already_enrolled = (es['name'].lower() in enrollment_map.get(a_id, set()))
            
            # Synthesize income based on BPL or Land
            annual_income = 48000 if is_bpl else 120000
            if a_id in land_map: annual_income += int(float(land_map[a_id]) * 15000)

            final_list.append({
                'citizen_id': a_id,
                'full_name': citizen['citizen_name'],
                'age': int(citizen['age']),
                'gender': citizen['gender'].capitalize(),
                'dob': citizen['dob'],
                'caste': 'OBC' if int(a_id) % 3 == 0 else 'General', # Synthetic
                'district': citizen['district'].title(),
                'village_or_city': citizen['village'].title(),
                'occupation': 'Farmer' if a_id in land_map else 'Laborer' if is_bpl else 'Small Business',
                'annual_income': annual_income,
                'aadhar_number': a_id,
                'mobile_number': citizen['mobile_number'],
                'scheme_name': es['name'],
                'scheme_id': es['id'],
                'scheme_description': es['desc'],
                'scheme_department': es['dept'],
                'already_enrolled': already_enrolled,
                'has_anomaly_flag': False, # For now
                'notified': False, # Tracked in separate table usually
                'matched_rules': [es['rule'], 'BPL Status' if is_bpl else 'Income Check']
            })
            
    return final_list

def sync_citizens_from_csv():
    """Syncs Aadhaar demographics CSV to the database Citizen table."""
    print("Syncing citizens from CSV to database...")
    aadhaar_df, ration_df, death_df, _, land_df = load_and_clean_data()
    db = SessionLocal()
    
    # Create land map for income synthesis
    land_map = land_df.set_index('aadhaar_id')['land_area_acres'].to_dict()
    # Create ration map for BPL status
    ration_bpl = ration_df[ration_df['income_category'] == 'bpl']['aadhaar_id'].unique()
    # Create household map for relationship check
    household_map = build_household_map(ration_df)
    # Deceased IDs
    deceased_ids = set(death_df['aadhaar_id'].tolist())
    
    count = 0
    for _, row in aadhaar_df.iterrows():
        a_id = row['aadhaar_id']
        if a_id in deceased_ids: continue # Don't sync deceased to main table? Or mark deceased
        
        # Check if already exists
        existing = db.query(Citizen).filter(Citizen.aadhar_number == a_id).first()
        
        is_bpl = a_id in ration_bpl
        annual_income = 48000 if is_bpl else 120000
        if a_id in land_map: annual_income += int(float(land_map[a_id]) * 15000)
        
        # Detect Marital Status (Widow Detection)
        marital_status = "Married"
        cit_ration = ration_df[ration_df['aadhaar_id'] == a_id]
        if not cit_ration.empty:
            f_id = cit_ration.iloc[0]['family_id']
            for member in household_map.get(f_id, []):
                if member['aadhaar_id'] != a_id and member['aadhaar_id'] in deceased_ids:
                    # Very simple relationship check
                    if (cit_ration.iloc[0]['relation_to_head'] == 'wife') or (cit_ration.iloc[0]['relation_to_head'] == 'head'):
                         marital_status = "Widow" if row['gender'] == 'female' else "Widower"
        
        if not existing:
            cit = Citizen(
                full_name=row['citizen_name'],
                dob=row['dob'],
                age=int(row['age']),
                gender=row['gender'].capitalize(),
                district=row['district'].title(),
                village_or_city=row['village'].title(),
                address=f"{row['village'].title()}, {row['district'].title()}",
                pincode=492001,
                occupation='Farmer' if a_id in land_map else 'Laborer' if is_bpl else 'Small Business',
                annual_income=float(annual_income),
                marital_status=marital_status,
                caste='OBC' if int(a_id[-1]) % 2 == 0 else 'General',
                aadhar_number=a_id,
                mobile_number=row['mobile_number'],
                is_deceased=False
            )
            db.add(cit)
            count += 1
        else:
            existing.marital_status = marital_status
            existing.mobile_number = row['mobile_number']
            existing.annual_income = float(annual_income)
            
    db.commit()
    db.close()
    print(f"Synced {count} new citizens to database.")

def seed_schemes_and_rules():
    """Seeds the Scheme and SchemeRule tables with initial data."""
    print("Seeding schemes and rules...")
    db = SessionLocal()
    
    # 1. Clear existing
    db.query(SchemeRule).delete()
    db.query(Scheme).delete()
    
    # 2. Add Schemes
    schemes = [
        Scheme(scheme_id=1, scheme_name="Old Age Pension", department="Social Welfare", description="Financial assistance for elderly citizens living below the poverty line."),
        Scheme(scheme_id=2, scheme_name="Widow Pension", department="Social Welfare", description="Financial support for widows to help them lead a dignified life."),
        Scheme(scheme_id=3, scheme_name="PM Kisan", department="Agriculture", description="Income support for small and marginal farmer families."),
        Scheme(scheme_id=4, scheme_name="Ayushman Bharat", department="Health", description="Health insurance for economically vulnerable families."),
        Scheme(scheme_id=5, scheme_name="Family Assistance Scheme", department="Rural Development", description="Generic welfare aid for rural households.")
    ]
    db.add_all(schemes)
    db.commit()
    
    # 3. Add Rules
    rules = [
        # Old Age Pension
        SchemeRule(scheme_id=1, field="age", operator=">=", value="60"),
        SchemeRule(scheme_id=1, field="annual_income", operator="<=", value="100000"),
        
        # Widow Pension
        SchemeRule(scheme_id=2, field="marital_status", operator="==", value="Widow"),
        SchemeRule(scheme_id=2, field="gender", operator="==", value="Female"),
        SchemeRule(scheme_id=2, field="age", operator=">=", value="18"),
        
        # PM Kisan
        SchemeRule(scheme_id=3, field="occupation", operator="==", value="Farmer"),
        SchemeRule(scheme_id=3, field="annual_income", operator="<=", value="300000"),

        # Ayushman Bharat (Proxy: BPL level income)
        SchemeRule(scheme_id=4, field="annual_income", operator="<=", value="72000"),

        # Family Assistance
        SchemeRule(scheme_id=5, field="annual_income", operator="<=", value="150000"),
        SchemeRule(scheme_id=5, field="district", operator="!=", value="City") # Mock rule
    ]
    db.add_all(rules)
    db.commit()
    db.close()
    print("Database seeding complete.")

if __name__ == "__main__":
    results = get_all_eligible_candidates()
    print(f"Total entries: {len(results)}")
    if results: print(results[0])
