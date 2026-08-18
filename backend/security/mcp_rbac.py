"""
FastMCP Tool-Level Role-Based Access Control (RBAC Middleware) (OWASP LLM07 Excessive Agency Defense)
Enforces strict tool invocation permissions per agent role.
"""

from typing import Dict, Any

ROLE_PERMISSIONS = {
    "SERVICE_AGENT": [
        "get_account_context",
        "query_policy",
        "evaluate_eligibility",
        "append_record"
    ],
    "GOVERNOR_AGENT": [
        "get_account_context",
        "query_policy",
        "evaluate_eligibility",
        "append_record"
    ],
    "ACTION_EXECUTION_LAYER": [
        "reverse_fee",
        "increase_limit",
        "issue_replacement",
        "append_record"
    ]
}

def authorize_tool_invocation(agent_role: str, tool_name: str) -> Dict[str, Any]:
    """
    Validates if the invoking agent role is authorized to execute the target FastMCP tool.
    """
    allowed_tools = ROLE_PERMISSIONS.get(agent_role, [])
    if tool_name not in allowed_tools:
        return {
            "authorized": False,
            "reason": f"Access Denied: Agent role '{agent_role}' is not authorized to invoke tool '{tool_name}' (Excessive Agency Guardrail)."
        }
    return {
        "authorized": True,
        "reason": "Authorized by FastMCP Tool RBAC middleware."
    }
