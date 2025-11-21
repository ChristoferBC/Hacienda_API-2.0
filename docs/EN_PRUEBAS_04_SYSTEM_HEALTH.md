# TESTS FOR ENGLISH ENDPOINTS - Document 4: System & Health (English)

## Overview
Tests for system-level endpoints and headers from the perspective of English clients. Endpoints include `/health`, `/info`, `/api/facturas/status` (or `/info` general), and `/api/version`. Responses contain mode and may include language metadata.

---

## 1. GET /health
- `GET /health` returns 200 OK and `{ status: "OK", timestamp: "..." }`.
- Validate response time < 100ms in SIMULATED mode.

---

## 2. GET /info
- From an English client, `/info` should convey `mode`, `features.bilingual: true`, and `endpoints` including `englishInvoices` group.
- In REAL mode, `haciendaConnection` must be present with `status: CONNECTED`.

---

## 3. Headers
- All responses include `X-API-Version`, `X-System-Mode` and `X-Node-Env`.
- Security headers by Helmet must be present: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`.

---

## 4. /api/facturas/status (system invoicing status)
- Verify fields `invoicing.totalEmitted`, `invoicing.totalSent`, `adapter.mode` and `adapter.initialized`.
- Validate `adapter.mode` can be SIMULATED when certificates missing even if NODE_ENV=production unless keys are configured.

---

## 5. GET /api/version
- Returns `version`, `apiVersion`, `buildNumber`, `nodeVersion`, and `environment`.
- Validate version format semver.

---

## 6. Monitoring scripts (English)
- Provide PowerShell or Bash health-check script examples for English operations.

---

## Summary - Document 4
- System endpoints return information usable by English clients and by monitoring systems
- Tests include headers, modes, and performance thresholds
