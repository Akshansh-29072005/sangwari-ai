import os
from huggingface_hub import hf_hub_download
from llama_cpp import Llama

# Model config
MODEL_REPO = "unsloth/Llama-3.2-3B-Instruct-GGUF"
MODEL_FILE = "Llama-3.2-3B-Instruct-Q4_K_M.gguf"
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
MODEL_PATH = os.path.join(MODELS_DIR, MODEL_FILE)

# Global LLM instance
_llm_instance = None

def _ensure_model_downloaded():
    """Download the GGUF model if it does not exist locally."""
    if not os.path.exists(MODEL_PATH):
        print(f"[llm_service] Downloading 3B model ({MODEL_FILE}) from HuggingFace...")
        os.makedirs(MODELS_DIR, exist_ok=True)
        hf_hub_download(
            repo_id=MODEL_REPO,
            filename=MODEL_FILE,
            local_dir=MODELS_DIR,
            local_dir_use_symlinks=False
        )
        print("[llm_service] Download complete.")
    else:
        print("[llm_service] Llama 3B GGUF model found locally.")

def load_llm():
    """Load the Llama model into memory."""
    global _llm_instance
    if _llm_instance is None:
        _ensure_model_downloaded()
        print("[llm_service] Loading Llama.cpp model into RAM...")
        _llm_instance = Llama(
            model_path=MODEL_PATH,
            n_ctx=1024, # Smaller context for short complaints
            n_threads=4, # Optimize for CPU
            verbose=False
        )
        print("[llm_service] Model loaded successfully.")

def translate_to_english(text: str) -> str:
    """
    Translates any input text (Hindi, Chhattisgarhi, etc.) to English.
    If it is already English, it returns the text unmodified or cleaned.
    """
    global _llm_instance
    if _llm_instance is None:
        load_llm()

    # Proper ChatML few-shot format
    prompt = f"""<|start_header_id|>system<|end_header_id|>
You are a literal translation expert for an Indian government portal.
Translate the user input strictly into English.
Mor = My. Chikhla = Mud. Gali = Lane/Street.

Example 1:
User: मोर गली म चिखला हो गे हे
Assistant: There is mud in my street.

Example 2:
User: मेरी पेंशन नहीं आ रही है
Assistant: My pension is not coming.

Example 3:
User: {text}
Assistant:"""
    
    response = _llm_instance(
        prompt,
        max_tokens=256,
        stop=["\n", "User:", "<|eot_id|>"],
        temperature=0.0,
    )

    result = response["choices"][0]["text"].strip()
    return result

def handle_chat(message: str, lang: str) -> str:
    """
    Handles conversational responses about schemes based on the requested language.
    """
    global _llm_instance
    if _llm_instance is None:
        load_llm()

    lang_map = {
        "en": "English",
        "hi": "Hindi",
        "cg": "Chhattisgarhi dialect"
    }
    target_lang = lang_map.get(lang, "Hindi")

    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are Sangwari AI, a helpful Indian government assistant.
Reply strictly in {target_lang}. Keep your response very short, friendly, and helpful (max 2 sentences).<|eot_id|>
<|start_header_id|>user<|end_header_id|>
{message}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>
"""

    response = _llm_instance(
        prompt,
        max_tokens=150,
        stop=["<|eot_id|>"],
        temperature=0.3, # Slightly creative for conversation
    )

    return response["choices"][0]["text"].strip()
