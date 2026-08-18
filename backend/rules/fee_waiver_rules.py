"""
Deterministic Rules Engine for Amex Servicing Operations.
Money math & policy constraints live outside the LLM.
"""

from typing import Dict, Any

def evaluate_fee_reversal_eligibility(account: Dict[str, Any], fee_id: str, policy: Dict[str, Any]) -> Dict[str, Any]:
    fee_history = account.get("fee_history", [])
    target_fee = next((f for f in fee_history if f.get("fee_id") == fee_id or fee_id == "latest"), None)
    
    if not target_fee and fee_history:
        charged_fees = [f for f in fee_history if f.get("status") == "CHARGED"]
        if charged_fees:
            target_fee = charged_fees[-1]

    if not target_fee:
        return {
            "eligible": False,
            "reason": "No eligible charged fee found to waive.",
            "fee_amount": 0.0,
            "fee_id": None
        }

    rules = policy.get("rules", {})
    max_waivers_12mo = rules.get("max_waivers_12mo", 1)
    min_tenure_months = rules.get("min_tenure_months", 3)
    allow_delinquent = rules.get("allow_delinquent", False)

    waiver_count = account.get("waiver_count_12mo", 0)
    tenure = account.get("tenure_months", 0)
    is_delinquent = account.get("delinquent_status", False)

    reasons = []
    if waiver_count >= max_waivers_12mo:
        reasons.append(f"Waiver limit reached ({waiver_count}/{max_waivers_12mo} in last 12 months).")
    if tenure < min_tenure_months:
        reasons.append(f"Tenure ({tenure} months) below minimum required ({min_tenure_months} months).")
    if is_delinquent and not allow_delinquent:
        reasons.append("Account is currently delinquent.")
    if target_fee.get("status") != "CHARGED":
        reasons.append(f"Fee status is '{target_fee.get('status')}', expected 'CHARGED'.")

    eligible = len(reasons) == 0

    return {
        "eligible": eligible,
        "reason": "Approved for fee waiver." if eligible else " | ".join(reasons),
        "fee_id": target_fee.get("fee_id"),
        "fee_amount": target_fee.get("amount", 0.0),
        "policy_id": policy.get("policy_id", "POL-FEE-2026"),
        "policy_version": policy.get("version", "v2.1")
    }

def evaluate_credit_limit_eligibility(account: Dict[str, Any], policy: Dict[str, Any]) -> Dict[str, Any]:
    rules = policy.get("rules", {})
    min_tenure_months = rules.get("min_tenure_months", 6)
    
    tenure = account.get("tenure_months", 0)
    is_delinquent = account.get("delinquent_status", False)

    reasons = []
    if tenure < min_tenure_months:
        reasons.append(f"Tenure ({tenure} months) below minimum required ({min_tenure_months} months for limit increase).")
    if is_delinquent:
        reasons.append("Account is currently delinquent.")

    eligible = len(reasons) == 0
    return {
        "eligible": eligible,
        "reason": "Approved for credit limit increase." if eligible else " | ".join(reasons),
        "policy_id": policy.get("policy_id", "POL-LIMIT-2026"),
        "policy_version": policy.get("version", "v1.2")
    }

def evaluate_card_replacement_eligibility(account: Dict[str, Any], policy: Dict[str, Any]) -> Dict[str, Any]:
    is_delinquent = account.get("delinquent_status", False)
    if is_delinquent:
        return {
            "eligible": False,
            "reason": "Account is currently delinquent. Card replacement requires active good standing.",
            "policy_id": policy.get("policy_id", "POL-CARD-2026"),
            "policy_version": policy.get("version", "v1.0")
        }
    return {
        "eligible": True,
        "reason": "Approved for complimentary replacement card order.",
        "policy_id": policy.get("policy_id", "POL-CARD-2026"),
        "policy_version": policy.get("version", "v1.0")
    }
