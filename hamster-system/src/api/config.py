"""Configuration for Hamster Council API."""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Free models on OpenRouter (in order of preference)
FREE_MODELS = [
    "google/gemma-3-27b-it:free",
    "meta-llama/llama-3.2-3b-instruct:free",
]

# Default model for synthesis/chairman
SYNTHESIS_MODEL = "google/gemma-3-27b-it:free"

# Hamster domains and their modes
HAMSTER_MODES = {
    # Individual mode - distinct voices, emotional support
    "individual": {
        "hamsters": ["adlerian", "eriksonian", "cognitive", "behavioral"],
        "description": "Psychological support with distinct therapeutic voices",
        "synthesis": False,  # User picks which resonates
    },
    # Council mode - parallel query + synthesis
    "council": {
        "hamsters": ["business", "finance", "behavioral"],
        "description": "Analytical problems with synthesized action plan",
        "synthesis": True,  # Combine into unified response
    }
}

# Keywords that trigger council mode (analytical/practical)
COUNCIL_KEYWORDS = [
    "money", "invest", "budget", "debt", "savings", "stock", "portfolio",
    "business", "startup", "market", "competitor", "revenue", "profit",
    "strategy", "growth", "scale", "customer", "product", "pricing",
    "plan", "action", "step", "how to", "what should i do"
]

# Keywords that trigger individual mode (emotional/psychological)
INDIVIDUAL_KEYWORDS = [
    "feel", "feeling", "anxiety", "worried", "sad", "depressed", "lonely",
    "relationship", "identity", "purpose", "meaning", "stuck", "lost",
    "who am i", "don't know", "confused", "overwhelmed", "stressed"
]

# Data directory for conversation storage
DATA_DIR = os.path.join(os.path.dirname(__file__), "../../data/conversations")

# Server config
API_HOST = "0.0.0.0"
API_PORT = 8001
