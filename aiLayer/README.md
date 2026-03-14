# Sangwari AI Layer (FastAPI + ML/LLM)

AI computation layer for Sangwari AI. This service is consumed by the Go backend and should not be called directly by the mobile app in normal architecture.

Primary responsibilities:

- rule-based scheme eligibility evaluation
- grievance department routing and SLA estimation
- rejection risk scoring
- document mismatch/anomaly detection
- multilingual translation and short assistant chat responses

---

## 1) Service Context

```text
Mobile App --> Go Backend (:8000) --> AI Layer (:8001)
                                      |
                                      +--> Postgres/SQLite (SQLAlchemy)
                                      +--> Model artifacts (PKL + GGUF)
```

The AI layer exposes internal APIs and returns structured inference results back to backend.

---

## 2) Folder Structure

```text
aiLayer/
├── README.md
└── AI layer creation/
    ├── Dockerfile
    ├── backend/
    │   ├── main.py              # FastAPI app and endpoints
    │   ├── ml_models.py         # training + inference helpers
    │   ├── llm_service.py       # Llama GGUF load/translate/chat
    │   ├── eligibility.py       # eligibility rule engine
    │   ├── database.py          # SQLAlchemy engine/session
    │   ├── models.py            # ORM models
    │   ├── schemas.py           # pydantic request/response models
    │   ├── seed.py              # optional local seeding utility
    │   └── requirements.txt
    ├── datasets/                # training and seeding CSV files
    ├── models/                  # GGUF + generated PKL + metrics.json
    ├── PRD.txt
    ├── System Design Logic.txt
    └── Project Task Breakdown.txt
```

---

## 3) Environment Variables

Common runtime variables:

- `DATABASE_URL` (example: `postgresql+psycopg2://user:pass@host:5432/db`)
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`

`database.py` falls back to sqlite if `DATABASE_URL` is absent.

---

## 4) Installation and Local Run

From `AI layer creation/backend`:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Dependencies include:

- FastAPI / Uvicorn
- SQLAlchemy + psycopg2
- pandas + scikit-learn
- huggingface-hub
- llama-cpp-python

---

## 5) Docker Run

From repo root (recommended stack flow):

```bash
docker compose up --build
```

Standalone AI image source:

- `AI layer creation/Dockerfile`

This Dockerfile installs C/C++ build dependencies required by `llama-cpp-python`.

---

## 6) Endpoints

- `GET /` - basic service metadata
- `GET /health` - service readiness with model load flag
- `GET /models/metrics` - trained model metrics if available
- `POST /eligibility` - evaluate citizen against scheme rules
- `POST /predict-sla` - SLA estimation for text
- `POST /route-complaint` - department classification + confidence + SLA
- `POST /rejection-risk` - rejection risk score and recommendation
- `POST /verify-document` - anomaly detection and action suggestion
- `POST /chat` - multilingual short assistant response

---

## 7) Model Capabilities

`ml_models.py` provides five major capabilities:

1. Beneficiary discovery / eligibility (rule-driven)
2. Grievance classifier (TF-IDF + RandomForest)
3. SLA regressor (RandomForestRegressor)
4. Rejection risk classifier (RandomForestClassifier)
5. Document anomaly detector (keyword/rule engine)

Model artifacts are persisted in `AI layer creation/models/`.

---

## 8) LLM Service

`llm_service.py`:

- loads `Llama-3.2-3B-Instruct-Q4_K_M.gguf`
- downloads model from Hugging Face if missing
- translates mixed Hindi/Chhattisgarhi input to English for downstream classifiers
- generates concise multilingual responses for chat endpoint

Operational note: model load is memory/CPU heavy on small machines.

---

## 9) Data Assets

Training and reference CSVs are under `AI layer creation/datasets/`, including:

- `citizens_master.csv`
- `grievances_dataset.csv`
- `scheme_applications.csv`
- `scheme_rules.csv`
- `schemes.csv`
- `ocr_extracted_data.csv`
- `anomaly_cases.csv`

---

## 10) Backend Integration Contract

Go backend routes under `/ai/*` proxy to this service. Typical mapping:

- backend `/ai/analyze-eligibility` -> AI `/eligibility`
- backend `/ai/route-complaint` -> AI `/route-complaint`
- backend `/ai/rejection-risk` -> AI `/rejection-risk`
- backend `/ai/verify-application` -> AI `/verify-document`
- backend `/ai/chat` -> AI `/chat`

This contract should remain backward-compatible for frontend stability.

---

## 11) Operations and Health

Recommended checks:

- `GET /health` to ensure startup complete and models loaded
- `GET /models/metrics` after training to validate model artifact readiness

If startup is slow, verify:

- GGUF model presence
- CPU/RAM availability
- file permissions for `models/` write path

---

## 12) Implementation State Notes

- AI endpoints are active and integrated with backend.
- Startup can trigger model training if expected PKL artifacts are missing.
- Keep datasets and model artifact paths consistent with docker volume mounts defined in root compose.

