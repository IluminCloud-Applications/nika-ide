import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt

# Secret keys and encryption algorithms
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies that the raw password matches its hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hashes the password using bcrypt with 2a prefix for pgcrypto compatibility."""
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(prefix=b"2a"))
    return hashed.decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a JWT token containing data and an expiry timestamp."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    """Decodes a JWT token, returns payload if valid, otherwise None."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
