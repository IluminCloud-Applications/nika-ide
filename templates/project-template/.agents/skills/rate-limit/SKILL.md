---
name: rate-limit
description: Apply rate limiting to API routes to prevent brute-force, DDoS, and abuse. Use when creating login endpoints, public APIs, password reset flows, or any route that could be hammered. Always add rate limiting before exposing an endpoint to the internet.
---

## Rate Limiting in this project

Use `slowDown` for gradual slowdown + `rateLimit` for hard blocks. Both come from `express-rate-limit` and `express-slow-down`.

```bash
pip install slowapi  # FastAPI
# or
npm install express-rate-limit express-slow-down  # Express
```

## FastAPI — with slowapi

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@router.post("/auth/login")
@limiter.limit("5/minute")          # 5 attempts per minute per IP
async def login(request: Request, body: LoginSchema, db: Session = Depends(get_db)):
    ...

@router.post("/auth/forgot-password")
@limiter.limit("3/hour")
async def forgot_password(request: Request, body: ForgotSchema):
    ...
```

## Limits by route type

| Route type            | Suggested limit       |
|-----------------------|-----------------------|
| Login / Register      | 5–10 / minute per IP  |
| Password reset        | 3 / hour per IP       |
| Public API (general)  | 60–100 / minute       |
| Authenticated API     | 200–500 / minute      |
| Webhooks (inbound)    | 30 / minute per IP    |

## Gotchas

- Rate limit by **user ID** (not just IP) once the user is authenticated — IPs can be shared (NAT, VPN).
- Return `429 Too Many Requests` with a `Retry-After` header.
- Store rate limit counters in **Redis** in production — in-memory resets on deploy.
- Never rate-limit health check endpoints (`/health`, `/ready`).
- Login rate limits must be **per IP + per username** to prevent credential stuffing.
