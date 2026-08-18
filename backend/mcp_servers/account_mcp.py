"""
Account Service MCP Server
Exposes get_account_context tool.
"""
from backend.database.mongo_client import get_database

def get_account_context(account_id: str) -> dict:
    """
    Fetches read-only customer account details.
    Must be called with trusted session account ID.
    """
    db = get_database()
    account = db.accounts.find_one({"account_id": account_id}, {"_id": 0})
    if not account:
        return {"error": f"Account '{account_id}' not found."}
    return account
