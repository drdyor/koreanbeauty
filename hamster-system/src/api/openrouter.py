"""OpenRouter API client for Hamster Council."""

import httpx
import asyncio
from typing import List, Dict, Any, Optional
from .config import OPENROUTER_API_KEY, OPENROUTER_API_URL, FREE_MODELS


async def query_model(
    model: str,
    messages: List[Dict[str, str]],
    max_tokens: int = 150,
    temperature: float = 0.7,
    timeout: float = 60.0
) -> Optional[Dict[str, Any]]:
    """
    Query a single model via OpenRouter API.

    Args:
        model: OpenRouter model identifier
        messages: List of message dicts with 'role' and 'content'
        max_tokens: Maximum tokens in response
        temperature: Sampling temperature
        timeout: Request timeout in seconds

    Returns:
        Response dict with 'content', or None if failed
    """
    if not OPENROUTER_API_KEY:
        print("[OpenRouter] No API key configured")
        return None

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://glowchi.app",
        "X-Title": "GlowChi Hamster Council",
    }

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers=headers,
                json=payload
            )
            response.raise_for_status()

            data = response.json()
            message = data['choices'][0]['message']

            return {
                'content': message.get('content', ''),
                'model': data.get('model', model),
            }

    except httpx.TimeoutException:
        print(f"[OpenRouter] Timeout querying {model}")
        return None
    except Exception as e:
        print(f"[OpenRouter] Error querying {model}: {e}")
        return None


async def query_model_with_fallback(
    messages: List[Dict[str, str]],
    models: List[str] = None,
    **kwargs
) -> Optional[Dict[str, Any]]:
    """
    Query models with automatic fallback on failure.

    Args:
        messages: Messages to send
        models: List of models to try (defaults to FREE_MODELS)
        **kwargs: Additional args passed to query_model

    Returns:
        First successful response, or None if all fail
    """
    models = models or FREE_MODELS

    for model in models:
        result = await query_model(model, messages, **kwargs)
        if result is not None:
            return result
        print(f"[OpenRouter] {model} failed, trying next...")

    return None


async def query_models_parallel(
    models_with_messages: Dict[str, List[Dict[str, str]]],
    **kwargs
) -> Dict[str, Optional[Dict[str, Any]]]:
    """
    Query multiple models in parallel with different messages.

    Args:
        models_with_messages: Dict mapping model identifiers to their messages
        **kwargs: Additional args passed to query_model

    Returns:
        Dict mapping model identifier to response (or None if failed)
    """
    async def query_with_key(key: str, messages: List[Dict[str, str]]):
        # Use fallback for each query
        result = await query_model_with_fallback(messages, **kwargs)
        return key, result

    tasks = [
        query_with_key(key, messages)
        for key, messages in models_with_messages.items()
    ]

    results = await asyncio.gather(*tasks)

    return {key: response for key, response in results}


async def query_hamsters_parallel(
    hamster_prompts: Dict[str, str],
    system_prompts: Dict[str, str],
    **kwargs
) -> Dict[str, Optional[Dict[str, Any]]]:
    """
    Query multiple hamsters in parallel.

    Args:
        hamster_prompts: Dict mapping hamster name to user message
        system_prompts: Dict mapping hamster name to system prompt
        **kwargs: Additional args

    Returns:
        Dict mapping hamster name to response
    """
    models_with_messages = {}

    for hamster_name, user_prompt in hamster_prompts.items():
        system_prompt = system_prompts.get(hamster_name, "You are a helpful assistant.")
        models_with_messages[hamster_name] = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

    return await query_models_parallel(models_with_messages, **kwargs)
