"""
Governor / Compliance Agent — Pure Groq LPU Engine
Independently re-verifies proposed decisions using Groq LLM deep reasoning (Llama-3.1-70B / Llama-3.3-70B).
Returns explicit connection error if Groq API keys or models fail (0 mock fallback).
"""

from backend.security.redaction import redact_pii
from backend.mcp_servers.policy_rag_mcp import query_policy
from backend.mcp_servers.rules_engine_mcp import evaluate_eligibility
from backend.llm.model_router import call_openrouter_model

def verify_proposal_with_governor(
    intent: str,
    proposal: dict,
    account_context: dict,
    session_account_id: str
) -> dict:
    """
    Governor verification gate.
    Returns approval status, governor notes, and real Groq model routing stats.
    """
    # Step 1: Apply Redaction Boundary before sending payload to LLM/Governor
    redacted_account = redact_pii(account_context)
    redacted_proposal = redact_pii(proposal)

    # Step 2: Independent Policy Re-retrieval
    independent_policy = query_policy(intent)

    # Step 3: Independent Deterministic Rules Engine Re-evaluation
    independent_eval = evaluate_eligibility(intent, account_context, independent_policy)

    # Step 4: Groq Deep Reasoning Model Policy Verification
    system_prompt = (
        "You are an American Express Compliance & Governor Agent.\n"
        "Your job is to independently verify whether a proposed customer servicing action complies strictly with active policy rules.\n"
        "Examine the redacted proposal, policy constraints, and deterministic evaluation result.\n"
        "Determine if the proposal is APPROVED or REJECTED. Provide 1-2 concise bullet points explaining your decision.\n"
        "Start your response with 'STATUS: APPROVED' or 'STATUS: REJECTED'."
    )

    user_prompt = (
        f"Intent: {intent}\n"
        f"Redacted Account State: {redacted_account}\n"
        f"Proposed Action: {redacted_proposal}\n"
        f"Independent Rules Evaluation: {independent_eval}\n"
        f"Active Policy Citation: {independent_policy.get('policy_id')} (v{independent_policy.get('version')})"
    )

    llm_res = call_openrouter_model("GOVERNOR_REASONING", system_prompt, user_prompt, temperature=0.1)

    llm_content = llm_res.get("content")

    # If Groq LLM connection failed, return real connection error
    if not llm_content:
        err_msg = llm_res.get("error", "Groq API Connection Error: Failed to connect to Groq LLM models.")
        return {
            "approved": False,
            "governor_notes": f"Governor Gate Error: {err_msg}",
            "independent_eval": independent_eval,
            "redacted_payload": redacted_proposal,
            "routing_stat": llm_res.get("stat", {}),
            "connection_error": True
        }

    is_llm_approved = "STATUS: REJECTED" not in llm_content
    deterministic_approved = independent_eval.get("eligible", False)

    # Hard gate: Deterministic rules engine MUST agree, LLM reasoning provides compliance sanity check
    final_approval = deterministic_approved and is_llm_approved

    return {
        "approved": final_approval,
        "governor_notes": llm_content,
        "independent_eval": independent_eval,
        "redacted_payload": redacted_proposal,
        "routing_stat": llm_res.get("stat", {})
    }
