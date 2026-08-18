"""
Card Issuance MCP Server
Exposes issue_replacement tool (write).
"""
import uuid
from datetime import datetime
from backend.database.mongo_client import get_database

def issue_replacement(account_id: str, reason: str, shipping_address: str) -> dict:
    """
    Issues a replacement credit card for the given account.
    """
    db = get_database()
    order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    order = {
        "order_id": order_id,
        "account_id": account_id,
        "reason": reason,
        "shipping_address": shipping_address,
        "status": "PROCESSING",
        "timestamp": datetime.now().isoformat()
    }
    db.card_orders.insert_one(order)
    return {
        "success": True,
        "order_id": order_id,
        "account_id": account_id,
        "status": "PROCESSING",
        "message": f"Replacement card order '{order_id}' placed successfully."
    }
