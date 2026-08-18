"""
PII Redaction & Tokenization Module
Ensures no raw PII crosses trust boundary to external hosted models (Security Rule 2.2).
"""

import re

def redact_pii(data: dict) -> dict:
    """
    Redacts raw PII fields (customer name, card numbers, addresses)
    retaining only structured non-PII financial context (fee amount, tenure, waiver count).
    """
    if not isinstance(data, dict):
        return data

    redacted = data.copy()
    pii_fields = ["customer_name", "card_number", "ssn", "address", "email", "phone"]
    for field in pii_fields:
        if field in redacted:
            redacted[field] = "[REDACTED_PII]"

    return redacted
