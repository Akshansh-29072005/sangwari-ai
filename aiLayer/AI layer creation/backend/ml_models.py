"""
ml_models.py — Sangwari AI Phase 4 ML Pipeline
Trains and exposes 5 models:
  1. Beneficiary Discovery (rule-based, in eligibility.py)
  2. Grievance Department Classifier (TF-IDF + Random Forest)
  3. Grievance SLA Predictor (Random Forest Regressor)
  4. Rejection Risk Predictor (Random Forest Classifier)
  5. Anomaly / Document Mismatch Detector (keyword + rules)
"""
import os
import json
import pickle
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import f1_score, mean_absolute_error, roc_auc_score
from sklearn.pipeline import Pipeline

# ── Resolve dataset paths relative to this file ──────────────────────────────
_BASE = os.path.dirname(__file__)
_DATASETS = os.path.abspath(os.path.join(_BASE, "..", "datasets"))
_MODELS   = os.path.abspath(os.path.join(_BASE, "..", "..", "models"))
os.makedirs(_MODELS, exist_ok=True)

# ── Helper: save / load artefacts ─────────────────────────────────────────────
def _save(obj, name):
    path = os.path.join(_MODELS, f"{name}.pkl")
    with open(path, "wb") as f:
        pickle.dump(obj, f)
    print(f"  ✓ Saved {name}.pkl")
    return path

def _load(name):
    path = os.path.join(_MODELS, f"{name}.pkl")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model {name}.pkl not found. Run train_all() first.")
    with open(path, "rb") as f:
        return pickle.load(f)


# ══════════════════════════════════════════════════════════════════════════════
# MODEL 2 & 3 — GRIEVANCE ROUTING + SLA PREDICTOR
# ══════════════════════════════════════════════════════════════════════════════

def train_grievance_models():
    """Train department classifier (F1) and SLA regressor (MAE)."""
    print("\n[Model 2 & 3] Training Grievance Routing + SLA models …")
    
    path = os.path.join(_DATASETS, "grievances_dataset.csv")
    df = pd.read_csv(path)
    df = df.dropna(subset=["complaint_text", "department", "resolution_time_days"])
    df["complaint_text"] = df["complaint_text"].astype(str)

    X = df["complaint_text"]
    y_dept = df["department"]
    y_sla  = df["resolution_time_days"].astype(float)

    X_train, X_test, yd_train, yd_test, ys_train, ys_test = train_test_split(
        X, y_dept, y_sla, test_size=0.2, random_state=42
    )

    # Department classifier
    clf_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=15000,
            sublinear_tf=True
        )),
        ("clf", RandomForestClassifier(
            n_estimators=200, n_jobs=-1, random_state=42, class_weight="balanced"
        ))
    ])
    clf_pipeline.fit(X_train, yd_train)
    yd_pred = clf_pipeline.predict(X_test)
    f1 = f1_score(yd_test, yd_pred, average="weighted")
    print(f"  Grievance Classifier Weighted F1: {f1:.4f}")

    # SLA Regressor
    le = LabelEncoder()
    le.fit(y_dept)
    
    reg_pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2), max_features=10000, sublinear_tf=True
        )),
        ("reg", RandomForestRegressor(
            n_estimators=200, n_jobs=-1, random_state=42
        ))
    ])
    reg_pipeline.fit(X_train, ys_train)
    ys_pred = reg_pipeline.predict(X_test)
    mae = mean_absolute_error(ys_test, ys_pred)
    print(f"  SLA Regressor MAE: {mae:.2f} days")

    _save(clf_pipeline, "grievance_classifier")
    _save(reg_pipeline, "sla_regressor")
    _save(list(clf_pipeline.classes_), "departments")
    return {"f1": round(f1, 4), "mae": round(mae, 2)}


# ══════════════════════════════════════════════════════════════════════════════
# MODEL 4 — REJECTION RISK PREDICTOR
# ══════════════════════════════════════════════════════════════════════════════

def train_rejection_model():
    """Train rejection risk classifier on scheme_applications.csv."""
    print("\n[Model 4] Training Rejection Risk Predictor …")
    
    path = os.path.join(_DATASETS, "scheme_applications.csv")
    df = pd.read_csv(path)
    df = df.dropna(subset=["status", "approval_confidence"])

    # Binary label: rejected=1, everything else=0
    df["is_rejected"] = (df["status"] == "rejected").astype(int)

    # Extract flat features from approval_confidence + scheme_id
    X = df[["scheme_id", "approval_confidence"]].copy()
    
    # Try to extract age and family_size from JSON blobs
    def parse_age(s):
        try:
            d = json.loads(str(s).replace('""', '"'))
            return int(d.get("age", 0))
        except Exception:
            return 0
    
    def parse_fam(s):
        try:
            d = json.loads(str(s).replace('""', '"'))
            return int(d.get("family_size", 0))
        except Exception:
            return 0

    df["age"] = df["application_data_json"].apply(parse_age)
    df["family_size"] = df["application_data_json"].apply(parse_fam)
    X = df[["scheme_id", "approval_confidence", "age", "family_size"]]
    y = df["is_rejected"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=200, n_jobs=-1, random_state=42, class_weight="balanced"
    )
    clf.fit(X_train, y_train)
    y_proba = clf.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_proba)
    print(f"  Rejection Risk AUC-ROC: {auc:.4f}")

    _save(clf, "rejection_risk_clf")
    _save(["scheme_id", "approval_confidence", "age", "family_size"], "rejection_features")
    return {"auc_roc": round(auc, 4)}


