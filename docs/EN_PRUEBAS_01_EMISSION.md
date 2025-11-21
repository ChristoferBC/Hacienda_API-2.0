# TESTS FOR ENGLISH ENDPOINTS - Document 1: Emission (English)

## Overview
This document contains test cases for issuing invoices through the English endpoints (`/api/english-invoices/emit`). It mirrors the Spanish emission tests but uses the English schema and fields.

---

## 1. POST /api/english-invoices/emit

### 1.1 Successful case - Basic invoice

Request:
```http
POST /api/english-invoices/emit
Content-Type: application/json

{
  "issuer": {
    "name": "My Company Ltd.",
    "identification": "3101234567",
    "identificationType": "02",
    "email": "billing@mycompany.com",
    "phone": "2222-1111",
    "province": "01",
    "canton": "01",
    "district": "01"
  },
  "receiver": {
    "name": "Client Corp.",
    "identification": "123456789",
    "identificationType": "01",
    "email": "client@example.com"
  },
  "lineItems": [
    {
      "lineNumber": 1,
      "quantity": 1.0,
      "unit": "UNI",
      "description": "Consulting services",
      "unitPrice": 1500.00,
      "lineAmount": 1500.00,
      "taxes": [ { "code": "01", "rate": 13.00, "amount": 195.00 } ]
    }
  ],
  "summary": {
    "totalSales": 1500.00,
    "totalDiscounts": 0.00,
    "netTotal": 1500.00,
    "totalTax": 195.00,
    "totalAmount": 1695.00,
    "currency": "CRC"
  },
  "saleCondition": "Cash",
  "paymentMethods": ["01"]
}
```

Expected response (201 Created):
```json
{
  "success": true,
  "consecutive": "00100010010000000003",
  "key": "50602272020110310000100010010000000003",
  "status": "EMISSION_SUCCESS",
  "mode": "SIMULATED",
  "timestamp": "2025-11-21T10:32:00.000Z",
  "files": { "json": "./invoices/FACTURA_00100010010000000003_20251121-103200.json", "xml": null },
  "metadata": { "language": "english" }
}
```

Validations:
- HTTP 201
- `success: true`
- `consecutive` is a 20-digit string
- `key` in Hacienda format
- JSON file saved in invoices dir

---

### 1.2 Successful case - Invoice with discounts

(Example payload with `discountAmount` fields in line items and expected totals; ensure calculations correct and metadata saved.)

---

### 1.3 Failure case - Missing issuer

Request missing `issuer` should return 400 with detailed error about missing issuer fields.

Expected response (400 Bad Request):
```json
{ "success": false, "error": "Invalid invoice data", "details": [{ "field": "issuer", "message": "Issuer is required" }] }
```

---

### 1.4 Failure case - Invalid identification

Provide `identification` with fewer than 9 digits. Expect 400 and message about identification length.

---

### 1.5 Failure case - Invalid currency

If `summary.currency` contains unsupported ISO code, expect 400 and message about allowed currencies (e.g. CRC, USD).

---

### 1.6 Comparison test - Same data ES vs EN

Issue logically equivalent invoice using Spanish endpoint and English endpoint; after conversion both should produce same `key` and consistent `consecutive` series behavior.

---

## Summary - Document 1
- Focused on `/api/english-invoices/emit`
- Covers happy paths, calculations, and invalid payloads
- Ready to convert to Postman or automated Supertest scenarios

Next: Validation & Send tests for English endpoints.
