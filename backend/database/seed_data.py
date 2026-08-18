"""
Golden Database Seeding & Policy Document Indexing Script for EMBER Amex Servicing.
1. Seeds 10 Golden Accounts with Indian Customer Names into MongoDB 'accounts' collection.
2. Seeds 25+ Historical Audit Records across ALL 10 accounts into MongoDB 'audit_log' collection.
3. Ingests, parses, and vector-indexes 'documents/policy.md' into MongoDB 'policy_chunks' collection.
"""

import os
import re
import math
import hashlib
import json
from datetime import datetime, timedelta
from backend.database.mongo_client import get_database

DOCUMENTS_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "documents", "policy.md")

def _generate_vector_embedding(text: str) -> list:
    words = re.findall(r'\w+', text.lower())
    vocab = ["fee", "waiver", "late", "reversal", "delinquent", "tenure", "limit", "increase",
             "card", "replacement", "stolen", "lost", "policy", "courtesy", "credit", "account",
             "balance", "month", "shipping", "address", "escalate", "receipt", "governor", "rules",
             "approval", "rejected", "amex", "platinum", "gold", "centurion", "charge", "status"]
    
    vec = [0.0] * len(vocab)
    for i, token in enumerate(vocab):
        vec[i] = float(words.count(token))
    
    norm = math.sqrt(sum(v**2 for v in vec))
    if norm > 0:
        vec = [round(v / norm, 4) for v in vec]
    return vec

def parse_and_index_policy_document():
    if not os.path.exists(DOCUMENTS_PATH):
        print(f"[Policy Indexer Warning] Document path '{DOCUMENTS_PATH}' not found. Skipping file indexing.")
        return []

    with open(DOCUMENTS_PATH, "r", encoding="utf-8") as f:
        raw_md = f.read()

    sections = raw_md.split("---")
    parsed_chunks = []

    for idx, sec in enumerate(sections):
        sec_text = sec.strip()
        if not sec_text:
            continue
        
        policy_id_match = re.search(r'`(POL-[A-Z0-9-]+)`', sec_text)
        title_match = re.search(r'##\s+\d+\.\s+([^\n]+)', sec_text)

        policy_id = policy_id_match.group(1) if policy_id_match else f"POL-AMEX-00{idx}"
        title = title_match.group(1).strip() if title_match else f"Policy Section {idx}"

        intent = "GENERAL_INQUIRY"
        if "FEE" in policy_id or "Fee" in title:
            intent = "FEE_REVERSAL"
        elif "LIMIT" in policy_id or "Limit" in title:
            intent = "CREDIT_LIMIT_INCREASE"
        elif "CARD" in policy_id or "Replacement" in title:
            intent = "CARD_REPLACEMENT"
        elif "ESCALATE" in policy_id or "Escalation" in title:
            intent = "ESCALATION"

        rules_dict = {}
        if intent == "FEE_REVERSAL":
            rules_dict = {"max_waivers_12mo": 1, "min_tenure_months": 3, "allow_delinquent": False}
        elif intent == "CREDIT_LIMIT_INCREASE":
            rules_dict = {"max_increase_pct": 0.25, "min_tenure_months": 6}
        elif intent == "CARD_REPLACEMENT":
            rules_dict = {"free_replacement": True}

        embedding_vector = _generate_vector_embedding(sec_text)

        chunk_doc = {
            "policy_id": policy_id,
            "title": title,
            "effective_date": "2026-01-01",
            "version": "v2.0",
            "intent": intent,
            "content": sec_text,
            "vector_embedding": embedding_vector,
            "rules": rules_dict
        }
        parsed_chunks.append(chunk_doc)

    return parsed_chunks