# ══════════════════════════════════════════════════════════════════════════════
# MODEL 5 — DOCUMENT MISMATCH / ANOMALY DETECTOR (Rule+Keyword)
# ══════════════════════════════════════════════════════════════════════════════

# Static anomaly type catalog  
ANOMALY_CATALOG = {
    "income_mismatch": [
        "income", "bank statement", "certificate", "tampered", "contradicting", "5 lakh"
    ],
    "age_mismatch": [
        "born", "age", "aadhar", "birth certificate", "differ", "exceed"
    ],
    "duplicate_aadhar": [
        "aadhar", "duplicate", "multiple", "mobile numbers", "agent", "linked"
    ],
    "deceased_person": [
        "deceased", "dead", "obituary", "alive", "confirmed dead", "ration card"
    ],
    "invalid_document": [
        "blurred", "forged", "unofficial", "unauthorized", "altered", "doctored",
        "format incorrect", "future date", "does not exist", "negative income"
    ]
}

def detect_anomaly(description: str) -> dict:
    """Rule-based keyword scanner to classify document mismatch type."""
    desc_lower = description.lower()
    scores = {}
    for anomaly_type, keywords in ANOMALY_CATALOG.items():
        scores[anomaly_type] = sum(1 for kw in keywords if kw in desc_lower)
    
    best = max(scores, key=scores.get)
    if scores[best] == 0:
        return {"detected": False, "anomaly_type": None, "confidence": 0.0, "action": "Manual review recommended"}
    
    actions = {
        "income_mismatch":  "Request fresh income certificate from authorised Revenue Officer",
        "age_mismatch":     "Cross-verify DOB across Aadhaar, ration card, and birth certificate",
        "duplicate_aadhar": "Flag to UIDAI; block multiple-benefit claims until resolved",
        "deceased_person":  "Remove from active beneficiary list; audit past disbursements",
        "invalid_document": "Reject application with reason; citizen must resubmit notarised originals",
    }
    
    return {
        "detected": True,
        "anomaly_type": best,
        "confidence": round(scores[best] / len(ANOMALY_CATALOG[best]), 2) if ANOMALY_CATALOG[best] else 0.0,
        "action": actions.get(best, "Manual review")
    }


# ══════════════════════════════════════════════════════════════════════════════
# TRAINING ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

def train_all():
    metrics = {}
    metrics.update(train_grievance_models())
    metrics.update(train_rejection_model())
    print("\n✅ All models trained successfully.")
    print("Metrics:", json.dumps(metrics, indent=2))
    # Save metrics for health check
    with open(os.path.join(_MODELS, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    return metrics


# ══════════════════════════════════════════════════════════════════════════════
# INFERENCE HELPERS
# ══════════════════════════════════════════════════════════════════════════════

_grievance_clf = None
_sla_reg       = None
_departments   = None
_rejection_clf = None

def _ensure_loaded():
    global _grievance_clf, _sla_reg, _departments, _rejection_clf
    if _grievance_clf is None:
        _grievance_clf = _load("grievance_classifier")
        _sla_reg       = _load("sla_regressor")
        _departments   = _load("departments")
        _rejection_clf = _load("rejection_risk_clf")


def predict_grievance(text: str) -> dict:
    _ensure_loaded()
    dept = _grievance_clf.predict([text])[0]
    proba = _grievance_clf.predict_proba([text])[0]
    conf = float(max(proba))
    sla_days = int(round(float(_sla_reg.predict([text])[0])))
    return {
        "predicted_department": dept,
        "confidence": round(conf, 3),
        "estimated_resolution_days": max(1, sla_days),
        "top_departments": [
            {"department": d, "probability": round(float(p), 3)}
            for d, p in sorted(
                zip(_departments, proba), key=lambda x: -x[1]
            )[:3]
        ]
    }


def predict_rejection_risk(scheme_id: int, approval_confidence: float,
                           age: int = 0, family_size: int = 0) -> dict:
    _ensure_loaded()
    X = [[scheme_id, approval_confidence, age, family_size]]
    proba = float(_rejection_clf.predict_proba(X)[0][1])
    return {
        "rejection_risk_score": round(proba, 3),
        "risk_level": "HIGH" if proba > 0.6 else ("MEDIUM" if proba > 0.35 else "LOW"),
        "recommendation": (
            "Likely to be rejected — review eligibility criteria before submitting."
            if proba > 0.6 else
            "Moderate risk — double-check all documents."
            if proba > 0.30 else
            "Low rejection risk — application likely to be processed."
        )
    }


if __name__ == "__main__":
    train_all()
