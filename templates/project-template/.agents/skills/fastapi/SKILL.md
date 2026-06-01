---
name: fastapi
description: Use FastAPI when building Python backend APIs. Activate when creating routes, endpoints, request/response schemas, middleware, background tasks, or any server-side Python code. Also use when the user asks about Pydantic models, API validation, OpenAPI docs, or Python async backends.
---

## FastAPI in this project

Backend lives alongside the Electron/React frontend. FastAPI server runs separately (typically on port 8000).

## Project structure

```
backend/
  main.py           # App entry point, router includes
  routers/
    users.py
    projects.py
  models/
    user.py         # SQLAlchemy models
  schemas/
    user.py         # Pydantic schemas (request/response)
  deps.py           # Shared dependencies (DB session, current user)
  database.py       # Engine, SessionLocal, Base
```

## Basic route pattern

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.deps import get_db

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Pydantic schemas

```python
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode in v1)
```

## Startup

```bash
uvicorn main:app --reload --port 8000
```

## Gotchas

- Use `from_attributes = True` (Pydantic v2) instead of `orm_mode = True` (v1).
- Always use `Depends(get_db)` for DB sessions — never create sessions inside route functions.
- Async routes (`async def`) should use async DB drivers (asyncpg) or run sync code in a thread pool.
- HTTPException status codes: 400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 422 validation error (auto by FastAPI).
