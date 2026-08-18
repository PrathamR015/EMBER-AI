# American Express® Cardmember Servicing & Operational Policy Document

**Document Identifier:** `POL-AMEX-2026-V2`  
**Effective Date:** `2026-01-01`  
**Security Level:** Internal Servicing & Compliance Directive  
**Target Audience:** Servicing Agents, Governor Compliance Engine, RAG Index  

---

## 1. Late Payment Fee & Courtesy Waiver Policy (`POL-FEE-2026`)

### 1.1 Overview & Standard Assessment
American Express assesses a standard late payment fee of up to **$35.00** ($40.00 for repeat occurrences within 6 billing cycles) when the Minimum Payment Due is not credited to the Cardmember's account by the Payment Due Date stated on the monthly billing statement.

### 1.2 Courtesy Waiver Eligibility Criteria
Automated Servicing Agents and Customer Service Representatives are permitted to execute a full courtesy fee reversal **only** when all of the following deterministic rules are satisfied:
1. **Account Good Standing:** The Cardmember's account must NOT be in delinquent status (`delinquent_status == False`). Accounts past due 30+ days are strictly ineligible.
2. **Minimum Account Tenure:** The account must have been active for at least **3 continuous months** (`tenure_months >= 3`) from account opening.
3. **Rolling 12-Month Waiver Limit:** The Cardmember must have received **fewer than 1 courtesy fee waiver** within the preceding 12 rolling months (`waiver_count_12mo < 1`).
4. **Fee Status Verification:** The target fee must be actively recorded in `CHARGED` status. Fees previously `WAIVED`, `REVERSED`, or `DISPUTED` cannot be waived again.

---

## 2. Line of Credit & Credit Limit Increase Policy (`POL-LIMIT-2026`)

### 2.1 Eligibility Requirements for Credit Line Increases
Cardmembers may request an increase to their revolving credit limit subject to the following underwriting policy rules:
1. **Minimum Tenure Requirement:** The account must have a minimum of **6 continuous months** of active card membership history (`tenure_months >= 6`).
2. **Delinquency Status:** The account must be current with zero delinquent flags (`delinquent_status == False`).
3. **Maximum Line Increase Cap:** The maximum permissible automated credit limit increase is **25%** of the existing credit line (`max_increase_pct = 0.25`), capped at a maximum of **$5,000.00** per increase request.
4. **Cooling Period:** At least **6 months** must have elapsed since the previous approved credit line increase.

---

## 3. Card Replacement & Lost/Stolen Shipping Policy (`POL-CARD-2026`)

### 3.1 Replacement Orders
Physical card replacement orders may be initiated for cards that are lost, stolen, damaged, unreadable, or compromised.

### 3.2 Terms & Shipping
1. **Fee:** **$0.00** (Complimentary expedited replacement for all Amex Centurion®, Platinum®, Gold®, Green®, and Blue Cash® Cardmembers).
2. **Delivery Destination:** Cards are shipped to the primary billing address registered to the authenticated session context (`session_account_id`).
3. **Tracking & Dispatch:** Orders receive an automated order confirmation ID (`ORD-XXXXXX`) and ship within 24-48 hours via expedited courier.

---

## 4. Hardship & Human Escalation Policy (`POL-ESCALATE-2026`)

### 4.1 Automated Escalation Triggers
Any servicing request that fails automated rules engine criteria due to extreme edge cases, Governor compliance flags, or suspected security anomalies MUST be routed to the Senior Servicing Specialist Console.
1. **Escalation Receipt:** Every escalated request receives a unique receipt identifier (`RCT-XXXXXX`).
2. **Override Authority:** Human Specialists possess discretionary override authority upon secondary identity verification.
