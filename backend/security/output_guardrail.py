"""
Gateway Output Guardrail (OWASP LLM02 Sensitive Information Egress & LLM07 Defense)
Scans outgoing agent responses for unredacted PII, full 16-digit card numbers, SSNs, or prompt leaks.
Strips all internal reasoning <think>...</think> tags.
"""

import re
from typing import Dict, Any

# Pattern for 16-digit card numbers and SSNs
CARD_NUMBER_PATTERN = r'\b(?:\d[ -]*?){13,16}\b'
SSN_PATTERN = r'\b\d{3}-\d{2}-\d{4}\b'
API_KEY_PATTERN = r'sk-[a-zA-Z0-9\-_]{20,}'

def strip_think_tags(text: str) -> str:
    """
    Removes <think>...</think> reasoning blocks and any lingering thinking tags.
    """
    if not text:
        return ""
    # Strip <think>...</think> blocks
    cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL | re.IGNORECASE).strip()
    # Strip lingering <think> or </think> tags
    cleaned = re.sub(r'</?think>', '', cleaned, flags=re.IGNORECASE).strip()
    return cleaned

def sanitize_agent_output(response_text: str) -> Dict[str, Any]:
    """
    Scans agent response output text and redacts sensitive PII or credentials if detected.
    Strips raw <think> tags.
    """
    sanitized = strip_think_tags(response_text)
    leaks_found = []

    # Check for raw card numbers
    if re.search(CARD_NUMBER_PATTERN, sanitized):
        sanitized = re.sub(CARD_NUMBER_PATTERN, "[REDACTED_CARD_NUMBER]", sanitized)
        leaks_found.append("CREDIT_CARD_NUMBER")

    # Check for SSN
    if re.search(SSN_PATTERN, sanitized):
        sanitized = re.sub(SSN_PATTERN, "[REDACTED_SSN]", sanitized)
        leaks_found.append("SSN")

    # Check for API key leakage
    if re.search(API_KEY_PATTERN, sanitized):
        sanitized = re.sub(API_KEY_PATTERN, "[REDACTED_API_KEY]", sanitized)
        leaks_found.append("API_KEY")

    return {
        "text": sanitized,
        "pii_redacted": len(leaks_found) > 0,
        "leaks_found": leaks_found
    }
