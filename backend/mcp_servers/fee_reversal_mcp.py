"""
Fee Reversal MCP Server
Exposes reverse_fee tool (write, idempotent).
"""
from backend.database.mongo_client import get_database

def reverse_fee(account_id: str, fee_id: str, amount: float, reason: str) -> dict:
    """
    Executes fee reversal for an account and updates fee history status to 'WAIVED'.
    """
    db = get_database()
    account = db.accounts.find_one({"account_id": account_id})
    if not account:
        return {"success": False, "error": f"Account '{account_id}' not found."}

    fee_history = account.get("fee_history", [])
    updated = False
    fee_waived_amount = 0.0

    for fee in fee_history:
        if (fee.get("fee_id") == fee_id or fee_id == "latest") and fee.get("status") == "CHARGED":
            fee["status"] = "WAIVED"
            fee["reason"] = reason
            fee_waived_amount = fee.get("amount", amount)
            updated = True
            break

    if not updated:
        return {"success": False, "error": f"Fee '{fee_id}' not found or already waived."}

    db.accounts.update_one(
        {"account_id": account_id},
        {
            "$set": {"fee_history": fee_history},
            "$inc": {"waiver_count_12mo": 1, "current_balance": -fee_waived_amount}
        }
    )

    return {
        "success": True,
        "account_id": account_id,
        "fee_id": fee_id,
        "amount_waived": fee_waived_amount,
        "status": "WAIVED",
        "message": f"Successfully waived fee of ${fee_waived_amount:.2f}."
    }
