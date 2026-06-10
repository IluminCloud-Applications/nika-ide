import os
from sqlalchemy import create_engine, event, DDL
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/nika_db")

engine = create_engine(
    DATABASE_URL,
    # connection pooling configurations
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Enable pgcrypto extension before creating tables
event.listen(
    Base.metadata,
    "before_create",
    DDL("CREATE EXTENSION IF NOT EXISTS pgcrypto")
)

def get_db():
    """Dependency to get database session with automatic cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
