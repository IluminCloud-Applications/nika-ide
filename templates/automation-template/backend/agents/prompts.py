# Prompts do agente. O LangChain aceita tuplas (role, content) para montar
# o prompt do sistema e o histórico de conversa de forma simples e expressiva.

SYSTEM_PROMPT = (
    "Você é um assistente prestativo e objetivo. "
    "Responda em português do Brasil, de forma clara e direta."
)


def build_chat_messages(history, message):
    """Monta a lista de mensagens para o chat, incluindo o histórico."""
    messages = [("system", SYSTEM_PROMPT)]
    for item in history or []:
        role = item.get("role") if isinstance(item, dict) else getattr(item, "role", None)
        content = item.get("content") if isinstance(item, dict) else getattr(item, "content", None)
        if not content:
            continue
        messages.append(("ai" if role == "assistant" else "human", content))
    messages.append(("human", message))
    return messages
