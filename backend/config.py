import os
from dotenv import load_dotenv, find_dotenv

# Force reload environment variables from .env file
load_dotenv(find_dotenv(), override=True)

def get_openrouter_key() -> str:
    return os.getenv("OPENROUTER_API_KEY", "").strip()

OPENROUTER_API_KEY = get_openrouter_key()
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1").strip()

# MongoDB Settings
USE_MOCK_MONGO = os.getenv("USE_MOCK_MONGO", "false").lower() == "true"
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://tonystark-123:evendeadiamthehero@cluster0.l9xnxmy.mongodb.net/?appName=Cluster0"
)
DB_NAME = os.getenv("DB_NAME", "ember_servicing_db")

# OpenRouter Active Model Slugs (Production Standard)
MODEL_CLASSIFIER = "meta-llama/llama-3.3-70b-instruct"
MODEL_REASONING = "meta-llama/llama-3.3-70b-instruct"
MODEL_GENERATOR = "meta-llama/llama-3.3-70b-instruct"

MODEL_CLASSIFICATION = MODEL_CLASSIFIER
MODEL_RESPONSE = MODEL_GENERATOR
