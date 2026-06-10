from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.core import get_db
from database.models import User
from auth.security import verify_password, get_password_hash, create_access_token, decode_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

class UserSignup(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

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

@router.post("/register")
def register(data: UserSignup, db: Session = Depends(get_db)):
    """Registers a new user and returns a JWT token."""
    if not data.email or not data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    # Create new user
    new_user = User(
        email=data.email,
        password=get_password_hash(data.password),
        name=data.name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    token = create_access_token(data={"sub": new_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(new_user.id),
            "email": new_user.email,
            "name": new_user.name,
            "created_at": new_user.created_at.isoformat() if new_user.created_at else None
        }
    }

@router.post("/login")
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticates user and returns a JWT token."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    token = create_access_token(data={"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    }

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    """Retrieves current user details."""
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }
