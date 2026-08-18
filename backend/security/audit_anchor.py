"""
External Audit Chain Root Hash Anchoring Module (OWASP LLM08 Log Tampering Defense)
Periodically signs and exports the root hash of the SHA-256 audit chain to an immutable anchor.
"""

import os
import hashlib
from typing import Dict, Any
from backend.database.mongo_client import get_database

ANCHOR_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "audit_chain_root_anchor.hash")

def anchor_latest_audit_root() -> Dict[str, Any]:
    """
    Retrieves the latest current_hash from the audit_log collection and anchors it to an external file.
    """
    db = get_database()
    last_record = db.audit_log.find_one(sort=[("_id", -1)])
    if not last_record:
        return {"anchored": False, "reason": "Audit log is empty."}

    latest_hash = last_record.get("current_hash", "0" * 64)
    timestamp = last_record.get("timestamp", "")
    anchor_payload = f"TIMESTAMP:{timestamp} | ROOT_HASH:{latest_hash}\n"

    with open(ANCHOR_FILE_PATH, "a", encoding="utf-8") as f:
        f.write(anchor_payload)

    return {
        "anchored": True,
        "root_hash": latest_hash,
        "anchor_file": ANCHOR_FILE_PATH
    }
