# English Invoice API Documentation

## Overview

The English Invoice API provides international support for Costa Rica's electronic invoicing system. This API allows international clients to interact with the Hacienda (Tax Administration) system using English field names and documentation while maintaining full compatibility with the official ATV (Administración Tributaria Virtual) requirements.

## Features

- **Bilingual Support**: Full English interface with automatic Spanish conversion
- **Complete Validation**: Comprehensive validation of all invoice fields
- **ATV Integration**: Direct integration with Costa Rica's official tax system
- **Real-time Processing**: Immediate invoice processing and validation
- **Dual Mode Operation**: Support for both REAL and SIMULATED environments
- **Automatic Conversion**: Seamless conversion between English and Spanish formats

## Base URL

```
https://your-api-domain.com/api/en/invoices
```

## Authentication

Currently, the API operates without authentication. In production environments, implement appropriate security measures.

## Endpoints

### 1. Issue Invoice
**POST** `/api/en/invoices/issue`

Issues a new electronic invoice to the Costa Rica Tax Administration.

#### Request Body Example:
```json
{
  "documentType": "01",
  "currencyCode": "USD",
  "exchangeRate": 1.0,
  "issuer": {
    "name": "International Company LLC",
    "identification": "123456789",
    "identificationType": "02",
    "email": "billing@company.com",
    "phone": "+1-555-0123",
    "countryCode": "US",
    "province": "01",
    "canton": "01",
    "district": "01",
    "address": "123 Business St, Suite 100"
  },
  "receiver": {
    "name": "Costa Rica Client SA",
    "identification": "987654321",
    "identificationType": "01",
    "email": "client@crcompany.com",
    "phone": "+506-2222-3333"
  },
  "serviceDetail": [
    {
      "lineNumber": 1,
      "code": "SRV001",
      "description": "Professional Consulting Services",
      "quantity": 10,
      "unitOfMeasure": "Hrs",
      "unitPrice": 50.00,
      "totalAmount": 500.00,
      "discount": 0.00,
      "discountNature": "No discount applied",
      "subtotal": 500.00,
      "tax": {
        "code": "01",
        "rateCode": "08",
        "rate": 13.00,
        "amount": 65.00
      },
      "totalLineAmount": 565.00
    }
  ],
  "invoiceSummary": {
    "totalTaxableServices": 500.00,
    "totalExemptServices": 0.00,
    "totalTaxableGoods": 0.00,
    "totalExemptGoods": 0.00,
    "totalTaxable": 500.00,
    "totalExempt": 0.00,
    "totalSale": 500.00,
    "totalDiscounts": 0.00,
    "totalNetSale": 500.00,
    "totalTax": 65.00,
    "totalInvoice": 565.00
  },
  "saleCondition": "01",
  "creditTerm": "0",
  "observations": "Payment due within 30 days"
}
```

#### Response Example:
```json
{
  "success": true,
  "consecutive": "12345678901234567890",
  "key": "50612345678901234567890123456789012345678901",
  "status": "issued",
  "mode": "SIMULATED",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "files": {
    "json": "/invoices/json/12345678901234567890.json",
    "xml": "/invoices/xml/12345678901234567890.xml"
  },
  "metadata": {
    "language": "english",
    "originalRequest": "english",
    "processedAs": "spanish_compatible"
  }
}
```

### 2. Validate Invoice
**POST** `/api/en/invoices/validate`

Validates an invoice either by key/consecutive or by payload structure.

#### Option 1 - Validate by Key/Consecutive:
```json
{
  "key": "50612345678901234567890123456789012345678901",
  "consecutive": "12345678901234567890"
}
```

#### Option 2 - Validate by Payload:
```json
{
  "payload": {
    "documentType": "01",
    "issuer": {
      "name": "Company Name",
      "identification": "123456789"
    },
    "receiver": {
      "name": "Client Name",
      "identification": "987654321"
    }
  }
}
```

#### Response Example:
```json
{
  "success": true,
  "method": "key_consecutive",
  "valid": true,
  "mode": "SIMULATED",
  "timestamp": "2024-01-15T10:35:00.000Z",
  "validation": {
    "key": "50612345678901234567890123456789012345678901",
    "consecutive": "12345678901234567890",
    "hash": "abc123def456",
    "messages": [],
    "status": "validated"
  },
  "metadata": {
    "language": "english",
    "validationMethod": "key_consecutive"
  }
}
```

### 3. Send Invoice
**POST** `/api/en/invoices/send`

Sends an invoice to the Tax Administration system.

#### Request Body:
```json
{
  "key": "50612345678901234567890123456789012345678901",
  "consecutive": "12345678901234567890"
}
```

#### Response Example:
```json
{
  "success": true,
  "key": "50612345678901234567890123456789012345678901",
  "consecutive": "12345678901234567890",
  "status": "sent",
  "mode": "SIMULATED",
  "timestamp": "2024-01-15T10:40:00.000Z",
  "receiptNumber": "RECEIPT_1705315200000",
  "taxAdministrationResponse": {
    "code": "200",
    "message": "Successfully processed",
    "timestamp": "2024-01-15T10:40:00.000Z"
  },
  "markedFiles": 1,
  "metadata": {
    "language": "english"
  }
}
```

### 4. Query Invoice
**GET** `/api/en/invoices/:consecutive?includeContent=true`

Retrieves a specific invoice by consecutive number.

