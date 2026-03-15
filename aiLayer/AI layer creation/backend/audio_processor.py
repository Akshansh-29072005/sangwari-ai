import os
import whisper
import torch

# Model config
MODEL_NAME = "small" # Using "small" for significantly better Hindi accuracy (461MB)
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
os.makedirs(MODELS_DIR, exist_ok=True)

# Global Whisper instance
_whisper_model = None

def load_whisper():
    """Load the Whisper model into memory."""
    global _whisper_model
    if _whisper_model is None:
        # Force CPU to ensure stable deployment without CUDA build issues
        # Whisper 'small' on CPU is still fast enough and very accurate for Hindi
        print(f"[audio_processor] Loading Whisper '{MODEL_NAME}' model on CPU...")
        _whisper_model = whisper.load_model(MODEL_NAME, download_root=MODELS_DIR, device="cpu")
        print(f"[audio_processor] Whisper model loaded successfully on CPU.")

def transcribe_audio(audio_path: str, language: str = None) -> str:
    """
    Transcribes an audio file using Whisper.
    Returns the transcribed text.
    """
    global _whisper_model
    if _whisper_model is None:
        load_whisper()

    print(f"[audio_processor] Transcribing {audio_path}...")
    
    # transcribe() handles normalization and STT
    # If language is 'hi', we can hint it to the model
    options = {}
    # If app language is Hindi, force Hindi to improve accuracy
    if language == 'hi':
        options["language"] = "hindi"
    # If app language is English, we don't force 'english' because 
    # the user might still speak Hindi. Whisper will auto-detect between En/Hi.
    
    print(f"[audio_processor] Transcribing {audio_path} with options: {options}...")
    result = _whisper_model.transcribe(audio_path, task="transcribe", **options)
    
    text = result["text"].strip()
    print(f"[audio_processor] Result: {text}")
    return text
