---
name: idor-prevention
description: Prevent Insecure Direct Object Reference (IDOR) vulnerabilities. Use when writing any endpoint that fetches, updates, or deletes a resource by ID. Every query must filter by the authenticated user's ID — changing an ID in the URL must never return another user's data.
---

## IDOR Prevention

**The rule:** Every database query for a user-owned resource must include **both** the resource ID and the authenticated user's ID as filters.

```
❌ GET /api/invoices/1044      → returns invoice 1044 for ANYONE authenticated
✅ GET /api/invoices/1044      → returns invoice 1044 ONLY IF it belongs to current user
```

## The pattern — always filter by owner

```python
# ❌ VULNERABLE — any authenticated user can read any invoice
@router.get("/invoices/{invoice_id}")
def get_invoice(invoice_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(404)
    return invoice

# ✅ SAFE — scoped to the authenticated user
@router.get("/invoices/{invoice_id}")
def get_invoice(invoice_id: int, db: Session = Depends(get_db), user = Depends(get_current_user)):
    invoice = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id, Invoice.user_id == user.id)  # ← both conditions
        .first()
    )
    if not invoice:
        raise HTTPException(404, detail="Not found")   # same message for missing AND unauthorized
    return invoice
```

## Apply to all CRUD operations

```python
# UPDATE
invoice = db.query(Invoice).filter(
    Invoice.id == invoice_id, Invoice.user_id == user.id
).first()
if not invoice:
    raise HTTPException(404)
invoice.status = body.status
db.commit()

# DELETE
invoice = db.query(Invoice).filter(
    Invoice.id == invoice_id, Invoice.user_id == user.id
).first()
if not invoice:
    raise HTTPException(404)
db.delete(invoice)
db.commit()

# LIST — always scope to current user
invoices = db.query(Invoice).filter(Invoice.user_id == user.id).all()
```

## Multi-tenant / organization resources

When a resource belongs to an **organization** (not just a user), scope by membership:

```python
def get_invoice(invoice_id: int, org_id: int, user = Depends(get_current_user), db = Depends(get_db)):
    # First verify user belongs to the org
    membership = db.query(OrgMember).filter(
        OrgMember.org_id == org_id, OrgMember.user_id == user.id
    ).first()
    if not membership:
        raise HTTPException(403)

    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id, Invoice.org_id == org_id
    ).first()
    if not invoice:
        raise HTTPException(404)
    return invoice
```

## Gotchas

- Always return **404** (not 403) when an unauthorized resource is requested — 403 reveals the resource exists.
- Never trust IDs sent in the **request body** for ownership checks — use the ID from the authenticated token.
- List endpoints must also be scoped — `/api/invoices` must never return all invoices in the database.
- If using UUIDs instead of sequential integers, it reduces guessability but does **not** replace authorization checks.
- Add an integration test for each resource type: create a resource as user A, attempt to access it as user B — expect 404.
