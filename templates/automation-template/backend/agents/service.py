from agents.llm import ai_enabled, get_llm
from agents.prompts import build_chat_messages


class AIUnavailable(Exception):
    """Lançada quando as chaves de API não estão configuradas."""


def _extract_text(content) -> str:
    """Normaliza o conteúdo retornado pelo LangChain em uma string limpa."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = [part if isinstance(part, str) else part.get("text", "") for part in content]
        return "".join(parts)
    return str(content)


def chat_reply(history, message: str) -> str:
    """Invoca o LLM com o histórico + nova mensagem e retorna o texto da resposta."""
    if not ai_enabled():
        raise AIUnavailable("Chave de API do Gemini não configurada no ambiente.")

    messages = build_chat_messages(history, message)
    response = get_llm().invoke(messages)
    text = _extract_text(getattr(response, "content", response)).strip()

    if not text:
        raise ValueError("Resposta vazia do modelo.")
    return text
