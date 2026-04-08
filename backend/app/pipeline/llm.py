from __future__ import annotations

import json

from langchain_groq import ChatGroq

from app.core.config import get_settings


def ask_json(prompt: str, fallback: dict) -> dict:
    settings = get_settings()
    if not settings.groq_api_key:
        return fallback
    try:
        llm = ChatGroq(model=settings.groq_model, api_key=settings.groq_api_key, temperature=0.2)
        response = llm.invoke(prompt)
        text = getattr(response, "content", "") or ""
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            return json.loads(text[start : end + 1])
    except Exception:
        return fallback
    return fallback
