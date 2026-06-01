---
name: input-validation
description: Validate all incoming API data strictly with Zod (TypeScript) or Pydantic/Joi (Python). Use whenever creating or modifying an API endpoint that accepts user input. Every field must be validated for type, format, and size before processing. Never trust client data.
---

## Strict Input Validation

**Rule:** Every field that enters the API must be validated before it touches business logic or the database.

## FastAPI — Pydantic (built-in)

FastAPI validates automatically when you declare a Pydantic schema:

```python
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Literal

class CreateUserSchema(BaseModel):
    email: EmailStr                          # validates email format
    name: str = Field(min_length=2, max_length=80)
    age: int  = Field(ge=0, le=120)          # 0 ≤ age ≤ 120
    role: Literal["admin", "user", "guest"]  # only these values

    @field_validator("name")
    @classmethod
    def no_script_tags(cls, v: str) -> str:
        if "<script" in v.lower():
            raise ValueError("Invalid characters in name")
        return v.strip()

@router.post("/users", response_model=UserOut)
def create_user(body: CreateUserSchema, db: Session = Depends(get_db)):
    # body is already validated — safe to use
    ...
```

FastAPI returns `422 Unprocessable Entity` automatically if validation fails.

## Frontend — Zod (TypeScript)

```ts
import { z } from 'zod'

const CreateUserSchema = z.object({
  email:    z.string().email(),
  name:     z.string().min(2).max(80),
  age:      z.number().int().min(0).max(120),
  role:     z.enum(['admin', 'user', 'guest']),
})

// In a form submit handler:
const result = CreateUserSchema.safeParse(formData)
if (!result.success) {
  // result.error.flatten() gives field-level errors
  return setErrors(result.error.flatten().fieldErrors)
}
// result.data is typed and safe
await api.createUser(result.data)
```

## Validation rules by field type

| Field type     | Validation to apply                                |
|----------------|----------------------------------------------------|
| ID / primary key | `int`, `gt=0` — reject strings immediately        |
| Email          | email format + max 254 chars                       |
| Password       | min 8 chars, no leading/trailing whitespace        |
| Free text      | max length, strip HTML tags                        |
| Enum / status  | explicit allowlist (`Literal` / `z.enum`)          |
| URL            | url format + allowlist of schemes (`https` only)   |
| File upload    | max size, mime type allowlist                      |
| Numeric amount | `Decimal`, min/max range, no scientific notation   |

## Gotchas

- **Validate on the backend always** — frontend validation is UX, not security.
- Reject requests where **extra unexpected fields** are sent (`model_config = ConfigDict(extra='forbid')` in Pydantic v2).
- A field that expects an integer ID should **immediately reject a string** — don't try to cast it.
- Sanitize free-text fields before storing: strip leading/trailing whitespace, reject obvious XSS patterns.
- Log validation failures (with IP, route, and offending field) — repeated failures indicate probing.
