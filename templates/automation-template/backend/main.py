import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn

from api.agent import router as agent_router
from automations.scheduler import start_scheduler, shutdown_scheduler

app = FastAPI(title="Automation API", description="Automation & AI Agents template")

# This template is BACKEND-FOCUSED. The frontend is a tiny status page; the real
# work happens in `backend/agents/` (LLM via LangChain + Gemini) and
# `backend/automations/` (scheduled jobs via APScheduler). Same origin: no CORS.

app.include_router(agent_router)


@app.on_event("startup")
def on_startup():
    start_scheduler()
    print("Scheduler iniciado.")


@app.on_event("shutdown")
def on_shutdown():
    shutdown_scheduler()


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "automation"}


# ── Static frontend ──────────────────────────────────────────────────────────
# In production the multi-stage Dockerfile builds the status page into
# `backend/static`. In development this is skipped (Vite serves it on 5177).
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
else:
    @app.get("/")
    def read_root():
        return {"status": "online", "message": "Automation backend running."}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8742, reload=True)
