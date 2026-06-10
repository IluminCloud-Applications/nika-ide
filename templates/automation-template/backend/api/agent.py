from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel
from agents.service import chat_reply, AIUnavailable

router = APIRouter(prefix="/api/agent", tags=["agent"])

_FALLBACK_REPLY = "Meu módulo de IA está offline (verifique a chave GEMINI_API_KEY)."


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None


@router.post("/chat")
def chat(data: ChatRequest):
    """Responde uma mensagem usando o LLM (LangChain + Gemini), com fallback.

    Stateless: o histórico vem na requisição. Persista no Redis/banco se precisar.
    """
    history = [m.model_dump() for m in (data.history or [])]
    try:
        reply = chat_reply(history, data.message)
        source = "ai"
    except (AIUnavailable, Exception):
        reply = _FALLBACK_REPLY
        source = "fallback"
    return {"reply": reply, "source": source}
