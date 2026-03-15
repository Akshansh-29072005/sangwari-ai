"""
main.py — Sangwari AI FastAPI Service (port 8001)
Consumed ONLY by the Go backend (never directly by the frontend).

Architecture:
    Frontend → Go Backend (port 8000) → FastAPI AI Layer (port 8001)

Endpoints:
    POST /eligibility          → Rule-based beneficiary discovery (Model 1)
    POST /route-complaint      → Grievance dept classifier + SLA predictor (Model 2 & 3)
    POST /rejection-risk       → Rejection Risk predictor (Model 4)
    POST /verify-document      → Document anomaly/mismatch detection (Model 5)
    POST /chat                 → Placeholder conversational bot
    GET  /health               → Health check (for Go backend readiness probe)
    GET  /models/metrics       → Trained model performance metrics
"""

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, Request, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
import os
import json
import uuid
import pandas as pd
import torch

from database import engine, Base, get_db
import schemas
from eligibility import evaluate_eligibility
import ml_models
import llm_service
import audio_processor
import tempfile

# ─── Create DB tables on startup ──────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sangwari AI – ML Service",
    description="Internal FastAPI service consumed only by the Go backend gateway.",
    version="2.0.0",
)

# Only Go backend (localhost) should call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:8000", "http://127.0.0.1:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Train / load models at startup ───────────────────────────────────────────
_models_trained = False

@app.on_event("startup")
async def startup_event():
    global _models_trained
    
    # Pre-load Whisper for faster first response
    audio_processor.load_whisper()
    
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
    # Train only if pkl files are missing
    required = ["grievance_classifier.pkl", "sla_regressor.pkl", "rejection_risk_clf.pkl"]
    missing = [f for f in required if not os.path.exists(os.path.join(models_dir, f))]
    if missing:
        print(f"[startup] Training models (missing: {missing}) …")
        ml_models.train_all()
    else:
        print("[startup] Found existing model PKLs — loading …")
        ml_models._ensure_loaded()
    _models_trained = True
    print("[startup] AI Layer ready ✓")


# ─── Pydantic request/response schemas ────────────────────────────────────────

class GrievanceRequest(BaseModel):
    text: str

class RejectionRequest(BaseModel):
    scheme_id: uuid.UUID
    approval_confidence: float
    age: Optional[int] = 0
    family_size: Optional[int] = 0

class DocumentMismatchRequest(BaseModel):
    description: str
    citizen_id: Optional[uuid.UUID] = None
    document_type: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "hi"  # hi | en | cg (Chhattisgarhi)


# ─── ENDPOINTS ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"service": "Sangwari AI ML Layer", "status": "running", "version": "2.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "models_loaded": _models_trained}


@app.get("/models/metrics")
def model_metrics():
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
    metrics_path = os.path.join(models_dir, "metrics.json")
    if not os.path.exists(metrics_path):
        return {"message": "Models not yet trained", "metrics": {}}
    with open(metrics_path) as f:
        return {"metrics": json.load(f)}


# ── Model 1: Beneficiary Discovery / Eligibility Check ──────────────────────
@app.post("/eligibility")
def check_eligibility(citizen: schemas.CitizenMasterBase, db: Session = Depends(get_db)):
    """
    Evaluate citizen attributes against all scheme rules.
    Returns sorted list of schemes with eligibility flags and match scores.
    Called by Go backend: POST /api/v1/ai/analyze-eligibility
    """
    results = evaluate_eligibility(citizen, db)
    return {"success": True, "data": results}


# ── Model 2 + 3: Grievance Routing + SLA Prediction ─────────────────────────
@app.post("/predict-sla")
async def predict_sla(request: Request):
    data = await request.json()
    text = data.get("text", "")
    if not text:
        return {"estimated_resolution_days": 7} # Default fallback
    
    try:
        # Standardize text (simple cleaning for now, could use LLM)
        clean_text = text.strip()
        result = ml_models.predict_grievance(clean_text)
        return {"estimated_resolution_days": result["estimated_resolution_days"]}
    except Exception as e:
        print(f"Error predicting SLA: {e}")
        return {"estimated_resolution_days": 10} # Safe fallback

