"""
Orchestrator Agent
Classifies user intent using OpenRouter Fast Classifier Free Model (e.g. Gemini Flash Lite / Llama 70B).
"""

from backend.llm.model_router import call_openrouter_model

def classify_intent(user_message: str) -> dict:
    """
    Classifies intent into: FEE_REVERSAL, CREDIT_LIMIT_INCREASE, CARD_REPLACEMENT, or GENERAL_INQUIRY.
    Uses OpenRouter CLASSIFICATION model tier.
    """
    system_prompt = (
        "You are an intent classification system for an American Express customer servicing platform.\n"
        "Classify the following customer request into EXACTLY ONE of these categories:\n"
        "1. FEE_REVERSAL (for fee waivers, refunds, late fee reversals)\n"
        "2. CREDIT_LIMIT_INCREASE (for credit limit increases, credit line requests)\n"
        "3. CARD_REPLACEMENT (for replacement cards, lost/stolen cards, damaged cards)\n"
        "4. GENERAL_INQUIRY (for general questions, balance inquiry, policies)\n"
        "Respond ONLY with the category name string."
    )

    res = call_openrouter_model("CLASSIFICATION", system_prompt, user_message, temperature=0.0)
    category = res.get("content", "").strip().upper() if res.get("content") else ""

    if category not in ["FEE_REVERSAL", "CREDIT_LIMIT_INCREASE", "CARD_REPLACEMENT", "GENERAL_INQUIRY"]:
        # Rule-based fallback
        msg = user_message.lower()
        if any(kw in msg for kw in ["waive", "fee", "reversal", "refund", "late fee", "penalty"]):
            category = "FEE_REVERSAL"
        elif any(kw in msg for kw in ["credit limit", "increase limit", "raise limit", "more credit"]):
            category = "CREDIT_LIMIT_INCREASE"
        elif any(kw in msg for kw in ["card replacement", "lost card", "stolen card", "new card", "replace"]):
            category = "CARD_REPLACEMENT"
        else:
            category = "GENERAL_INQUIRY"

    return {
        "intent": category,
        "routing_stat": res.get("stat", {})
    }
