import pandas as pd
import re
import joblib

from sentence_transformers import SentenceTransformer

from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import classification_report, mean_absolute_error


# ==========================================================
# 1 LOAD DATASET
# ==========================================================

df = pd.read_csv("D:\\ML for MorSangwari\\datasets\\grievances_dataset.csv")

print("Dataset shape:", df.shape)


# ==========================================================
# 2 TEXT CLEANING
# ==========================================================

def clean_text(text):

    text = str(text).lower()

    text = re.sub(r"http\S+", "", text)

    text = re.sub(r"[^\w\s]", "", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


df["clean_text"] = df["complaint_text"].apply(clean_text)

df = df.dropna()

print("Cleaned dataset size:", df.shape)


# ==========================================================
# 3 LOAD MULTILINGUAL EMBEDDING MODEL
# ==========================================================

print("Loading multilingual embedding model...")

embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

print("Embedding model loaded")


# ==========================================================
# 4 CONVERT TEXT → EMBEDDINGS
# ==========================================================

X = embedder.encode(df["clean_text"].tolist())

y_department = df["department"]

y_resolution = df["resolution_time_days"]


# ==========================================================
# 5 TRAIN TEST SPLIT
# ==========================================================

X_train, X_test, y_dep_train, y_dep_test = train_test_split(
    X,
    y_department,
    test_size=0.2,
    random_state=42
)

_, _, y_res_train, y_res_test = train_test_split(
    X,
    y_resolution,
    test_size=0.2,
    random_state=42
)


# ==========================================================
# 6 TRAIN DEPARTMENT CLASSIFIER
# ==========================================================

dept_model = SVC(
    kernel="linear",
    probability=True
)

dept_model.fit(X_train, y_dep_train)

print("Department classifier trained")


# ==========================================================
# 7 TRAIN RESOLUTION TIME MODEL
# ==========================================================

res_model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)

res_model.fit(X_train, y_res_train)

print("Resolution time model trained")


# ==========================================================
# 8 EVALUATION
# ==========================================================

print("\nDepartment Model Performance\n")

dep_preds = dept_model.predict(X_test)

print(classification_report(y_dep_test, dep_preds))


print("\nResolution Time Model Performance\n")

res_preds = res_model.predict(X_test)

mae = mean_absolute_error(y_res_test, res_preds)

print("Mean Absolute Error:", round(mae,2), "days")


# ==========================================================
# 9 SAVE MODELS
# ==========================================================

joblib.dump(dept_model, "department_classifier.pkl")

joblib.dump(res_model, "resolution_regressor.pkl")

print("Models saved successfully")


# ==========================================================
# 10 PRIORITY LOGIC
# ==========================================================

def get_priority(days):

    if days <= 5:
        return "High"

    elif days <= 20:
        return "Medium"

    else:
        return "Low"


# ==========================================================
# 11 INPUT VALIDATION
# ==========================================================

def is_valid_complaint(text):

    words = text.split()

    if len(words) < 3:
        return False

    alpha_ratio = sum(c.isalpha() for c in text) / len(text)

    if alpha_ratio < 0.5:
        return False

    return True


# ==========================================================
# 12 LOAD MODELS FOR INFERENCE
# ==========================================================

dept_model = joblib.load("department_classifier.pkl")

res_model = joblib.load("resolution_regressor.pkl")


# ==========================================================
# 13 MAIN AI PREDICTION FUNCTION
# ==========================================================

def analyze_complaint(text):

    if not is_valid_complaint(text):

        return {
            "error": "Invalid complaint. Please enter a meaningful complaint."
        }

    cleaned = clean_text(text)

    embedding = embedder.encode([cleaned])

    department = dept_model.predict(embedding)[0]

    resolution_time = int(res_model.predict(embedding)[0])

    priority = get_priority(resolution_time)

    confidence = float(max(dept_model.predict_proba(embedding)[0]) * 100)

    return {

        "complaint": text,

        "department": department,

        "confidence_percent": round(confidence,2),

        "estimated_resolution_days": resolution_time,

        "priority": priority
    }


# ==========================================================
# 14 TEST EXAMPLES
# ==========================================================

print("\nExample Predictions\n")

print(analyze_complaint(
    "My land mutation request has been pending for 3 months"
))

print(analyze_complaint(
    "Garbage is not being collected in our colony"
))

print(analyze_complaint(
    "Scholarship amount for my daughter has not been credited"
))


# Hindi example

print(analyze_complaint(
    "मेरी बेटी की छात्रवृत्ति अभी तक नहीं आई"
))


# Chhattisgarhi example

print(analyze_complaint(
    "मोला राशन कार्ड अभी तक नहीं मिलिस"
))