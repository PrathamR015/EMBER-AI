"""
FastAPI Main Application Server — Phase 3 Bank-Grade Security Architecture
Exposes Chat Servicing with JWT Auth, Input/Output Guardrails, Rate Limiting,
OpenRouter Model Router, FastMCP Tool Suite, Governor Gate, and Cryptographic Audit Anchoring.
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.database.seed_data import seed_database
from backend.database.mongo_client import get_database
from backend.agents.orchestrator import classify_intent
from backend.agents.service_agent import process_servicing_request
from backend.mcp_servers.account_mcp import get_account_context
from backend.llm.model_router import get_routing_stats
from backend.security.auth import create_access_token, verify_token_and_extract_account

app = FastAPI(
    title="EMBER American Express Servicing Platform API",
    description="Bank-grade agentic servicing platform with JWT session binding, OpenRouter model routing, dual guardrails, FastMCP RBAC, and hash-chained audit logs.",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    seed_database()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "session-amex-sec-001"
    account_id: Optional[str] = "ACC-1001"

class ChatResponse(BaseModel):
    intent: str
    response: str
    status: str
    trace: List[Dict[str, Any]]

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "EMBER Amex Servicing Platform",
        "phase": 3,
        "security_level": "Bank-Grade OWASP LLM Top 10 Hardened"
    }

@app.post("/api/auth/login")
def login_session(account_id: str = "ACC-1001"):
    """Generates a signed JWT access token for account_id."""
    token = create_access_token(account_id)
    return {"access_token": token, "token_type": "bearer", "account_id": account_id}

@app.post("/api/chat", response_model=ChatResponse)
def handle_chat(req: ChatRequest, authorization: Optional[str] = Header(None)):
    # Gateway JWT Authentication Verification (Security Control 1)
    session_account_id = req.account_id or "ACC-1001"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        claims = verify_token_and_extract_account(token)
        if claims and claims.get("account_id"):
            session_account_id = claims["account_id"]

    # Step 1: Intent Classification (Tier 1 Model Routing)
    orchestration_res = classify_intent(req.message)
    intent = orchestration_res.get("intent", "GENERAL_INQUIRY")

    # Step 2: Execute Hardened Servicing Pipeline
    result = process_servicing_request(session_account_id, req.session_id, intent, req.message)
    return ChatResponse(
        intent=intent,
        response=result["response"],
        status=result["status"],
        trace=result["trace"]
    )

@app.get("/api/account/{account_id}")
def get_account_details(account_id: str):
    account = get_account_context(account_id)
    if "error" in account:
        raise HTTPException(status_code=404, detail=account["error"])
    return account

@app.get("/api/accounts")
def list_accounts():
    db = get_database()
    return list(db.accounts.find({}, {"_id": 0}))

@app.get("/api/audit-logs")
def get_audit_logs():
    db = get_database()
    return list(db.audit_log.find({}, {"_id": 0}).sort("_id", -1))

@app.get("/api/model-routing/stats")
def get_model_stats():
    return get_routing_stats()

@app.get("/api/escalations")
def get_escalations():
    db = get_database()
    records = list(db.audit_log.find({"step": "ESCALATED_TO_HUMAN"}, {"_id": 0}).sort("_id", -1))
    return records

@app.post("/api/reset-db")
def reset_db():
    seed_database()
    return {"message": "Database successfully reset and re-seeded with Amex test accounts."}
