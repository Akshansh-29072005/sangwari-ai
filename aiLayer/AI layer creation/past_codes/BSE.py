import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib

# ==============================
# 1. LOAD DATA
# ==============================

citizens = pd.read_csv("D:\\ML for MorSangwari\\datasets\\citizens_master.csv")
deaths = pd.read_csv("D:\\ML for MorSangwari\\datasets\\death_records.csv")
ration = pd.read_csv("D:\\ML for MorSangwari\\datasets\\ration_cards.csv")
enrollments = pd.read_csv("D:\\ML for MorSangwari\\datasets\\scheme_enrollments.csv")


# ==============================
# 2. DATA CLEANING
# ==============================

def clean_names(df, column):
    df[column] = df[column].astype(str).str.strip().str.lower()
    return df

citizens = clean_names(citizens, "name")
deaths = clean_names(deaths, "spouse_name")
enrollments = clean_names(enrollments, "citizen_name")

# remove duplicates
citizens = citizens.drop_duplicates(subset=["name"])

# fill missing numeric values
citizens["income"] = citizens["income"].fillna(citizens["income"].median())

# fill missing age
citizens["age"] = citizens["age"].fillna(citizens["age"].median())

# normalize gender
citizens["gender"] = citizens["gender"].str.lower()


# ==============================
# 3. FEATURE ENGINEERING
# ==============================

# spouse dead feature
citizens["spouse_dead"] = citizens["name"].isin(deaths["spouse_name"])

# enrollment flag
citizens["already_enrolled"] = citizens["name"].isin(
    enrollments["citizen_name"]
)

# student detection
citizens["is_student"] = citizens["occupation"].str.lower().str.contains("student")

# low income feature
citizens["low_income"] = citizens["income"] < 200000


# ==============================
# 4. CREATE SCHEME LABELS
# ==============================

# Old Age Pension
citizens["old_age_pension"] = (
    (citizens["age"] >= 60) &
    (citizens["low_income"])
).astype(int)

# Widow Pension
citizens["widow_pension"] = (
    (citizens["gender"] == "female") &
    (citizens["spouse_dead"]) &
    (citizens["low_income"])
).astype(int)

# Civil Services Incentive
citizens["civil_services_incentive"] = (
    (citizens["age"] >= 21) &
    (citizens["age"] <= 35) &
    (citizens["is_student"])
).astype(int)

# Scholarship
citizens["scholarship_scheme"] = (
    (citizens["age"] <= 25) &
    (citizens["is_student"]) &
    (citizens["low_income"])
).astype(int)

# Family Assistance Scheme
citizens["family_assistance"] = (
    (citizens["spouse_dead"]) &
    (citizens["low_income"])
).astype(int)


# ==============================
# 5. PREPARE TRAINING DATA
# ==============================

features = [
    "age",
    "income",
    "spouse_dead",
    "is_student",
    "low_income"
]

X = citizens[features]

y = citizens[[
    "old_age_pension",
    "widow_pension",
    "civil_services_incentive",
    "scholarship_scheme",
    "family_assistance"
]]

# convert boolean to int
X = X.astype(int)


# ==============================
# 6. TRAIN ML MODEL
# ==============================

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

print("Model trained successfully")

# save model
joblib.dump(model, "beneficiary_model.pkl")


# ==============================
# 7. BENEFICIARY SEARCH FUNCTION
# ==============================

def find_beneficiaries(citizens, deaths, enrollments, model):

    citizens = citizens.copy()

    # recreate features for updated data
    citizens["spouse_dead"] = citizens["name"].isin(deaths["spouse_name"])
    citizens["already_enrolled"] = citizens["name"].isin(
        enrollments["citizen_name"]
    )
    citizens["is_student"] = citizens["occupation"].str.lower().str.contains("student")
    citizens["low_income"] = citizens["income"] < 200000

    features = citizens[[
        "age",
        "income",
        "spouse_dead",
        "is_student",
        "low_income"
    ]]

    features = features.astype(int)

    preds = model.predict(features)

    scheme_names = [
        "Old Age Pension",
        "Widow Pension",
        "Civil Services Incentive",
        "Scholarship Scheme",
        "Family Assistance Scheme"
    ]

    results = []

    for i, (_, citizen) in enumerate(citizens.iterrows()):

        eligible_schemes = []

        for j in range(len(scheme_names)):
            if preds[i][j] == 1:
                eligible_schemes.append(scheme_names[j])

        if eligible_schemes:
            results.append({
                "name": citizen["name"],
                "district": citizen["district"],
                "eligible_schemes": eligible_schemes
            })

    return pd.DataFrame(results)


# ==============================
# 8. RUN BENEFICIARY SEARCH
# ==============================

model = joblib.load("beneficiary_model.pkl")

beneficiaries = find_beneficiaries(
    citizens,
    deaths,
    enrollments,
    model
)

print("\nEligible Beneficiaries:")
print(beneficiaries.head())

# save results
beneficiaries.to_csv("eligible_beneficiaries.csv", index=False)