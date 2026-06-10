from apscheduler.schedulers.asyncio import AsyncIOScheduler

# Base de agendamento (APScheduler). Registre suas automações aqui.
# Exemplos de uso (descomente e crie suas funções):
#
#   async def minha_tarefa():
#       ...
#   scheduler.add_job(minha_tarefa, "interval", minutes=60)   # a cada hora
#   scheduler.add_job(minha_tarefa, "cron", hour=8)            # todo dia 08h

scheduler = AsyncIOScheduler()


def start_scheduler():
    """Inicia o agendador. Adicione seus jobs antes de chamar, ou aqui."""
    if not scheduler.running:
        scheduler.start()


def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
