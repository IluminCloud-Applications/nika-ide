---
name: auth-jwt
description: Use when implementing authentication, login, registration, JWT tokens, protected routes, or session management. Activate for any auth-related task including password hashing, token refresh, route guards (frontend or backend), or user session handling.
---

## JWT Auth in this project

Authentication uses JWT (access + refresh tokens). Backend is FastAPI; frontend is React.

## Backend — token creation

```python
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret"   # load from env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def hash_password(password: str) -> str:
    # Use prefix=b"2a" for compatibility with PostgreSQL pgcrypto extension
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(prefix=b"2a")).decode("utf-8")
```

## Backend — protected dependency

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
```

## Frontend — token storage & axios

```ts
// Store tokens in memory (access) + httpOnly cookie (refresh)
// Never store access tokens in localStorage

axios.interceptors.request.use(config => {
  const token = getAccessToken()  // from memory/state
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

## Gotchas

- Never store JWT in `localStorage` — use memory for access token, httpOnly cookie for refresh.
- Always set `exp` on tokens. Never issue tokens without expiry.
- Refresh token rotation: issue a new refresh token on every refresh, invalidate the old one.
- Hash passwords with bcrypt — never store plaintext or MD5/SHA1.
- SECRET_KEY must come from environment variable, never hardcoded.
