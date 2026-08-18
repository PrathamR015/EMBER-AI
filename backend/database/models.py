from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FeeRecord(BaseModel):
    fee_id: str
    fee_type: str  # e.g., "LATE_FEE", "OVERLIMIT_FEE"
    amount: float
    date: str
    status: str  # "CHARGED", "WAIVED"
    reason: Optional[str] = None

class Account(BaseModel):
    account_id: str
    customer_id: str
    customer_name: str
    tenure_months: int
    credit_limit: float
    current_balance: float
    delinquent_status: bool
    waiver_count_12mo: int
    fee_history: List[FeeRecord] = []

class PolicyChunk(BaseModel):
    policy_id: str
    title: str
    effective_date: str
    version: str
    intent: str
    content: str
    rules: Dict[str, Any]

class AuditRecord(BaseModel):
    timestamp: str
    session_id: str
    account_id: str
    intent: str
    step: str
    details: Dict[str, Any]
    previous_hash: Optional[str] = None
    current_hash: Optional[str] = None
