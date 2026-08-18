"""
OpenRouter Multi-Model Router Engine — Active OpenRouter Production Slugs
Relies 100% on OpenRouter API (https://openrouter.ai/api/v1) for all LLM calls using active production model slugs.
"""

import time
import re
import requests
from typing import Dict, Any
from backend.config import (
    get_openrouter_key,
    OPENROUTER_BASE_URL,
    MODEL_CLASSIFIER,
    MODEL_REASONING,
    MODEL_GENERATOR
)

# Active OpenRouter Model Pools
OPENROUTER_MODEL_POOLS = {
    "INTENT_CLASSIFICATION": [
        "meta-llama/llama-3.3-70b-instruct",
        "meta-llama/llama-3.1-8b-instruct",
        "qwen/qwen-2.5-72b-instruct"
    ],
    "GOVERNOR_REASONING": [
        "meta-llama/llama-3.3-70b-instruct",
        "qwen/qwen-2.5-72b-instruct",
        "meta-llama/llama-3.1-8b-instruct"
    ],
    "RESPONSE_GENERATION": [
        "meta-llama/llama-3.3-70b-instruct",
        "qwen/qwen-2.5-72b-instruct",
        "meta-llama/llama-3.1-8b-instruct"
    ]
}

_routing_stats = {
    "provider": "OpenRouter API",
    "total_routed_calls": 0,
    "total_prompt_tokens": 0,
    "total_completion_tokens": 0,
    "total_cost_usd": 0.0,
    "tier_usage": {
        "INTENT_CLASSIFICATION": 0,
        "GOVERNOR_REASONING": 0,
        "RESPONSE_GENERATION": 0
    },
    "model_distribution": {},
    "latency_history_ms": []
}

def _strip_think_tags(text: str) -> str:
    if not text:
        return ""
    
    cleaned = text
    
    # 1. Strip XML <think>...</think> blocks
    cleaned = re.sub(r'<think>.*?</think>', '', cleaned, flags=re.DOTALL | re.IGNORECASE).strip()
    cleaned = re.sub(r'</?think>', '', cleaned, flags=re.IGNORECASE).strip()

    # 2. Strip Asterisk Self-Check Comments like *(Check: Warm? Yes...)*
    cleaned = re.sub(r'\*?\s*\(\s*Check:.*?\)\s*\*?', '', cleaned, flags=re.DOTALL | re.IGNORECASE).strip()

    # 3. Strip Markdown thinking headers
    if "thinking process" in cleaned.lower() or "mental refinement" in cleaned.lower():
        cleaned = re.sub(r"(?i)(Here's a|Here is a|Mental|Internal)?\s*thinking process:.*?(?=(\n\n[A-Z]|\n[A-Z][a-z]+|[A-Z][a-z]+\s+[A-Z][a-z]+,|$))", '', cleaned, flags=re.DOTALL).strip()
        cleaned = re.sub(r'(?m)^\s*\d+\.\s*\*\*.*?\*\*.*$', '', cleaned).strip()

    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def call_openrouter_model(
    task_tier: str,
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.2
) -> Dict[str, Any]:
    """
    Executes real LLM calls 100% via OpenRouter API across active production model pools.
    """
    global _routing_stats
    model_pool = OPENROUTER_MODEL_POOLS.get(task_tier, OPENROUTER_MODEL_POOLS["INTENT_CLASSIFICATION"])
    api_key = get_openrouter_key()

    if not api_key:
        return {
            "content": None,
            "error": "OpenRouter API Connection Error: OPENROUTER_API_KEY is missing or unconfigured in .env file.",
            "stat": {}
        }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "EMBER Servicing Platform",
        "Content-Type": "application/json"
    }

    strict_system_prompt = (
        f"{system_prompt}\n"
        "STRICT OUTPUT INSTRUCTION: Output ONLY the final customer-facing 2-sentence response. "
        "Do NOT output self-checks, thinking steps, or internal notes."
    )

    errors_encountered = []

    for model_name in model_pool:
        start_time = time.time()
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": strict_system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "max_tokens": 1200
        }

        try:
            res = requests.post(f"{OPENROUTER_BASE_URL}/chat/completions", headers=headers, json=payload, timeout=14)
            latency_ms = round((time.time() - start_time) * 1000, 2)

            if res.status_code == 200:
                data = res.json()
                raw_content = data["choices"][0]["message"]["content"]
                content = _strip_think_tags(raw_content)

                usage = data.get("usage", {})
                prompt_tokens = usage.get("prompt_tokens", len(strict_system_prompt + user_prompt) // 4)
                completion_tokens = usage.get("completion_tokens", len(content) // 4)

                _routing_stats["total_routed_calls"] += 1
                _routing_stats["total_prompt_tokens"] += prompt_tokens
                _routing_stats["total_completion_tokens"] += completion_tokens
                _routing_stats["tier_usage"][task_tier] = _routing_stats["tier_usage"].get(task_tier, 0) + 1
                _routing_stats["model_distribution"][model_name] = _routing_stats["model_distribution"].get(model_name, 0) + 1
                _routing_stats["latency_history_ms"].append(latency_ms)

                return {
                    "content": content,
                    "stat": {
                        "provider": "OpenRouter API",
                        "task_tier": task_tier,
                        "selected_model": model_name,
                        "latency_ms": latency_ms,
                        "prompt_tokens": prompt_tokens,
                        "completion_tokens": completion_tokens,
                        "cost": "$0.0000 (OpenRouter Tier)"
                    }
                }
            else:
                err_msg = f"OpenRouter HTTP {res.status_code} from '{model_name}': {res.text}"
                errors_encountered.append(err_msg)
                print(f"[OpenRouter Error] {err_msg}")

        except Exception as e:
            err_msg = f"OpenRouter Connection Exception for '{model_name}': {str(e)}"
            errors_encountered.append(err_msg)
            print(f"[OpenRouter Exception] {err_msg}")

    # No mock fallback — return explicit OpenRouter API Connection Error
    first_err = errors_encountered[0] if errors_encountered else "OpenRouter API connection failed."
    return {
        "content": None,
        "error": f"OpenRouter LLM API Connection Error: Could not connect to OpenRouter models. Details: {first_err}",
        "stat": {}
    }

def get_routing_stats() -> Dict[str, Any]:
    return {
        **_routing_stats,
        "openrouter_pools": OPENROUTER_MODEL_POOLS
    }
