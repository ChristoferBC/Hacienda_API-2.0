# TESTS FOR ENGLISH ENDPOINTS - Document 2: Validation & Send (English)

## Overview
Tests for invoice validation and sending using the English endpoints `/api/english-invoices/validate` and, if mapping exists, the `/api/facturas/enviar` flow for sending (English controller converts and uses same send logic).

---

## 1. POST /api/english-invoices/validate

### 1.1 Validate by key + consecutive

Request:
```http
POST /api/english-invoices/validate
Content-Type: application/json

{ "key": "50602272020110310000100010010000000003", "consecutive": "00100010010000000003" }
```

Expected (200 OK):
```json
{ "success": true, "method": "key_consecutive", "valid": true, "mode": "SIMULATED", "validation": { "key": "...", "consecutive": "...", "hash": "...", "messages": [], "status": "VALIDATED" } }
```

---

### 1.2 Validate by payload

Send a full English payload in `payload` field. Expect structural validation result and ATV simulated validation where applicable.

---

### 1.3 Failure - Missing parameters

If neither `key+consecutive` nor `payload` provided return 400 with instructions.

---

## 2. Sending flow (English requests mapped to send action)

Note: There is no separate English `send` endpoint; the English controller issues and can reuse the Spanish `enviar` logic. Tests below assume using Spanish send endpoint after issuing via EN endpoint or using translated body.

### 2.1 Send by key (happy path)

Request:
```http
POST /api/facturas/enviar
Content-Type: application/json

{ "clave": "50602272020110310000100010010000000003", "pin": "1234" }
```

Expected (200 OK):
```json
{ "success": true, "clave": "...", "consecutive": "...", "status": "SENT", "estado": "ACCEPTED", "mode": "SIMULATED", "haciendaResponse": { "code": "200", "message": "..." } }
```

---

### 2.2 Failure - Missing PIN

If `pin` is not provided, expect 400 and message stating missing parameter.

---

### 2.3 Reattempt on failure

Simulate first send failing due to invalid PIN, second attempt with correct PIN should succeed. Verify storage metadata updated to SENT and `sentAt` present.

---

## Summary - Document 2
- Focused on `/api/english-invoices/validate` and send flow interoperability
- Includes success, parameter missing, and retry scenarios
- Ready to implement as automated tests or Postman requests