@app.post("/route-complaint")
def route_complaint(req: GrievanceRequest):
    """
    Classify grievance text to department + predict resolution time.
    Called by Go backend: POST /api/v1/ai/complaint-route
    """
    if not _models_trained:
        raise HTTPException(503, "Models not yet loaded")
    
    # Standardize input using Llama 3B translation
    try:
        translated_text = llm_service.translate_to_english(req.text)
        print(f"[AI Layer] Translated '{req.text}' -> '{translated_text}'")
    except Exception as e:
        print(f"[AI Layer] LLM translation failed: {str(e)}. Falling back to original text.")
        translated_text = req.text

    result = ml_models.predict_grievance(translated_text)
    return {"success": True, "data": result}

class VoiceProcessRequest(BaseModel):
    text: str
    language: Optional[str] = "hi"

@app.post("/voice/process-audio")
async def process_voice_audio(file: UploadFile = File(...), language: Optional[str] = Form("hi")):
    print(f"[AI Layer] Received /voice/process-audio (lang={language}, file={file.filename})")
    """
    Audio-to-Intelligence pipeline:
    1. STT (Speech-to-Text) using Whisper
    2. Intent Classification
    3. Contextual Response generation
    """
    if not _models_trained:
        raise HTTPException(503, "AI Models not yet loaded")

    # Save temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # 1. Transcribe
        text = audio_processor.transcribe_audio(tmp_path, language)
        
        # 2. Classify Intent
        intent = llm_service.classify_intent(text)
        
        # 3. Generate Chat Response
        reply = llm_service.handle_chat(text, language, intent)

        # 4. Identify specific scheme if intent is scheme_help
        scheme_data = None
        if intent == "scheme_help":
            # Load schemes from dataset for identification
            try:
                schemes_path = os.path.join(os.path.dirname(__file__), "..", "datasets", "schemes.csv")
                schemes_df = pd.read_csv(schemes_path)
                schemes_list = schemes_df.to_dict('records')
                
                scheme_name = llm_service.identify_scheme(text, schemes_list)
                if scheme_name != "general":
                    # Find the exact scheme object
                    matching = [s for s in schemes_list if s.get('name') == scheme_name]
                    if matching:
                        scheme_data = matching[0]
                        print(f"[AI Layer] Identified specific scheme: {scheme_name}")
            except Exception as se:
                print(f"[AI Layer] Scheme identification failed: {str(se)}")
        
        return {
            "success": True,
            "data": {
                "intent": intent,
                "reply": reply,
                "transcription": text,
                "language": language,
                "scheme": scheme_data
            }
        }
    except Exception as e:
        print(f"[AI Layer] Voice audio processing failed: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "data": {
                "intent": "general",
                "reply": "Mujhe ye samajhne mein takleef ho rahi hai. Kya aap fir se bol sakte hain?",
                "transcription": ""
            }
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


# ── Model 4: Rejection Risk Predictor ───────────────────────────────────────
@app.post("/rejection-risk")
def rejection_risk(req: RejectionRequest):
    """
    Predict likelihood of application rejection before submission.
    Called by Go backend: POST /api/v1/ai/rejection-risk
    """
    if not _models_trained:
        raise HTTPException(503, "Models not yet loaded")
    result = ml_models.predict_rejection_risk(
        str(req.scheme_id), req.approval_confidence, req.age, req.family_size
    )
    return {"success": True, "data": result}


# ── Model 5: Document Mismatch / Anomaly Detection ─────────────────────────
@app.post("/verify-document")
def verify_document(req: DocumentMismatchRequest):
    """
    Keyword+rule engine to detect document anomalies and suggest remediation.
    Called by Go backend: POST /api/v1/ai/verify-application
    """
    result = ml_models.detect_anomaly(req.description)
    result["citizen_id"] = str(req.citizen_id) if req.citizen_id else None
    result["document_type"] = req.document_type
    return {"success": True, "data": result}


# ── Conversational Chat Bot (Llama 3B - multilingual) ────────────────────
@app.post("/chat")
def chat(req: ChatRequest):
    """
    Multilingual bot powered by Llama 3.2 3B Instruct.
    Called by Go backend: POST /api/v1/ai/chat
    """
    try:
        reply = llm_service.handle_chat(message=req.message, lang=req.language)
    except Exception as e:
        print(f"[AI Layer] LLM chat failed: {str(e)}. Falling back.")
        reply = "I am currently unavailable due to an LLM error. Please try again later."
        
    return {
        "success": True,
        "data": {
            "reply": reply,
            "language_detected": req.language,
            "intent": "general_query"
        }
    }
