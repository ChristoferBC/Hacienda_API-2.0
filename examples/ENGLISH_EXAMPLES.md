# English Invoice API - Practical Examples

This document provides practical examples for using the English Invoice API with Costa Rica's electronic invoicing system.

## Table of Contents
- [Basic Invoice Example](#basic-invoice-example)
- [Service Invoice Example](#service-invoice-example)
- [Multi-Line Invoice Example](#multi-line-invoice-example)
- [International Invoice Example](#international-invoice-example)
- [Credit Note Example](#credit-note-example)
- [Testing Scenarios](#testing-scenarios)

## Basic Invoice Example

### Simple Product Sale

```bash
# Issue a basic product invoice
curl -X POST "http://localhost:3000/api/en/invoices/issue" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "01",
    "currencyCode": "USD",
    "exchangeRate": 1.0,
    "issuer": {
      "name": "Tech Solutions Inc",
      "identification": "123456789",
      "identificationType": "02",
      "email": "billing@techsolutions.com",
      "phone": "+1-555-0100",
      "countryCode": "US",
      "province": "01",
      "canton": "01",
      "district": "01",
      "address": "456 Tech Park Drive"
    },
    "receiver": {
      "name": "Empresa Costarricense SA",
      "identification": "310123456789",
      "identificationType": "02",
      "email": "compras@empresa.cr",
      "phone": "+506-2100-5000"
    },
    "serviceDetail": [
      {
        "lineNumber": 1,
        "code": "LAPTOP001",
        "description": "Business Laptop Computer",
        "quantity": 2,
        "unitOfMeasure": "Unit",
        "unitPrice": 800.00,
        "totalAmount": 1600.00,
        "discount": 100.00,
        "discountNature": "Bulk purchase discount",
        "subtotal": 1500.00,
        "tax": {
          "code": "01",
          "rateCode": "08",
          "rate": 13.00,
          "amount": 195.00
        },
        "totalLineAmount": 1695.00
      }
    ],
    "invoiceSummary": {
      "totalTaxableServices": 0.00,
      "totalExemptServices": 0.00,
      "totalTaxableGoods": 1500.00,
      "totalExemptGoods": 0.00,
      "totalTaxable": 1500.00,
      "totalExempt": 0.00,
      "totalSale": 1600.00,
      "totalDiscounts": 100.00,
      "totalNetSale": 1500.00,
      "totalTax": 195.00,
      "totalInvoice": 1695.00
    },
    "saleCondition": "01",
    "creditTerm": "0",
    "observations": "Payment by wire transfer"
  }'
```

## Service Invoice Example

### Professional Consulting Services

```bash
curl -X POST "http://localhost:3000/api/en/invoices/issue" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "01",
    "currencyCode": "USD",
    "exchangeRate": 650.00,
    "issuer": {
      "name": "Global Consulting Partners LLC",
      "identification": "987654321",
      "identificationType": "02",
      "email": "invoices@globalcp.com",
      "phone": "+1-555-0200",
      "countryCode": "US",
      "province": "01",
      "canton": "01",
      "district": "01",
      "address": "789 Business Center, Floor 15"
    },
    "receiver": {
      "name": "Ministerio de Hacienda",
      "identification": "400000000000",
      "identificationType": "02",
      "email": "sistemas@hacienda.go.cr",
      "phone": "+506-2523-3000"
    },
    "serviceDetail": [
      {
        "lineNumber": 1,
        "code": "CONS-IT-001",
        "description": "IT Systems Analysis and Design",
        "quantity": 40,
        "unitOfMeasure": "Hrs",
        "unitPrice": 75.00,
        "totalAmount": 3000.00,
        "discount": 0.00,
        "discountNature": "No discount applied",
        "subtotal": 3000.00,
        "tax": {
          "code": "01",
          "rateCode": "08",
          "rate": 13.00,
          "amount": 390.00
        },
        "totalLineAmount": 3390.00
      },
      {
        "lineNumber": 2,
        "code": "CONS-PM-001",
        "description": "Project Management Services",
        "quantity": 20,
        "unitOfMeasure": "Hrs",
        "unitPrice": 85.00,
        "totalAmount": 1700.00,
        "discount": 0.00,
        "discountNature": "No discount applied",
        "subtotal": 1700.00,
        "tax": {
          "code": "01",
          "rateCode": "08",
          "rate": 13.00,
          "amount": 221.00
        },
        "totalLineAmount": 1921.00
      }
    ],
    "invoiceSummary": {
      "totalTaxableServices": 4700.00,
      "totalExemptServices": 0.00,
      "totalTaxableGoods": 0.00,
      "totalExemptGoods": 0.00,
      "totalTaxable": 4700.00,
      "totalExempt": 0.00,
      "totalSale": 4700.00,
      "totalDiscounts": 0.00,
      "totalNetSale": 4700.00,
      "totalTax": 611.00,
      "totalInvoice": 5311.00
    },
    "saleCondition": "02",
    "creditTerm": "30",
    "observations": "Net 30 days. Services performed in Q1 2024."
  }'
```

## Multi-Line Invoice Example

### Mixed Products and Services

```bash
curl -X POST "http://localhost:3000/api/en/invoices/issue" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "01",
    "currencyCode": "USD",
    "exchangeRate": 650.00,
    "issuer": {
      "name": "Complete Business Solutions Corp",
      "identification": "555666777",
      "identificationType": "02",
      "email": "sales@cbsolutions.com",
      "phone": "+1-555-0300",
      "countryCode": "US",
      "province": "01",
      "canton": "01",
      "district": "01",
      "address": "321 Innovation Boulevard"
    },
    "receiver": {
      "name": "Banco Nacional de Costa Rica",
      "identification": "400000000001",
      "identificationType": "02",
      "email": "compras@bncr.fi.cr",
      "phone": "+506-2212-2000"
    },
    "serviceDetail": [
      {
        "lineNumber": 1,
        "code": "SW-LIC-001",
        "description": "Software License - Enterprise Edition",
        "quantity": 1,
        "unitOfMeasure": "Unit",
        "unitPrice": 5000.00,
        "totalAmount": 5000.00,
        "discount": 500.00,
        "discountNature": "New customer discount",
        "subtotal": 4500.00,
        "tax": {
          "code": "01",
          "rateCode": "08",
          "rate": 13.00,
          "amount": 585.00
        },
        "totalLineAmount": 5085.00
      },
      {
        "lineNumber": 2,
        "code": "TRAIN-001",
        "description": "Staff Training - 3-day workshop",
        "quantity": 24,
        "unitOfMeasure": "Hrs",
        "unitPrice": 125.00,
        "totalAmount": 3000.00,
        "discount": 0.00,
        "discountNature": "No discount applied",
        "subtotal": 3000.00,
        "tax": {
          "code": "01",
          "rateCode": "08",
          "rate": 13.00,
          "amount": 390.00
        },
        "totalLineAmount": 3390.00
      },
      {
        "lineNumber": 3,
        "code": "SUPPORT-001",
        "description": "Technical Support - Annual Contract",
        "quantity": 12,
        "unitOfMeasure": "Mt",
        "unitPrice": 200.00,
        "totalAmount": 2400.00,
        "discount": 240.00,
        "discountNature": "Annual payment discount",
        "subtotal": 2160.00,
        "tax": {
          "code": "01",
          "rateCode": "08",
          "rate": 13.00,
          "amount": 280.80
        },
        "totalLineAmount": 2440.80
      }
    ],
    "invoiceSummary": {
      "totalTaxableServices": 5160.00,
      "totalExemptServices": 0.00,
      "totalTaxableGoods": 4500.00,
      "totalExemptGoods": 0.00,
      "totalTaxable": 9660.00,
      "totalExempt": 0.00,
      "totalSale": 10400.00,
      "totalDiscounts": 740.00,
      "totalNetSale": 9660.00,
      "totalTax": 1255.80,
      "totalInvoice": 10915.80
    },
    "saleCondition": "02",
    "creditTerm": "45",
    "observations": "Invoice includes software license, training, and support services. Payment terms: Net 45 days."
  }'
```

## International Invoice Example

### Cross-Border Transaction

```bash
curl -X POST "http://localhost:3000/api/en/invoices/issue" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "01",
    "currencyCode": "EUR",
    "exchangeRate": 720.00,
    "issuer": {
      "name": "European Tech Innovations GmbH",
      "identification": "DE123456789",
      "identificationType": "04",
      "email": "export@eurotech.de",
      "phone": "+49-30-12345678",
      "countryCode": "DE",
      "province": "01",
      "canton": "01",
      "district": "01",
      "address": "Alexanderplatz 15, 10178 Berlin, Germany"
    },
    "receiver": {
      "name": "Instituto Costarricense de Electricidad",
      "identification": "400000000002",
      "identificationType": "02",
      "email": "compras@ice.go.cr",
      "phone": "+506-2000-7000"
    },
    "serviceDetail": [
      {
        "lineNumber": 1,
        "code": "SOLAR-PANEL-300W",
        "description": "High-Efficiency Solar Panel 300W",
        "quantity": 100,
        "unitOfMeasure": "Unit",
        "unitPrice": 180.00,
        "totalAmount": 18000.00,
        "discount": 900.00,
        "discountNature": "Volume discount - 100+ units",
        "subtotal": 17100.00,
        "tax": {
          "code": "01",
          "rateCode": "08",
          "rate": 13.00,
          "amount": 2223.00
        },
        "totalLineAmount": 19323.00
      },
      {
        "lineNumber": 2,
        "code": "INVERTER-5KW",
        "description": "Grid-Tie Inverter 5KW",
        "quantity": 20,
        "unitOfMeasure": "Unit",
        "unitPrice": 450.00,
        "totalAmount": 9000.00,
        "discount": 0.00,
        "discountNature": "No discount applied",
        "subtotal": 9000.00,
        "tax": {
          "code": "01",
          "rateCode": "08",
          "rate": 13.00,
          "amount": 1170.00
        },
        "totalLineAmount": 10170.00
      }
    ],
    "invoiceSummary": {
      "totalTaxableServices": 0.00,
      "totalExemptServices": 0.00,
      "totalTaxableGoods": 26100.00,
      "totalExemptGoods": 0.00,
      "totalTaxable": 26100.00,
      "totalExempt": 0.00,
      "totalSale": 27000.00,
      "totalDiscounts": 900.00,
      "totalNetSale": 26100.00,
      "totalTax": 3393.00,
      "totalInvoice": 29493.00
    },
    "saleCondition": "02",
    "creditTerm": "60",
    "observations": "International shipment. Solar energy equipment for renewable energy project. FOB Hamburg. Net 60 days."
  }'
```

## Credit Note Example

### Service Correction

```bash
curl -X POST "http://localhost:3000/api/en/invoices/issue" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "03",
    "currencyCode": "USD",
    "exchangeRate": 650.00,
    "issuer": {
      "name": "Digital Marketing Agency LLC",
      "identification": "888999000",
      "identificationType": "02",
      "email": "billing@digitalma.com",
      "phone": "+1-555-0400",
      "countryCode": "US",
      "province": "01",
      "canton": "01",
      "district": "01",
      "address": "654 Marketing Plaza"
    },
    "receiver": {
      "name": "Corporación de Desarrollo Empresarial",
      "identification": "310987654321",
      "identificationType": "02",
      "email": "finanzas@cde.cr",
      "phone": "+506-2233-4455"
    },
    "serviceDetail": [
      {
        "lineNumber": 1,
        "code": "CREDIT-ADJ-001",
        "description": "Credit adjustment - Overcharged marketing services",
        "quantity": 1,
        "unitOfMeasure": "Unit",
        "unitPrice": -500.00,
        "totalAmount": -500.00,
        "discount": 0.00,
        "discountNature": "No discount applied",
        "subtotal": -500.00,
        "tax": {
          "code": "01",
          "rateCode": "08",
          "rate": 13.00,
          "amount": -65.00
        },
        "totalLineAmount": -565.00
      }
    ],
    "invoiceSummary": {
      "totalTaxableServices": -500.00,
      "totalExemptServices": 0.00,
      "totalTaxableGoods": 0.00,
      "totalExemptGoods": 0.00,
      "totalTaxable": -500.00,
      "totalExempt": 0.00,
      "totalSale": -500.00,
      "totalDiscounts": 0.00,
      "totalNetSale": -500.00,
      "totalTax": -65.00,
      "totalInvoice": -565.00
    },
    "saleCondition": "01",
    "creditTerm": "0",
    "observations": "Credit note for invoice #INV-2024-001234. Billing adjustment approved by management."
  }'
```

## Testing Scenarios

### 1. Validation Test

```bash
# Test invoice validation with payload
curl -X POST "http://localhost:3000/api/en/invoices/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {
      "documentType": "01",
      "currencyCode": "USD",
      "issuer": {
        "name": "Test Company",
        "identification": "123456789",
        "identificationType": "02"
      },
      "receiver": {
        "name": "Test Client",
        "identification": "987654321",
        "identificationType": "01"
      },
      "serviceDetail": [
        {
          "lineNumber": 1,
          "description": "Test Service",
          "quantity": 1,
          "unitPrice": 100.00
        }
      ]
    }
  }'
```

### 2. Query Test

```bash
# Query a specific invoice
curl -X GET "http://localhost:3000/api/en/invoices/12345678901234567890?includeContent=true"
```

### 3. List Invoices Test

```bash
# List recent invoices
curl -X GET "http://localhost:3000/api/en/invoices?limit=10&offset=0&status=all"
```

### 4. Health Check Test

```bash
# Check API health
curl -X GET "http://localhost:3000/api/en/invoices/health/check"
```

### 5. Send Invoice Test

```bash
# Send an invoice to tax administration
curl -X POST "http://localhost:3000/api/en/invoices/send" \
  -H "Content-Type: application/json" \
  -d '{
    "consecutive": "12345678901234567890"
  }'
```

## Error Handling Examples

### Invalid Data Example

```bash
# This will return a validation error
curl -X POST "http://localhost:3000/api/en/invoices/issue" \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "01",
    "issuer": {
      "name": ""
    },
    "receiver": {
      "identification": "invalid"
    }
  }'
```

Expected error response:
```json
{
  "success": false,
  "error": "Invalid invoice data",
  "message": "The invoice data provided does not meet the required format",
  "details": [
    {
      "field": "issuer.name",
      "message": "Name cannot be empty",
      "code": "EMPTY_FIELD"
    },
    {
      "field": "receiver.identification",
      "message": "Invalid identification format",
      "code": "INVALID_FORMAT"
    }
  ]
}
```

## Integration Tips

1. **Always validate first**: Use the validation endpoint before issuing invoices
2. **Handle errors gracefully**: Check the `success` field in responses
3. **Store consecutive numbers**: Keep track of consecutive numbers for future queries
4. **Use appropriate currencies**: Make sure exchange rates are current
5. **Test in SIMULATED mode**: Use the simulated environment for testing

## Environment Variables

Set these environment variables for proper operation:

```bash
export NODE_ENV=development
export ATV_MODE=SIMULATED
export PORT=3000
export LOG_LEVEL=info
```

For production:

```bash
export NODE_ENV=production
export ATV_MODE=REAL
export PORT=3000
export LOG_LEVEL=warn
```

---

*These examples are for demonstration purposes. Adjust values according to your specific requirements.*