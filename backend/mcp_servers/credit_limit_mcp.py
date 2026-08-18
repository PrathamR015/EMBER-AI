"""
Credit Limit MCP Server
Exposes increase_limit tool (write, bounded).
"""
from backend.database.mongo_client import get_database

def increase_limit(account_id: str, new_limit: float, reason: str) -> dict:
    """
    Updates the credit limit for an account up to policy bounds.
    """
    db = get_database()
    account = db.accounts.find_one({"account_id": account_id})
    if not account:
        return {"success": False, "error": f"Account '{account_id}' not found."}

    old_limit = account.get("credit_limit", 0.0)
    db.accounts.update_one(
        {"account_id": account_id},
        {"$set": {"credit_limit": new_limit}}
    )

    return {
        "success": True,
        "account_id": account_id,
        "old_limit": old_limit,
        "new_limit": new_limit,
        "message": f"Credit limit increased from ${old_limit:.2f} to ${new_limit:.2f}."
    }
