from sentence_transformers import SentenceTransformer
import joblib
import re
import os

print("Loading Grievance AI dependencies...")

# Initialize globals
_embedding_model = None
_classifier_model = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models/grievance_classifier.joblib')

def _lazy_init():
    global _embedding_model, _classifier_model
    if _embedding_model is None:
        print("Lazy loading SentenceTransformer...")
        # Load the multilingual model
        _embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    
    if _classifier_model is None:
        if os.path.exists(MODEL_PATH):
            print("Loading Logistic Regression classifier...")
            _classifier_model = joblib.load(MODEL_PATH)
        else:
            print(f"Warning: Model not found at {MODEL_PATH}")

def _preprocess(text):
    text = str(text).lower()
    text = re.sub(r'[^\w\s]', '', text)
    return text

def analyze_grievance(text: str) -> dict:
    """
    Takes a raw string of complaint text.
    Returns the predicted department and confidence score.
    """
    _lazy_init()
    if not _classifier_model:
         return {"department": "Unknown", "confidence": 0.0}
    
    clean_text = _preprocess(text)
    embed = _embedding_model.encode([clean_text])
    
    # Get probabilities
    probs = _classifier_model.predict_proba(embed)[0]
    
    # Get top prediction index and confidence
    top_index = probs.argmax()
    confidence = float(probs[top_index])
    
    # Get predicted class (department name)
    department = _classifier_model.classes_[top_index]
    
    return {
        "department": department,
        "confidence": round(confidence, 2),
        "embedding": embed[0].tolist()
    }

# ─── SLA Prediction ──────────────────────────────────────────────────────────
import pandas as pd

_sla_model = None
SLA_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models/sla_model.joblib')

def _lazy_init_sla():
    global _sla_model
    if _sla_model is None:
        if os.path.exists(SLA_MODEL_PATH):
            _sla_model = joblib.load(SLA_MODEL_PATH)
        else:
            print(f"Warning: SLA model not found at {SLA_MODEL_PATH}")

def predict_sla(complaint_type: str, department: str, district: str) -> dict:
    """
    Predicts ths SLA resolution time in days and returns a confidence-like estimate.
    """
    _lazy_init_sla()
    if not _sla_model:
        return {"predicted_days": 5, "confidence": 0.0}

    X = pd.DataFrame([{"complaint_type": complaint_type, "department": department, "district": district}])
    predicted = _sla_model.predict(X)[0]
    predicted_days = max(1, int(round(predicted)))

    # Use individual tree predictions to estimate spread -> confidence
    try:
        tree_preds = [tree.predict(
            _sla_model.named_steps["pre"].transform(X)
        )[0] for tree in _sla_model.named_steps["rf"].estimators_]
        std = float(pd.Series(tree_preds).std())
        # Map std to confidence: lower std = higher confidence, clamp to [0.5, 0.99]
        raw_confidence = max(0.50, min(0.99, 1.0 - (std / (predicted_days + 1e-5)) * 0.5))
    except Exception:
        raw_confidence = 0.75

    return {
        "predicted_days": predicted_days,
        "confidence": round(raw_confidence, 2)
    }

# ─── Rejection Prediction ─────────────────────────────────────────────────────
_rejection_model = None
REJECTION_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models/rejection_model.joblib')

def _lazy_init_rejection():
    global _rejection_model
    if _rejection_model is None:
        if os.path.exists(REJECTION_MODEL_PATH):
            _rejection_model = joblib.load(REJECTION_MODEL_PATH)
        else:
            print(f"Warning: Rejection model not found at {REJECTION_MODEL_PATH}")

def predict_rejection(
    age: int,
    income: float,
    doc_completeness: float,   # 0.0 – 1.0
    address_match: int,         # 1 = match, 0 = mismatch
    previous_rejection: int     # 1 = yes, 0 = no
) -> dict:
    """
    Returns rejection probability, risk level, and a list of human-readable
    risk reasons derived from the feature values.
    """
    _lazy_init_rejection()
    if not _rejection_model:
        return {"rejection_probability": 0.5, "risk_level": "MEDIUM", "reasons": []}

    X = pd.DataFrame([{
        "age": age,
        "income": income,
        "doc_completeness": doc_completeness,
        "address_match": address_match,
        "previous_rejection": previous_rejection,
    }])

    prob = float(_rejection_model.predict_proba(X)[0][1])  # probability of "rejected"

    # Risk level thresholds
    if prob >= 0.65:
        risk_level = "HIGH"
    elif prob >= 0.40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Build human-readable reasons from the feature values
    reasons = []
    if address_match == 0:
        reasons.append("Aadhaar address mismatch detected")
    if doc_completeness < 0.5:
        reasons.append("Missing income certificate or supporting documents")
    elif doc_completeness < 0.75:
        reasons.append("Document completeness below recommended threshold (75%)")
    if previous_rejection == 1:
        reasons.append("Previous application rejection on record")
    if income < 15000:
        reasons.append("Declared income may require additional verification")
    if age < 21:
        reasons.append("Applicant age may not meet scheme minimum requirement")

    if not reasons:
        reasons.append("Risk within acceptable range — verify documents before submission")

    return {
        "rejection_probability": round(prob, 4),
        "risk_level": risk_level,
        "reasons": reasons,
    }

