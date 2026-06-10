import os
import time
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn

from database.core import engine, Base
# Import models to ensure they are registered before create_all
from database.models import User
from api.auth import router as auth_router
from api.setup import router as setup_router

app = FastAPI(title="App API", description="Self-hosted / White Label template")

# This template is single-instance: the frontend is served by this same backend
# under "/" and the API lives under "/api". Because everything runs on the same
# origin, there is NO CORS configuration and NO frontend environment variables.

# Register API routers (must be added BEFORE the static mount below).
app.include_router(setup_router)
app.include_router(auth_router)

@app.on_event("startup")
def startup_db_init():
    """Initializes tables, retrying if PostgreSQL database is still booting."""
    retries = 5
    while retries > 0:
        try:
            Base.metadata.create_all(bind=engine)
            print("Database tables initialized successfully!")
            break
        except Exception as e:
            retries -= 1
            print(f"Database connection failed. Retrying in 2 seconds... ({retries} retries left)")
            time.sleep(2)
    if retries == 0:
        print("Could not connect to database on startup. Please verify credentials/host.")

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

# ── Static frontend ──────────────────────────────────────────────────────────
# In production the multi-stage Dockerfile builds the React app into
# `backend/static`. When that folder exists we serve the SPA from "/".
# In development this folder does not exist (the IDE runs Vite separately on
# port 5177 and proxies /api here), so this block is simply skipped.
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
else:
    @app.get("/")
    def read_root():
        return {
            "status": "online",
            "message": "API running. Frontend is served by Vite in development.",
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8742, reload=True)
