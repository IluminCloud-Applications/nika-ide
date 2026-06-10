from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.core import get_db
from database.models import User
from auth.security import verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

# NOTE: This is a single-instance (white label / self-hosted) template.
# There is NO public registration — the only account is created once through
# the Setup flow (see api/setup.py). Here we only handle login and "me".

class UserLogin(BaseModel):
    email: str
    password: str

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Dependency to retrieve the authenticated user using the JWT in the Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid token. Please authenticate.",
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
        )
    user = db.query(User).filter(User.email == payload["sub"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token does not exist.",
        )
    return user

def _serialize(user: User) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticates the administrator and returns a JWT token."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": _serialize(user)}

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    """Retrieves current user details."""
    return _serialize(user)
