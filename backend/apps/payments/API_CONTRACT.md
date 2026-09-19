# NUVORA Payment API Contract (Phase 8D — Hardened)

Base URL: `/api`

---

## POST /api/payments/initialize/

Initialize payment for an existing order.

**Auth:** Required (JWT Bearer)

**Request:**
```json
{
    "order_number": "NUV-XXXX-YY"
}
```

**Success (201):**
```json
{
    "payment_reference": "PAY-NUV-XXXX-YY",
    "provider": "paystack",
    "amount": "10000.00",
    "currency": "NGN",
    "status": "pending",
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "...",
    "order_number": "NUV-XXXX-YY"
}
```

**Errors:**
| Status | Code | Condition |
|--------|------|-----------|
| 401 | — | Unauthenticated |
| 404 | order_not_found | Order doesn't exist or not owned by user |
| 400 | order_already_paid | Order is already paid |
| 400 | order_cancelled | Order has been cancelled |
| 502 | payment_initialization_failed | Provider API call failed |

**Invariants:**
- Amount is always derived from `Order.total` (server-authoritative).
- Client cannot influence payment amount, currency, or pricing.
- If an active pending payment exists, it is cancelled before creating a new one.
- Already-paid orders are rejected; no new payment record is created.

---

## GET /api/payments/<payment_reference>/

Retrieve payment status. Used by frontend polling.

**Auth:** Required (JWT Bearer)

**Success (200):**
```json
{
    "id": 1,
    "payment_reference": "PAY-NUV-XXXX-YY",
    "order": 1,
    "provider": "paystack",
    "amount": "10000.00",
    "currency": "NGN",
    "status": "pending",
    "provider_transaction_id": "",
    "paid_at": null,
    "created_at": "2026-09-19T05:00:00Z",
    "updated_at": "2026-09-19T05:00:00Z"
}
```

**Terminal statuses:** `successful`, `failed`, `cancelled`

**Errors:**
| Status | Code | Condition |
|--------|------|-----------|
| 401 | — | Unauthenticated |
| 404 | payment_not_found | Not found or not owned by user |

**Security:**
- `provider_response` (internal) is NOT exposed to frontend.
- Non-owner receives 404 (not 403) to prevent enumeration.
- Payment reference is an identifier, not an authorization credential.

---

## POST /api/payments/<order_number>/retry/

Retry payment for an order with a new payment reference.

**Auth:** Required (JWT Bearer)

**Request:**
```json
{
    "provider": "paystack"
}
```

**Success (201):** Same structure as initialize response with a new `payment_reference`.

**Errors:**
| Status | Code | Condition |
|--------|------|-----------|
| 401 | — | Unauthenticated |
| 404 | order_not_found | Order doesn't exist or not owned by user |
| 400 | order_already_paid | Order is already paid |
| 400 | order_cancelled | Order has been cancelled |
| 502 | payment_initialization_failed | Provider API call failed |

**Invariants:**
- Same order is reused; no duplicate order created.
- Order items are not duplicated.
- Product stock is not altered.
- Amount is derived from the existing Order.total.
- Previously pending payment is cancelled.

---

## POST /api/payments/webhook/paystack/

Receive Paystack webhook. **No auth required** (Paystack calls this).

**Auth:** None (HMAC-SHA512 webhook signature verified)

**Headers:**
- `X-Paystack-Signature`: HMAC-SHA512 signature of raw body

**Request:** Raw JSON body from Paystack.

**Success (200):**
```json
{
    "status": "successful",
    "payment_reference": "PAY-NUV-XXXX-YY",
    "order_number": "NUV-XXXX-YY"
}
```

**Idempotent responses:**
```json
{"status": "already_successful", "payment_reference": "...", "order_number": "..."}
{"status": "already_terminal", "payment_status": "cancelled", "payment_reference": "..."}
{"status": "ignored", "event": "charge.failed"}
```

**Errors:**
| Status | Condition |
|--------|-----------|
| 400 | Invalid signature, invalid JSON, unknown reference |

**Idempotency guarantees:**
- Duplicate webhook for same reference → `already_successful` (no stock change, no order change).
- Concurrent webhooks → `select_for_update()` + `transaction.atomic()` ensures exactly-once processing.
- No duplicate payment records, no duplicate stock restoration, no duplicate notifications.

---

## Payment Lifecycle

```
PENDING ──→ PROCESSING ──→ SUCCESSFUL
   │              │
   │              ├──→ FAILED
   │              │
   │              └──→ CANCELLED
   │
   ├──→ FAILED
   │
   └──→ CANCELLED
```

**Terminal states:** `successful`, `failed`, `cancelled`

**Order state on payment success:**
- `Order.is_paid = True`
- `Order.status = "confirmed"`

**Order state on payment expiry/cancellation:**
- `Order.status = "cancelled"`
- Stock is restored exactly once.

---

## Expiration Behavior

- Managed by `python manage.py expire_pending_payments`.
- Finds orders that are unpaid, pending, with payments older than `PAYMENT_TIMEOUT_MINUTES` (default 30).
- Before cancelling, verifies with provider to handle webhook/expiration race.
- If provider confirms success → order confirmed (not cancelled).
- Stock restoration is atomic and idempotent (state transition serves as guard).
- Running the command multiple times is safe (no double stock restoration).

---

## Late Payment Reconciliation

If a payment genuinely succeeds after the order has been cancelled:
- The webhook/verification marks the payment as successful.
- The order remains cancelled (not resurrected).
- Manual reconciliation is required for refunds.
- This is a known limitation documented for future refund processing.

---

## Ownership Rules

- All authenticated payment endpoints derive user from `request.user`.
- Client cannot supply user identifiers.
- Payment reference is auto-generated (not user-controllable).
- Non-owner receives HTTP 404 on all payment/order endpoints.
- Webhook endpoint is public (Paystack calls it), signature-verified.

---

## Error Codes Reference

| Code | HTTP | Description |
|------|------|-------------|
| order_not_found | 404 | Order doesn't exist or not owned by user |
| order_already_paid | 400 | Order has been paid |
| order_cancelled | 400 | Order has been cancelled |
| payment_initialization_failed | 502 | Provider API call failed |
| payment_not_found | 404 | Payment reference not found or not owned |
