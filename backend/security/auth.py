"""
Gateway JWT Authentication & Session Binding Module (Security Rule 2.1 / OWASP LLM06 IDOR Defense)
Generates and validates OAuth2 / JWT tokens, extracting session_account_id strictly from signed claims.
"""

import time
import jwt
from typing import Dict, Any, Optional

JWT_SECRET = "ember-amex-sec-key-998822-bank-grade-crypto-secret-token-auth-2026"
JWT_ALGORITHM = "HS256"

def create_access_token(account_id: str, role: str = "CARDMEMBER") -> str:
    """
    Creates a signed JWT access token containing session_account_id claim.
    """
    payload = {
        "sub": account_id,
        "account_id": account_id,
        "role": role,
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600  # 1 hour expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token_and_extract_account(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies JWT token signature and returns claims payload including session_account_id.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
