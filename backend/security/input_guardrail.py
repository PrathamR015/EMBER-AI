"""
Gateway Input Guardrail (OWASP LLM01 Prompt Injection & LLM07 System Prompt Leakage Defense)
Intercepts direct prompt injection attacks, instruction overrides, and prompt extraction attempts.
"""

import re
from typing import Dict, Any

# Signatures of prompt injection and system prompt extraction attacks
PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?prior\s+instructions",
    r"disregard\s+(all\s+)?policy\s+constraints",
    r"system\s+override",
    r"you\s+are\s+now\s+dan",
    r"repeat\s+(your\s+)?system\s+prompt",
    r"show\s+(me\s+)?(your\s+)?hidden\s+instructions",
    r"reveal\s+(your\s+)?api\s+key"
]

def inspect_user_input(user_prompt: str) -> Dict[str, Any]:
    """
    Scans incoming user text against security attack patterns.
    Returns status = 'SAFE' or 'BLOCKED'.
    """
    prompt_lower = user_prompt.lower()
    
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, prompt_lower):
            return {
                "safe": False,
                "status": "BLOCKED",
                "reason": "Security Alert: Direct prompt injection or unauthorized system instruction override detected.",
                "triggered_pattern": pattern
            }

    return {
        "safe": True,
        "status": "SAFE",
        "reason": "Input cleared by Gateway Input Guardrail."
    }
