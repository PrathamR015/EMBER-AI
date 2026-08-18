"""
Per-Account Rate Limiter & Business Logic Abuse Guardrail (OWASP LLM09 Defense)
Tracks request frequencies per account/intent, preventing actual rapid-fire abuse.
Rate limits ONLY when truly needed (e.g. >15 requests per minute).
"""

import time
from typing import Dict, Any

_request_history: Dict[str, list] = {}

def check_rate_limit(account_id: str, intent: str, max_requests: int = 15, window_seconds: int = 60) -> Dict[str, Any]:
    """
    Checks if account_id has exceeded max_requests within window_seconds.
    Defaults to 15 requests per 60s window to rate limit only when necessary.
    """
    current_time = time.time()
    key = f"{account_id}:{intent}"
    
    timestamps = _request_history.get(key, [])
    # Keep only timestamps within window
    timestamps = [t for t in timestamps if current_time - t <= window_seconds]
    timestamps.append(current_time)
    _request_history[key] = timestamps

    if len(timestamps) > max_requests:
        return {
            "allowed": False,
            "reason": f"Rate limit exceeded for account {account_id} on intent {intent} ({len(timestamps)} requests in {window_seconds}s). Cooling down.",
            "count": len(timestamps)
        }

    return {
        "allowed": True,
        "reason": "Request within rate limits.",
        "count": len(timestamps)
    }
