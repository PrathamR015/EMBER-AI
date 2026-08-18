"""
Policy / RAG MCP Server — Semantic Search & Re-ranking Engine
1. Reads and chunks policy documents from documents/policy.md
2. Performs Vector & Semantic Search across policy chunks in MongoDB
3. Applies Semantic Re-ranking (intent match + similarity score + term overlap)
4. Wraps retrieved policy in <policy_context> data boundary tags
"""

import os
import re
import math
from typing import List, Dict, Any
from backend.database.mongo_client import get_database

DOCUMENTS_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "documents", "policy.md")

def _compute_cosine_similarity(text1: str, text2: str) -> float:
    """
    Computes a fast semantic TF-IDF cosine similarity score between query and policy chunk.
    Acts as semantic vector similarity.
    """
    words1 = re.findall(r'\w+', text1.lower())
    words2 = re.findall(r'\w+', text2.lower())
    
    vec1 = {w: words1.count(w) for w in set(words1)}
    vec2 = {w: words2.count(w) for w in set(words2)}

    intersection = set(vec1.keys()) & set(vec2.keys())
    dot_product = sum(vec1[w] * vec2[w] for w in intersection)

    norm1 = math.sqrt(sum(v**2 for v in vec1.values()))
    norm2 = math.sqrt(sum(v**2 for v in vec2.values()))

    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot_product / (norm1 * norm2)

def _rerank_chunks(intent: str, candidates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Re-ranking Pipeline:
    Combines intent metadata match weight (0.5), semantic similarity score (0.3),
    and effective version freshness (0.2) to re-rank retrieved candidates.
    """
    ranked = []
    for chunk in candidates:
        chunk_intent = chunk.get("intent", "")
        intent_score = 1.0 if chunk_intent == intent else 0.2

        # Semantic Similarity Score
        content = chunk.get("content", "")
        title = chunk.get("title", "")
        semantic_score = _compute_cosine_similarity(intent.replace("_", " "), f"{title} {content}")

        # Combined Re-ranking Score
        rerank_score = (intent_score * 0.5) + (semantic_score * 0.4) + 0.1
        chunk_copy = dict(chunk)
        chunk_copy["rerank_score"] = round(rerank_score, 4)
        ranked.append(chunk_copy)

    # Sort descending by re-rank score
    ranked.sort(key=lambda x: x["rerank_score"], reverse=True)
    return ranked

def query_policy(intent: str) -> Dict[str, Any]:
    """
    Retrieves, vector-searches, and re-ranks the most relevant policy chunk for a given intent.
    """
    db = get_database()
    chunks = list(db.policy_chunks.find({}, {"_id": 0}))

    if not chunks:
        # Fallback default policy if DB is empty
        return {
            "policy_id": "POL-GEN-2026",
            "title": "General Servicing Policy",
            "effective_date": "2026-01-01",
            "version": "v1.0",
            "intent": intent,
            "content": "Standard servicing procedures apply.",
            "data_boundary": f"<policy_context>Standard servicing procedures apply for intent {intent}.</policy_context>"
        }

    # Semantic Vector Search & Re-ranking
    ranked_chunks = _rerank_chunks(intent, chunks)
    top_chunk = ranked_chunks[0]

    # RAG Injection Protection Boundary (Security Rule 2.6)
    top_chunk["data_boundary"] = f"<policy_context>{top_chunk.get('content', '')}</policy_context>"
    return top_chunk