#### Response Example:
```json
{
  "success": true,
  "consecutive": "12345678901234567890",
  "found": true,
  "metadata": {
    "createdAt": "2024-01-15T10:30:00.000Z",
    "status": "sent",
    "fileSize": 2048
  },
  "atvStatus": {
    "valid": true,
    "status": "processed"
  },
  "content": {
    "json": {
      "english": {
        "documentType": "01",
        "issuer": {
          "name": "International Company LLC"
        }
      },
      "spanish": {
        "tipoDocumento": "01",
        "emisor": {
          "nombre": "International Company LLC"
        }
      }
    },
    "xml": "<FacturaElectronica>...</FacturaElectronica>"
  },
  "files": {
    "json": "/invoices/json/12345678901234567890.json",
    "xml": "/invoices/xml/12345678901234567890.xml"
  },
  "language": "english"
}
```

### 5. List Invoices
**GET** `/api/en/invoices?status=all&limit=50&offset=0&includeContent=false`

Lists invoices with filtering and pagination.

#### Query Parameters:
- `status`: Filter by status (all, sent, pending, error)
- `includeContent`: Whether to include invoice content (true/false)
- `limit`: Maximum number of results (default: 50)
- `offset`: Pagination offset (default: 0)

#### Response Example:
```json
{
  "success": true,
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  },
  "filters": {
    "status": "all",
    "language": "english_support"
  },
  "statistics": {
    "total": 150,
    "sent": 120,
    "pending": 25,
    "error": 5
  },
  "invoices": [
    {
      "consecutive": "12345678901234567890",
      "status": "sent",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "englishData": {
        "documentType": "01",
        "totalInvoice": 565.00
      },
      "language": "mixed"
    }
  ],
  "metadata": {
    "language": "english",
    "conversionSupport": true
  }
}
```

### 6. Health Check
**GET** `/api/en/invoices/health/check`

Checks the health and capabilities of the English Invoice API.

#### Response Example:
```json
{
  "success": true,
  "service": "Hacienda API - English Invoice Service",
  "status": "healthy",
  "language": "english",
  "timestamp": "2024-01-15T10:45:00.000Z",
  "capabilities": [
    "invoice_issuance",
    "invoice_validation",
    "invoice_sending",
    "invoice_querying",
    "invoice_listing",
    "english_spanish_conversion",
    "bilingual_support"
  ],
  "endpoints": [
    "POST /api/en/invoices/issue",
    "POST /api/en/invoices/validate",
    "POST /api/en/invoices/send",
    "GET /api/en/invoices/:consecutive",
    "GET /api/en/invoices",
    "GET /api/en/invoices/health/check"
  ],
  "version": "1.0.0",
  "mode": "SIMULATED",
  "environment": "development"
}
```

## Field Mappings

The API automatically converts between English and Spanish field names:

| English Field | Spanish Field | Description |
|---------------|---------------|-------------|
| `documentType` | `tipoDocumento` | Document type code |
| `currencyCode` | `codigoMoneda` | Currency code (USD, CRC, etc.) |
| `exchangeRate` | `tipoCambio` | Exchange rate |
| `issuer` | `emisor` | Invoice issuer information |
| `receiver` | `receptor` | Invoice receiver information |
| `serviceDetail` | `detalleServicio` | Line items/services |
| `invoiceSummary` | `resumenFactura` | Invoice totals and summary |
| `saleCondition` | `condicionVenta` | Sale condition (cash, credit) |
| `creditTerm` | `plazoCredito` | Credit term in days |
| `observations` | `observaciones` | Additional notes |
| `issuanceDate` | `fechaEmision` | Invoice issuance date |
| `consecutiveNumber` | `numeroConsecutivo` | Sequential invoice number |

## Document Types

| Code | Description |
|------|-------------|
| `01` | Electronic Invoice |
| `02` | Debit Note |
| `03` | Credit Note |
| `04` | Purchase Invoice |

## Currency Codes

| Code | Currency |
|------|----------|
| `CRC` | Costa Rican Colón |
| `USD` | US Dollar |
| `EUR` | Euro |

## Identification Types

| Code | Description |
|------|-------------|
| `01` | Physical Person (Cédula Física) |
| `02` | Legal Entity (Cédula Jurídica) |
| `03` | DIMEX |
| `04` | NITE |

## Sale Conditions

| Code | Description |
|------|-------------|
| `01` | Cash |
| `02` | Credit |
| `03` | Consignment |
| `04` | Apartado |
| `05` | Lease |
| `99` | Other |

## Tax Codes

| Code | Description | Common Rates |
|------|-------------|--------------|
| `01` | General Sales Tax (IVA) | 13% |
| `02` | Selective Consumption Tax | Varies |
| `03` | Unique Social Tax | 5.25% |
| `99` | Other | Varies |

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Validation error",
  "message": "The invoice data provided does not meet the required format",
  "details": [
    {
      "field": "issuer.name",
      "message": "Name is required",
      "code": "REQUIRED_FIELD"
    }
  ],
  "timestamp": "2024-01-15T10:50:00.000Z",
  "requestId": "REQ_1705315800000"
}
```

## Common HTTP Status Codes

- `200`: Success
- `201`: Created (for new invoices)
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limits

Currently, no rate limits are implemented. Consider implementing appropriate rate limiting for production use.

## Support and Integration

For technical support or integration assistance, please contact the development team or refer to the main API documentation at `/info`.

## Testing

Use the health check endpoint to verify API availability:

```bash
curl -X GET "https://your-api-domain.com/api/en/invoices/health/check"
```

## Examples and SDKs

Complete examples and SDK implementations will be provided in the project repository under the `examples/` directory.

---

*This documentation is for the English Invoice API v1.0.0*