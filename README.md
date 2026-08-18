# EMBER — Cardmember Servicing Platform

> **Every Move Backed by Evidence & Reason**

<p align="center">
  <img src="https://img.shields.io/badge/Python_3.13-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.13" />
  <img src="https://img.shields.io/badge/FastAPI-005587?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas" />
  <img src="https://img.shields.io/badge/LangGraph-FF6F00?style=for-the-badge&logo=langchain&logoColor=white" alt="LangGraph" />
  <br />
  <img src="https://img.shields.io/badge/OpenRouter-6366F1?style=for-the-badge&logo=openai&logoColor=white" alt="OpenRouter" />
  <img src="https://img.shields.io/badge/Llama_3.3_70B-0467DF?style=for-the-badge&logo=meta&logoColor=white" alt="Llama 3.3 70B" />
  <img src="https://img.shields.io/badge/FastMCP-0070D2?style=for-the-badge&logo=anthropic&logoColor=white" alt="FastMCP" />
  <img src="https://img.shields.io/badge/7--Layer_Telemetry-0070D2?style=for-the-badge&logo=americanexpress&logoColor=white" alt="7-Layer Telemetry" />
  <img src="https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT Auth" />
</p>

EMBER is an enterprise-grade Cardmember Servicing Platform engineered specifically for American Express. Built with a **7-Layer Agent Telemetry System**, deterministic **FastMCP Rules Engine**, **RAG Policy Vector Search**, and an **OpenRouter Multi-Model LLM Router**, EMBER enforces strict policy compliance, zero financial hallucination on fee waivers/limit calculations, cryptographic audit chaining, and JWT session locking.

---

## Technical Architecture

```
                                 ┌──────────────────────────────────────────┐
                                 │   Vite React 18 Frontend (Amex Theme)    │
                                 └────────────────────┬─────────────────────┘
                                                      │ JWT Auth Header
                                                      ▼
                                 ┌──────────────────────────────────────────┐
                                 │     FastAPI Backend (Port 8000)          │
                                 └────────────────────┬─────────────────────┘
                                                      │
         ┌────────────────────────────────────────────┼────────────────────────────────────────────┐
         │                                            │                                            │
         ▼                                            ▼                                            ▼
┌──────────────────┐                       ┌─────────────────────┐                      ┌──────────────────────┐
│  FastMCP Engine  │                       │ OpenRouter Router   │                      │  MongoDB Atlas       │
│  Deterministic   │                       │ Multi-Model LLMs    │                      │  Servicing DB        │
└────────┬─────────┘                       └──────────┬──────────┘                      └──────────┬───────────┘
         │                                            │                                            │
         ▼                                            ▼                                            ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    7-LAYER AGENT TELEMETRY ENGINE                                        │
│  Layer 1: Context Retrieval  •  Layer 2: RAG Policy Search  •  Layer 3: Deterministic Rules Engine    │
│  Layer 4: Governor Gate      •  Layer 5: Idempotent Execution  •  Layer 6/7: Audit Hash Chaining         │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Technical Specifications

### 1. Authentic American Express Corporate Design

- Designed strictly to match official American Express corporate design guidelines.
- Signature **EMBER** square logo with blue text (`#0070d2`) and a 2px solid blue border on clean white surfaces.
- Official tagline: _"Every Move Backed by Evidence & Reason"_.

### 2. 7-Layer Agent Telemetry System

Every servicing query undergoes sequential multi-layer evaluation with real-time UI layer flashing:

- **Layer 1 (FastMCP Context Retrieval)**: Session-bound account context retrieval locked to JWT claims.
- **Layer 2 (Policy RAG)**: Metadata pre-filter + vector embedding cosine similarity re-ranking over Amex policy documents (`documents/policy.md`).
- **Layer 3 (Deterministic Rules Engine)**: Money math and eligibility verification calculated in Python outside LLMs.
- **Layer 4 (Governor Compliance Gate)**: Independent redaction boundary and safety check.
- **Layer 5 (Action Execution)**: Idempotent write execution with server-derived SHA-256 mutation keys.
- **Layer 5 Alt (Rejection Boundary)**: Policy constraint rejection with clear rule explanation.
- **Layer 5 Alt (Human Escalation Gateway)**: Automatic escalation for delinquent accounts requiring Underwriter approval.