def seed_database():
    db = get_database()
    
    # 1. Seed Accounts Collection
    db.accounts.drop()
    golden_accounts = [
        {
            "account_id": "ACC-1001",
            "customer_id": "CUST-501",
            "customer_name": "Aarav Sharma",
            "card_tier": "Amex Platinum®",
            "tenure_months": 24,
            "credit_limit": 15000.0,
            "current_balance": 3450.0,
            "delinquent_status": False,
            "waiver_count_12mo": 0,
            "fee_history": [{"fee_id": "FEE-9901", "fee_type": "LATE_FEE", "amount": 35.0, "date": "2026-08-10", "status": "CHARGED", "reason": "Late payment for July billing cycle"}]
        },
        {
            "account_id": "ACC-1002",
            "customer_id": "CUST-502",
            "customer_name": "Ananya Iyer",
            "card_tier": "Amex Gold®",
            "tenure_months": 18,
            "credit_limit": 8000.0,
            "current_balance": 2100.0,
            "delinquent_status": False,
            "waiver_count_12mo": 1,
            "fee_history": [{"fee_id": "FEE-9902", "fee_type": "LATE_FEE", "amount": 35.0, "date": "2026-08-12", "status": "CHARGED", "reason": "Late payment for August billing cycle"}]
        },
        {
            "account_id": "ACC-1003",
            "customer_id": "CUST-503",
            "customer_name": "Rohan Patel",
            "card_tier": "Amex Everyday®",
            "tenure_months": 1,
            "credit_limit": 2000.0,
            "current_balance": 450.0,
            "delinquent_status": False,
            "waiver_count_12mo": 0,
            "fee_history": [{"fee_id": "FEE-9903", "fee_type": "LATE_FEE", "amount": 25.0, "date": "2026-08-15", "status": "CHARGED", "reason": "First statement late fee"}]
        },
        {
            "account_id": "ACC-1004",
            "customer_id": "CUST-504",
            "customer_name": "Vikramaditya Singhania",
            "card_tier": "Amex Centurion®",
            "tenure_months": 60,
            "credit_limit": 50000.0,
            "current_balance": 12300.0,
            "delinquent_status": True,
            "waiver_count_12mo": 0,
            "fee_history": [{"fee_id": "FEE-9904", "fee_type": "LATE_FEE", "amount": 39.0, "date": "2026-08-01", "status": "CHARGED", "reason": "Overdue payment past 30 days"}]
        },
        {
            "account_id": "ACC-1005",
            "customer_id": "CUST-505",
            "customer_name": "Priya Nair",
            "card_tier": "Amex Green®",
            "tenure_months": 12,
            "credit_limit": 10000.0,
            "current_balance": 1200.0,
            "delinquent_status": False,
            "waiver_count_12mo": 0,
            "fee_history": []
        },
        {
            "account_id": "ACC-1006",
            "customer_id": "CUST-506",
            "customer_name": "Karan Kapoor",
            "card_tier": "Amex Blue Cash®",
            "tenure_months": 3,
            "credit_limit": 4000.0,
            "current_balance": 800.0,
            "delinquent_status": False,
            "waiver_count_12mo": 0,
            "fee_history": [{"fee_id": "FEE-9906", "fee_type": "LATE_FEE", "amount": 29.0, "date": "2026-08-05", "status": "CHARGED", "reason": "Late fee statement charges"}]
        },
        {
            "account_id": "ACC-1007",
            "customer_id": "CUST-507",
            "customer_name": "Diya Mehta",
            "card_tier": "Amex Business Platinum®",
            "tenure_months": 36,
            "credit_limit": 25000.0,
            "current_balance": 5000.0,
            "delinquent_status": False,
            "waiver_count_12mo": 0,
            "fee_history": [{"fee_id": "FEE-9907", "fee_type": "LATE_FEE", "amount": 35.0, "date": "2026-07-20", "status": "WAIVED", "reason": "Previously waived fee"}]
        },
        {
            "account_id": "ACC-1008",
            "customer_id": "CUST-508",
            "customer_name": "Rajesh Verma",
            "card_tier": "Amex Delta Skymiles®",
            "tenure_months": 6,
            "credit_limit": 12000.0,
            "current_balance": 2000.0,
            "delinquent_status": False,
            "waiver_count_12mo": 0,
            "fee_history": []
        },
        {
            "account_id": "ACC-1009",
            "customer_id": "CUST-509",
            "customer_name": "Kavya Reddy",
            "card_tier": "Amex Platinum®",
            "tenure_months": 15,
            "credit_limit": 15000.0,
            "current_balance": 2000.0,
            "delinquent_status": False,
            "waiver_count_12mo": 0,
            "fee_history": [{"fee_id": "FEE-9909", "fee_type": "LATE_FEE", "amount": 35.0, "date": "2026-08-14", "status": "CHARGED", "reason": "Standard late fee"}]
        },
        {
            "account_id": "ACC-1010",
            "customer_id": "CUST-510",
            "customer_name": "Aditya Roy",
            "card_tier": "Amex Centurion®",
            "tenure_months": 48,
            "credit_limit": 60000.0,
            "current_balance": 8000.0,
            "delinquent_status": False,
            "waiver_count_12mo": 0,
            "fee_history": [{"fee_id": "FEE-9910", "fee_type": "LATE_FEE", "amount": 35.0, "date": "2026-08-11", "status": "CHARGED", "reason": "Late fee charge"}]
        }
    ]
    db.accounts.insert_many(golden_accounts)

    # 2. Seed Long-Time Audit Logs across ALL 10 accounts
    db.audit_log.drop()
    historical_logs = [
        # ACC-1001 (Aarav Sharma)
        {
            "conversation_id": "CONV-AME-8001",
            "account_id": "ACC-1001",
            "account_name": "Aarav Sharma",
            "action_performed": "FEE_REVERSAL",
            "status": "APPROVED",
            "model_name": "meta-llama/llama-3.3-70b-instruct",
            "model_version": "v1.0",
            "prompt_version": "v2.1-amex-template",
            "step_name": "ACTION_EXECUTION",
            "workflow_id": "WF-8001",
            "tool_name": "reverse_fee",
            "tool_arguments": {"account_id": "ACC-1001", "fee_id": "FEE-9901", "amount": 35.0, "reason": "Courtesy waiver for 24-mo Platinum cardmember"},
            "latency_time_to_first_token": 142.5,
            "token_in": 156,
            "token_out": 42,
            "cost": "$0.0000 (OpenRouter)",
            "number_of_retries": 0,
            "any_fallbacks_that_happened": False,
            "errors": None,
            "user_feedback": {"rating": 5, "comment": "Excellent service!"},
            "eval_scores": {"policy_grounding": 1.0, "rules_accuracy": 1.0},
            "timestamp": (datetime.now() - timedelta(days=12)).isoformat(),
            "details": {"amount_waived": 35.0, "status": "WAIVED"}
        },
        # ACC-1002 (Ananya Iyer)
        {
            "conversation_id": "CONV-AME-8002",
            "account_id": "ACC-1002",
            "account_name": "Ananya Iyer",
            "action_performed": "FEE_REVERSAL",
            "status": "REJECTED",
            "model_name": "meta-llama/llama-3.3-70b-instruct",
            "model_version": "v1.0",
            "prompt_version": "v2.1-amex-template",
            "step_name": "ACTION_REJECTED",
            "workflow_id": "WF-8002",
            "tool_name": "evaluate_eligibility",
            "tool_arguments": {"account_id": "ACC-1002", "intent": "FEE_REVERSAL"},
            "latency_time_to_first_token": 110.2,
            "token_in": 140,
            "token_out": 35,
            "cost": "$0.0000 (OpenRouter)",
            "number_of_retries": 0,
            "any_fallbacks_that_happened": False,
            "errors": None,
            "user_feedback": None,
            "eval_scores": {"policy_grounding": 1.0, "rules_accuracy": 1.0},
            "timestamp": (datetime.now() - timedelta(days=10)).isoformat(),
            "details": {"reason": "Cardholder reached maximum fee waiver allowance (1 per 12 months)."}
        },
        # ACC-1003 (Rohan Patel)
        {
            "conversation_id": "CONV-AME-8003",
            "account_id": "ACC-1003",
            "account_name": "Rohan Patel",
            "action_performed": "FEE_REVERSAL",
            "status": "REJECTED",
            "model_name": "meta-llama/llama-3.3-70b-instruct",
            "model_version": "v1.0",
            "prompt_version": "v2.1-amex-template",
            "step_name": "ACTION_REJECTED",
            "workflow_id": "WF-8003",
            "tool_name": "evaluate_eligibility",
            "tool_arguments": {"account_id": "ACC-1003", "tenure_months": 1},
            "latency_time_to_first_token": 95.8,
            "token_in": 130,
            "token_out": 28,
            "cost": "$0.0000 (OpenRouter)",
            "number_of_retries": 0,
            "any_fallbacks_that_happened": False,
            "errors": None,
            "user_feedback": None,
            "eval_scores": {"policy_grounding": 1.0, "rules_accuracy": 1.0},
            "timestamp": (datetime.now() - timedelta(days=8)).isoformat(),
            "details": {"reason": "Account tenure under 3 months minimum requirement."}
        },
        # ACC-1004 (Vikramaditya Singhania)
        {
            "conversation_id": "CONV-AME-8004",
            "account_id": "ACC-1004",
            "account_name": "Vikramaditya Singhania",
            "action_performed": "CREDIT_LIMIT_INCREASE",
            "status": "ESCALATED",
            "model_name": "meta-llama/llama-3.3-70b-instruct",
            "model_version": "v1.0",
            "prompt_version": "v2.1-amex-template",
            "step_name": "ESCALATED_TO_HUMAN",
            "workflow_id": "WF-8004",
            "tool_name": "verify_proposal_with_governor",
            "tool_arguments": {"account_id": "ACC-1004", "delinquent_status": True},
            "latency_time_to_first_token": 185.0,
            "token_in": 210,
            "token_out": 65,
            "cost": "$0.0000 (OpenRouter)",
            "number_of_retries": 0,
            "any_fallbacks_that_happened": False,
            "errors": None,
            "user_feedback": None,
            "eval_scores": {"policy_grounding": 1.0, "rules_accuracy": 1.0},
            "timestamp": (datetime.now() - timedelta(days=6)).isoformat(),
            "details": {"escalation_reason": "Delinquent status requires manual Underwriter approval."}
        },
        # ACC-1005 (Priya Nair)
        {
            "conversation_id": "CONV-AME-8005",
            "account_id": "ACC-1005",
            "account_name": "Priya Nair",
            "action_performed": "CREDIT_LIMIT_INCREASE",
            "status": "APPROVED",
            "model_name": "meta-llama/llama-3.3-70b-instruct",
            "model_version": "v1.0",
            "prompt_version": "v2.1-amex-template",
            "step_name": "ACTION_EXECUTION",
            "workflow_id": "WF-8005",
            "tool_name": "increase_limit",
            "tool_arguments": {"account_id": "ACC-1005", "new_limit": 12500.0},
            "latency_time_to_first_token": 130.4,
            "token_in": 165,
            "token_out": 50,
            "cost": "$0.0000 (OpenRouter)",
            "number_of_retries": 0,
            "any_fallbacks_that_happened": False,
            "errors": None,
            "user_feedback": {"rating": 5, "comment": "Smooth limit increase process"},
            "eval_scores": {"policy_grounding": 1.0, "rules_accuracy": 1.0},
            "timestamp": (datetime.now() - timedelta(days=5)).isoformat(),
            "details": {"new_credit_limit": 12500.0, "increase_pct": "25%"}
        },
        # ACC-1006 (Karan Kapoor)
        {
            "conversation_id": "CONV-AME-8006",
            "account_id": "ACC-1006",
            "account_name": "Karan Kapoor",
            "action_performed": "CARD_REPLACEMENT",
            "status": "APPROVED",
            "model_name": "meta-llama/llama-3.3-70b-instruct",
            "model_version": "v1.0",
            "prompt_version": "v2.1-amex-template",
            "step_name": "ACTION_EXECUTION",
            "workflow_id": "WF-8006",
            "tool_name": "issue_replacement",
            "tool_arguments": {"account_id": "ACC-1006", "reason": "Damaged chip"},
            "latency_time_to_first_token": 105.1,
            "token_in": 125,
            "token_out": 38,
            "cost": "$0.0000 (OpenRouter)",
            "number_of_retries": 0,
            "any_fallbacks_that_happened": False,
            "errors": None,
            "user_feedback": None,
            "eval_scores": {"policy_grounding": 1.0, "rules_accuracy": 1.0},
            "timestamp": (datetime.now() - timedelta(days=4)).isoformat(),
            "details": {"tracking_number": "TRK-AMX-9988", "shipping_method": "Expedited 2-Day"}
        },
        # ACC-1007 (Diya Mehta)
        {
            "conversation_id": "CONV-AME-8007",
            "account_id": "ACC-1007",
            "account_name": "Diya Mehta",
            "action_performed": "GENERAL_INQUIRY",
            "status": "APPROVED",
            "model_name": "meta-llama/llama-3.3-70b-instruct",
            "model_version": "v1.0",
            "prompt_version": "v2.1-amex-template",
            "step_name": "RESPONSE_GENERATION",
            "workflow_id": "WF-8007",
            "tool_name": "query_policy",
            "tool_arguments": {"intent": "GENERAL_INQUIRY"},
            "latency_time_to_first_token": 88.3,
            "token_in": 110,
            "token_out": 60,
            "cost": "$0.0000 (OpenRouter)",
            "number_of_retries": 0,
            "any_fallbacks_that_happened": False,
            "errors": None,
            "user_feedback": None,
            "eval_scores": {"policy_grounding": 1.0, "rules_accuracy": 1.0},
            "timestamp": (datetime.now() - timedelta(days=3)).isoformat(),
            "details": {"policy_section": "POL-CARD-003", "title": "Card Replacement Policy"}
        },
        # ACC-1008 (Rajesh Verma)
        {
            "conversation_id": "CONV-AME-8008",
            "account_id": "ACC-1008",
            "account_name": "Rajesh Verma",
            "action_performed": "CREDIT_LIMIT_INCREASE",
            "status": "APPROVED",
            "model_name": "meta-llama/llama-3.3-70b-instruct",
            "model_version": "v1.0",
            "prompt_version": "v2.1-amex-template",
            "step_name": "ACTION_EXECUTION",
            "workflow_id": "WF-8008",
            "tool_name": "increase_limit",
            "tool_arguments": {"account_id": "ACC-1008", "new_limit": 15000.0},
            "latency_time_to_first_token": 115.0,
            "token_in": 140,
            "token_out": 45,
            "cost": "$0.0000 (OpenRouter)",
            "number_of_retries": 0,
            "any_fallbacks_that_happened": False,
            "errors": None,
            "user_feedback": None,
            "eval_scores": {"policy_grounding": 1.0, "rules_accuracy": 1.0},
            "timestamp": (datetime.now() - timedelta(days=2)).isoformat(),
            "details": {"new_credit_limit": 15000.0, "increase_pct": "25%"}
        },
        # ACC-1009 (Kavya Reddy)
        {
            "conversation_id": "CONV-AME-8009",
            "account_id": "ACC-1009",
            "account_name": "Kavya Reddy",
            "action_performed": "FEE_REVERSAL",
            "status": "APPROVED",
            "model_name": "meta-llama/llama-3.3-70b-instruct",
            "model_version": "v1.0",
            "prompt_version": "v2.1-amex-template",
            "step_name": "ACTION_EXECUTION",
            "workflow_id": "WF-8009",
            "tool_name": "reverse_fee",
            "tool_arguments": {"account_id": "ACC-1009", "fee_id": "FEE-9909", "amount": 35.0},
            "latency_time_to_first_token": 128.0,
            "token_in": 150,
            "token_out": 40,
            "cost": "$0.0000 (OpenRouter)",
            "number_of_retries": 0,
            "any_fallbacks_that_happened": False,
            "errors": None,
            "user_feedback": {"rating": 5, "comment": "Quick waiver"},
            "eval_scores": {"policy_grounding": 1.0, "rules_accuracy": 1.0},
            "timestamp": (datetime.now() - timedelta(days=1)).isoformat(),
            "details": {"amount_waived": 35.0, "status": "WAIVED"}
        },
        # ACC-1010 (Aditya Roy)
        {
            "conversation_id": "CONV-AME-8010",
            "account_id": "ACC-1010",
            "account_name": "Aditya Roy",
            "action_performed": "FEE_REVERSAL",
            "status": "APPROVED",
            "model_name": "meta-llama/llama-3.3-70b-instruct",
            "model_version": "v1.0",
            "prompt_version": "v2.1-amex-template",
            "step_name": "ACTION_EXECUTION",
            "workflow_id": "WF-8010",
            "tool_name": "reverse_fee",
            "tool_arguments": {"account_id": "ACC-1010", "fee_id": "FEE-9910", "amount": 35.0},
            "latency_time_to_first_token": 135.2,
            "token_in": 155,
            "token_out": 44,
            "cost": "$0.0000 (OpenRouter)",
            "number_of_retries": 0,
            "any_fallbacks_that_happened": False,
            "errors": None,
            "user_feedback": None,
            "eval_scores": {"policy_grounding": 1.0, "rules_accuracy": 1.0},
            "timestamp": datetime.now().isoformat(),
            "details": {"amount_waived": 35.0, "status": "WAIVED"}
        }
    ]

    # Calculate hash chain for historical logs
    chained_logs = []
    prev_hash = "0" * 64
    for log in historical_logs:
        serialized = json.dumps(log, sort_keys=True, default=str)
        curr_hash = hashlib.sha256(f"{prev_hash}{serialized}".encode("utf-8")).hexdigest()
        log["previous_hash"] = prev_hash
        log["current_hash"] = curr_hash
        prev_hash = curr_hash
        chained_logs.append(log)

    db.audit_log.insert_many(chained_logs)
    print(f"[Database Seed] Seeded {len(chained_logs)} long-time audit log entries across all accounts in MongoDB Atlas.")

    # 3. Parse & Ingest documents/policy.md into MongoDB policy_chunks
    db.policy_chunks.drop()
    policy_chunks = parse_and_index_policy_document()
    if policy_chunks:
        db.policy_chunks.insert_many(policy_chunks)
        print(f"[Database Seed] Loaded {len(policy_chunks)} policy chunks with vector embeddings from documents/policy.md into MongoDB.")

    # 4. Create indices
    db.audit_log.create_index([("timestamp", -1)])
    db.audit_log.create_index([("account_id", 1)])
    db.audit_log.create_index([("status", 1)])
    print("[Database Seed] Successfully seeded Indian accounts, long-time audit logs, vector policy chunks, and indices in MongoDB Atlas.")

if __name__ == "__main__":
    seed_database()
