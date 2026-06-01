import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from database.core import engine, Base
# Import models to ensure they are registered before create_all
from database.models import User
from api.auth import router as auth_router

app = FastAPI(title="Nika API", description="Python API template for Nika IDE projects")

# Configure CORS to accept requests from our Vite frontend (default: 5177)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5177",
        "http://localhost:5173",
        "http://localhost:3333"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the auth router
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

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "FastAPI is running successfully!",
        "database": "configured",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8742, reload=True)
