from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.core import get_db
from database.models import User
from auth.security import get_password_hash, create_access_token

router = APIRouter(prefix="/api/setup", tags=["setup"])

class SetupData(BaseModel):
    name: str
    email: str
    password: str
    confirm_password: str

def is_configured(db: Session) -> bool:
    """The app is 'configured' once the single admin user exists."""
    return db.query(User).first() is not None

@router.get("/status")
def setup_status(db: Session = Depends(get_db)):
    """Tells the frontend whether the initial setup has already been done."""
    return {"configured": is_configured(db)}

@router.post("")
def run_setup(data: SetupData, db: Session = Depends(get_db)):
    """Creates the single administrator account on first run (WordPress-style).

    Once a user exists this endpoint is locked: the app only ever has one user.
    """
    if is_configured(db):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Setup já foi concluído. O aplicativo já possui um administrador.",
        )

    if not data.name or not data.email or not data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nome, e-mail e senha são obrigatórios.",
        )

    if data.password != data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="As senhas não coincidem.",
        )

    if len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha deve ter pelo menos 6 caracteres.",
        )

    admin = User(
        name=data.name,
        email=data.email,
        password=get_password_hash(data.password),
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)

    token = create_access_token(data={"sub": admin.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(admin.id),
            "name": admin.name,
            "email": admin.email,
            "created_at": admin.created_at.isoformat() if admin.created_at else None,
        },
    }
