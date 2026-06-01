---
name: cors-config
description: Configure CORS so the frontend can talk to the backend and no other origin can. Use when setting up a new project, adding a new domain, or whenever a CORS error appears. Both frontend and backend URLs must come from .env — never hardcoded.
---

## CORS Configuration

Both sides are configured via `.env` — the frontend points to the backend, and the backend whitelists the frontend's origin.

## Frontend `.env`

```env
# frontend/.env
VITE_API_URL=http://localhost:8000
```

```env
# frontend/.env.production
VITE_API_URL=https://api.myapp.com
```

Use in code:
```ts
const API = import.meta.env.VITE_API_URL
const res = await fetch(`${API}/api/users`)
```

## Backend `.env`

```env
# backend/.env
FRONTEND_ORIGIN=http://localhost:5177
# production:
# FRONTEND_ORIGIN=https://myapp.com
```

## FastAPI CORS setup

```python
from fastapi.middleware.cors import CORSMiddleware
import os

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5177")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],   # never use ["*"] in production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
```

## Multiple origins (e.g. staging + production)

```env
# backend/.env
FRONTEND_ORIGINS=https://myapp.com,https://staging.myapp.com
```

```python
FRONTEND_ORIGINS = os.getenv("FRONTEND_ORIGINS", "http://localhost:5177").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in FRONTEND_ORIGINS],
    ...
)
```

## Gotchas

- **Never use `allow_origins=["*"]` in production** — it allows any site to call your API with the user's credentials.
- `allow_credentials=True` requires an explicit origin list — it's incompatible with `["*"]`.
- Preflight (`OPTIONS`) requests must be handled — FastAPI's middleware does this automatically.
- When deploying behind a reverse proxy (nginx), ensure the `Origin` header is forwarded, not rewritten.
- The `VITE_API_URL` must not have a trailing slash — requests will double-slash otherwise.
