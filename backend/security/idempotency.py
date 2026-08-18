"""
Server-side Idempotency Key Derivation (Security Rule 2.4)
"""
import hashlib

def calculate_idempotency_key(session_id: str, intent: str, policy_version: str, request_payload: str) -> str:
    """
    Derives key deterministically server-side from (session_id, intent, policy_version, request_payload).
    Never accepted from client/LLM text.
    """
    raw_str = f"{session_id}|{intent}|{policy_version}|{request_payload}"
    return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()
