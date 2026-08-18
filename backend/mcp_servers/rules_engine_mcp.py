"""
Rules Engine MCP Server
Exposes evaluate_eligibility tool (pure deterministic evaluation function).
"""
from backend.rules.fee_waiver_rules import (
    evaluate_fee_reversal_eligibility,
    evaluate_credit_limit_eligibility,
    evaluate_card_replacement_eligibility
)

def evaluate_eligibility(intent: str, account: dict, policy: dict, parameters: dict = None) -> dict:
    """
    Evaluates business eligibility rules deterministically outside the LLM.
    """
    parameters = parameters or {}
    if intent == "FEE_REVERSAL":
        fee_id = parameters.get("fee_id", "latest")
        return evaluate_fee_reversal_eligibility(account, fee_id, policy)
    elif intent == "CREDIT_LIMIT_INCREASE":
        return evaluate_credit_limit_eligibility(account, policy)
    elif intent == "CARD_REPLACEMENT":
        return evaluate_card_replacement_eligibility(account, policy)
    else:
        return {
            "eligible": True,
            "reason": f"Default approval for general intent '{intent}'.",
            "policy_id": policy.get("policy_id", "POL-GEN-001"),
            "policy_version": policy.get("version", "v1.0")
        }
