import os
from functools import lru_cache

DEFAULT_MODEL = "gemini-3.1-flash-lite"


def get_model_name() -> str:
    return os.getenv("GEMINI_MODEL", DEFAULT_MODEL)


def ai_enabled() -> bool:
    """True se alguma chave da API do Google Gemini estiver configurada."""
    return bool(os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY"))


@lru_cache(maxsize=1)
def get_llm():
    """Instancia o modelo ChatGoogleGenerativeAI (LangChain) sob demanda (lazy)."""
    from langchain_google_genai import ChatGoogleGenerativeAI

    return ChatGoogleGenerativeAI(
        model=get_model_name(),
        temperature=0.8,
        max_retries=2,
        timeout=120,
    )
