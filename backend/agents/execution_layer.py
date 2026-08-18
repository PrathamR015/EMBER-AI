"""
Action Execution Layer
Derives server-side idempotency key and dispatches write operations.
"""

import hashlib

def generate_idempotency_key(session_id: str, intent: str, policy_version: str, request_hash: str) -> str:
    """
    Derives key deterministically server-side from (session_id, intent, policy_version, request_hash).
    Never accepted from upstream as free text.
    """
    raw_payload = f"{session_id}:{intent}:{policy_version}:{request_hash}"
    return hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()
