---
name: data-separation
description: Enforce strict frontend/backend data separation. Use when the project calls external APIs, stores API keys, uses bearer tokens, or has any secret credentials. The frontend must NEVER hold secrets — all external API calls go through the backend. Apply whenever building any feature that touches a third-party service.
---

## Frontend/Backend Data Separation

**Rule:** The frontend never holds secrets. It only talks to its own backend API.

```
Frontend  →  /api/...  →  Backend  →  External API (with secret key)
                ↑
        Only this boundary
        is exposed to the user
```

## What belongs where

| Data                        | Frontend | Backend |
|-----------------------------|----------|---------|
| VITE_API_URL (backend URL)  | ✅        | ❌       |
| API keys (OpenAI, Stripe…)  | ❌        | ✅       |
| Bearer tokens (external)    | ❌        | ✅       |
| Database credentials        | ❌        | ✅       |
| JWT secret                  | ❌        | ✅       |
| User's own auth token       | ✅ (memory only) | —  |

## Frontend .env — only the backend URL

```env
# frontend/.env
VITE_API_URL=http://localhost:8000
```

```ts
// frontend — all calls go through the backend
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/send-email`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${userToken}` },
  body: JSON.stringify({ to, subject, body }),
})
```

## Backend — proxy to external APIs

```python
# backend — holds the actual secret
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")  # never exposed to frontend

@router.post("/api/send-email")
async def send_email(body: EmailSchema, user = Depends(get_current_user)):
    response = httpx.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers={"Authorization": f"Bearer {SENDGRID_API_KEY}"},
        json={...}
    )
    return {"success": response.status_code == 202}
```

## Gotchas

- Any `VITE_` prefixed variable is **bundled into the frontend JS** and visible to anyone who inspects the browser. Never put secrets in `VITE_` vars.
- Backend `.env` must never be committed to git — add to `.gitignore`.
- In production, inject secrets via environment variables (Docker secrets, platform env vars) — never in code.
- If the frontend needs to know whether a feature is enabled (e.g. "is Stripe active?"), expose a config endpoint from the backend that returns booleans — not the keys themselves.