### 3. OpenRouter Multi-Model Router Engine

Unified LLM engine operating 100% via **OpenRouter API** (`https://openrouter.ai/api/v1`):

- **Intent Classifier**: `meta-llama/llama-3.3-70b-instruct`
- **Governor Reasoning**: `meta-llama/llama-3.3-70b-instruct`
- **Response Generation**: `meta-llama/llama-3.3-70b-instruct`
- Dynamic token budget (1,200 tokens) with automatic stripping of CoT `<think>` tags and internal self-checks.

### 4. Enterprise Admin Console (Human Console)

- Comprehensive long-term audit trail for **every request made from every account** stored in MongoDB Atlas (`audit_log` collection).
- **5 Live KPI Metric Cards**: Total Audit Records, Approval Rate (%), Policy Rejections, Human Escalation Count, Unique Audited Accounts.
- **Multi-Factor Admin Filters**: Search box, Cardmember Account Selector, Status Filter (`APPROVED`, `REJECTED`, `ESCALATED`), and Action Filter (`FEE_REVERSAL`, `CREDIT_LIMIT_INCREASE`, `CARD_REPLACEMENT`, `GENERAL_INQUIRY`).
- **17-Field Detailed Telemetry Inspection** including model names, prompt versions, latency (TTFT), token usage, costs, tool arguments payload, user ratings, evaluation scores, and cryptographic SHA-256 hashes.

### 5. Golden Cardmember Demo Accounts

Pre-seeded with authentic Indian customer accounts across all major Amex card tiers:

1. `ACC-1001`: **Aarav Sharma** (_Amex Platinum®_)
2. `ACC-1002`: **Ananya Iyer** (_Amex Gold®_)
3. `ACC-1003`: **Rohan Patel** (_Amex Everyday®_)
4. `ACC-1004`: **Vikramaditya Singhania** (_Amex Centurion® - Delinquent_)
5. `ACC-1005`: **Priya Nair** (_Amex Green®_)
6. `ACC-1006`: **Karan Kapoor** (_Amex Blue Cash®_)
7. `ACC-1007`: **Diya Mehta** (_Amex Business Platinum®_)
8. `ACC-1008`: **Rajesh Verma** (_Amex Delta Skymiles®_)
9. `ACC-1009`: **Kavya Reddy** (_Amex Platinum®_)
10. `ACC-1010`: **Aditya Roy** (_Amex Centurion®_)

---

## Tech Stack & Dependencies

| Component          | Framework / Technology        | Purpose                                         |
| :----------------- | :---------------------------- | :---------------------------------------------- |
| **Backend API**    | Python 3.13, FastAPI, Uvicorn | High-performance async REST backend             |
| **LLM Gateway**    | OpenRouter API (`requests`)   | Multi-model routing & generation                |
| **Rules Engine**   | FastMCP Protocol / Custom MCP | Deterministic financial & policy logic          |
| **Database**       | MongoDB Atlas (`pymongo`)     | Persistent accounts, audit logs & vector chunks |
| **Authentication** | PyJWT                         | JWT bearer session authentication               |
| **Frontend UI**    | React 18, Vite                | Component-driven UI dashboard                   |
| **Design System**  | Custom CSS3 Tokens            | Official American Express corporate theme       |

---

## Quick Start Guide

### 1. Environment Configuration (`.env`)

Create a `.env` file in the project root based on `.env.example`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.l9xnxmy.mongodb.net/?appName=Cluster0
DB_NAME=ember_servicing_db
USE_MOCK_MONGO=false
```

### 2. Database Seeding

Seed accounts, long-time historical audit logs, and vector policy chunks into MongoDB:

```bash
python backend/database/seed_data.py
```

### 3. Start Backend Server

```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Start Frontend UI

```bash
cd frontend
npm install
npm run dev
```

Access the application at http://localhost:3000.
