# TESTS FOR ENGLISH ENDPOINTS - Document 3: Query & Listing (English)

## Overview
Tests for listing and retrieving English invoices using `/api/english-invoices` and `/api/english-invoices/:consecutive`.

---

## 1. GET /api/english-invoices

### 1.1 List all (no filters)

Request: `GET /api/english-invoices`

Expected (200 OK): JSON with `invoices` array, `total`, `pagination` fields. English keys: `consecutive`, `key`, `issuer`, `receiver`, `status`, `amount`, `currency`, `savedAt`, `sentAt`.

---

### 1.2 Filter by status

`GET /api/english-invoices?status=pending` should only return invoices with `status: "PENDING"`.

---

### 1.3 Pagination

`GET /api/english-invoices?limit=2&offset=0` returns first 2 items and `pagination.nextOffset`.

---

### 1.4 Include full content

`GET /api/english-invoices?includeContent=true` returns `invoice.content` with `lineItems`, `summary`, etc.

---

## 2. GET /api/english-invoices/:consecutive

### 2.1 Retrieve full invoice

`GET /api/english-invoices/00100010010000000003` returns the invoice in English structure including `metadata` and `files`.

### 2.2 Retrieve summary only

`GET /api/english-invoices/00100010010000000003?includeContent=false` returns lighter payload with metadata and amount.

### 2.3 Not found

404 if consecutive does not exist.

---

## 3. Edge cases

- Invalid consecutive format → 400
- includeContent param invalid → 400

---

## Summary - Document 3
- Covers listing, filtering, pagination, and retrieval in English format
- Ready to be converted into automated Supertest suites or Postman collection
