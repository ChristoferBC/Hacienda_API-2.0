# TESTS FOR ENGLISH ENDPOINTS - Document 5: Errors, Edge Cases & Security (English)

## Overview
Security and edge-case tests tailored to English endpoints and English payload fields. These tests mirror the Spanish security tests but reference English field names.

---

## 1. Input validation and injection

### 1.1 SQL Injection attempt in consecutive
- `GET /api/english-invoices/00100010010000000001; DROP TABLE invoices;--` → 400 Bad Request with invalid format message.

### 1.2 XSS payload in `issuer.name` or `lineItems[].description`
- Provide `<script>` or `onerror` attributes → 400 with sanitized/blocked message.

---

## 2. Malformed JSON
- Malformed JSON body for `/api/english-invoices/emit` → 400 JSON invalid message.

---

## 3. Numeric extremes and negative values
- Negative `unitPrice` or enormous `quantity` → 400 with numeric validation messages.

---

## 4. Rate limiting and DoS protection
- Rapidly POST 100 requests to `/api/english-invoices/emit` → after threshold (e.g., 50/min) expect 429 Too Many Requests and `Retry-After` header.

---

## 5. Concurrency
- Simultaneous emissions produce unique `consecutive` values without collision.
- Retrieve (`GET /api/english-invoices`) while writes happen → no partial corrupt data returned.

---

## 6. Edge business logic
- Discounts greater than line item total → 400
- Inconsistent summary totals → 400
- Multiple taxes per line → accepted and properly summed

---

## 7. File size limits and payloads
- Large payload > `MAX_FILE_SIZE` (10MB) → 413 Payload Too Large

---

## 8. Authentication/authorization (if added later)
- Placeholder tests for future auth: 401 when token missing, 403 when insufficient scope.

---

## Summary - Document 5
- Security, robustness, and edge-case coverage for English endpoints
- Ready to convert into automated tests or Postman checks
