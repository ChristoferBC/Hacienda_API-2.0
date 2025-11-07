# Postman Testing Guide - English Invoice API

## 📋 Overview

This guide explains how to use the Postman collections to test the English Invoice API for Costa Rica's electronic invoicing system.

## 📁 Files Included

1. **`English_Invoice_API.postman_collection.json`** - Complete test collection
2. **`English_Invoice_API.postman_environment.json`** - Development environment variables
3. **`English_Invoice_API_Production.postman_environment.json`** - Production environment variables

## 🚀 Quick Start

### Step 1: Import into Postman

1. Open Postman
2. Click **Import** button
3. Select **File** tab
4. Import all three files:
   - `English_Invoice_API.postman_collection.json`
   - `English_Invoice_API.postman_environment.json`
   - `English_Invoice_API_Production.postman_environment.json`

### Step 2: Select Environment

1. In Postman, select the environment dropdown (top right)
2. Choose **"English Invoice API - Development"** for local testing
3. Or choose **"English Invoice API - Production"** for production testing

### Step 3: Start Your API Server

Make sure your API is running:
```bash
cd c:\Users\Christofer Brenes\Documents\PRACTICA\Hacienda_API
npm start
```

### Step 4: Run Tests

Start with the **Health Check** request to verify the API is working.

## 📊 Test Collection Structure

### 1. **Health Check**
- **Purpose**: Verify API is running and healthy
- **Method**: GET
- **URL**: `/api/en/invoices/health/check`
- **Expected**: Status 200, service healthy

### 2. **Issue Basic Service Invoice**
- **Purpose**: Create a simple service invoice
- **Method**: POST
- **URL**: `/api/en/invoices/issue`
- **Auto-saves**: `consecutive` and `key` for later tests

### 3. **Issue Product Invoice with Discount**
- **Purpose**: Create a product invoice with discounts
- **Method**: POST
- **URL**: `/api/en/invoices/issue`
- **Features**: Multiple products, volume discounts

### 4. **Issue Mixed Invoice (Products + Services)**
- **Purpose**: Complex invoice with both products and services
- **Method**: POST
- **URL**: `/api/en/invoices/issue`
- **Features**: Software licenses, training, support

### 5. **Validate Invoice by Key**
- **Purpose**: Validate an existing invoice using key/consecutive
- **Method**: POST
- **URL**: `/api/en/invoices/validate`
- **Uses**: Variables from previous invoice creation

### 6. **Validate Invoice by Payload**
- **Purpose**: Validate invoice structure without issuing
- **Method**: POST
- **URL**: `/api/en/invoices/validate`
- **Features**: Structural validation only

### 7. **Send Invoice to Tax Administration**
- **Purpose**: Submit invoice to Hacienda system
- **Method**: POST
- **URL**: `/api/en/invoices/send`
- **Uses**: Previously created invoice data

### 8. **Query Invoice by Consecutive**
- **Purpose**: Retrieve specific invoice details
- **Method**: GET
- **URL**: `/api/en/invoices/{consecutive}`
- **Features**: Full content retrieval

### 9. **Query Invoice without Content**
- **Purpose**: Get invoice metadata only
- **Method**: GET
- **URL**: `/api/en/invoices/{consecutive}`
- **Features**: Lightweight response

### 10. **List All Invoices**
- **Purpose**: Get paginated list of invoices
- **Method**: GET
- **URL**: `/api/en/invoices`
- **Features**: Filtering, pagination, metadata

### 11. **List Sent Invoices with Content**
- **Purpose**: Filter invoices by status
- **Method**: GET
- **URL**: `/api/en/invoices`
- **Features**: Status filtering, content inclusion

### 12. **Issue Credit Note**
- **Purpose**: Create a credit note for corrections
- **Method**: POST
- **URL**: `/api/en/invoices/issue`
- **Features**: Negative amounts, credit document type

### 13. **Error Testing**
- **Invalid Invoice**: Tests validation error handling
- **Invalid Validation Request**: Tests parameter validation
- **Invalid Consecutive Format**: Tests format validation

## 🔧 Environment Variables

### Development Environment

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `http://localhost:3000` |
| `atv_mode` | ATV operation mode | `SIMULATED` |
| `test_consecutive` | Auto-populated from tests | - |
| `test_key` | Auto-populated from tests | - |
| `default_currency` | Default currency | `USD` |
| `default_exchange_rate` | USD to CRC rate | `650.00` |

### Production Environment

Similar variables but configured for production use with `REAL` ATV mode.

## 🧪 Test Execution Strategies

### Strategy 1: Sequential Testing (Recommended)

Run tests in order to build up test data:

1. **Health Check** → Verify API is running
2. **Issue Basic Service Invoice** → Creates test data
3. **Validate Invoice by Key** → Uses created invoice
4. **Send Invoice** → Submits to tax system
5. **Query Invoice** → Retrieves submitted invoice
6. **List Invoices** → Confirms in list

### Strategy 2: Isolated Testing

Run individual tests independently using pre-configured data:

1. Set manual values in environment variables
2. Run specific tests without dependencies
3. Useful for debugging specific endpoints

### Strategy 3: Batch Testing

Use Postman Runner to execute entire collection:

1. Click **Runner** in Postman
2. Select the English Invoice API collection
3. Choose environment
4. Run all tests automatically

## 🔍 Test Verification

Each test includes automatic assertions:

- **Status Code Validation**: Checks for expected HTTP codes
- **Response Structure**: Verifies required fields are present
- **Data Integrity**: Confirms proper data types and formats
- **Business Logic**: Validates invoice calculations and rules

## 📊 Expected Results

### Successful Test Run Should Show:

- ✅ Health Check: Status 200, service healthy
- ✅ Invoice Issue: Status 201, consecutive and key returned
- ✅ Validation: Status 200, validation successful
- ✅ Send: Status 200, receipt number returned
- ✅ Query: Status 200, invoice found with content
- ✅ List: Status 200, paginated results returned

### Common Error Scenarios:

- ❌ Status 500: API server not running
- ❌ Status 400: Invalid request data
- ❌ Status 404: Invoice not found
- ❌ Connection Error: Wrong base_url or server down

## 🛠 Troubleshooting

### API Not Responding

1. Verify server is running: `npm start`
2. Check base_url in environment: `http://localhost:3000`
3. Confirm port 3000 is available

### Validation Errors

1. Check request body format in Postman
2. Verify all required fields are present
3. Review console logs in VS Code terminal

### Environment Issues

1. Ensure correct environment is selected
2. Check variable values in environment tab
3. Clear and reset auto-populated variables if needed

### ATV Integration Issues

1. Verify ATV_MODE environment variable
2. Check ATV service status in logs
3. Ensure proper configuration in config files

## 📈 Advanced Usage

### Custom Test Data

Modify request bodies to test specific scenarios:

1. **Different Currencies**: Change `currencyCode` and `exchangeRate`
2. **Various Document Types**: Use `01` (invoice), `03` (credit note)
3. **Complex Line Items**: Add multiple services/products
4. **Error Scenarios**: Intentionally invalid data

### Automated Testing

Set up automated runs using:

1. **Postman Monitors**: Schedule regular test runs
2. **Newman CLI**: Command-line test execution
3. **CI/CD Integration**: Include in deployment pipelines

### Performance Testing

Use Collection Runner for load testing:

1. Set iterations to desired number
2. Add delays between requests
3. Monitor response times and error rates

## 📝 Test Data Examples

### Minimal Valid Invoice
```json
{
  "documentType": "01",
  "currencyCode": "USD",
  "issuer": { /* minimal issuer data */ },
  "receiver": { /* minimal receiver data */ },
  "serviceDetail": [ /* one line item */ ],
  "invoiceSummary": { /* calculated totals */ }
}
```

### Complex Multi-Currency Invoice
```json
{
  "documentType": "01",
  "currencyCode": "EUR",
  "exchangeRate": 720.00,
  /* ... full invoice structure */
}
```

### Credit Note
```json
{
  "documentType": "03",
  "currencyCode": "USD",
  /* ... negative amounts for credit */
}
```

## 🔗 Integration with Development Workflow

1. **Before Code Changes**: Run full test suite to establish baseline
2. **After Implementation**: Run relevant tests to verify functionality
3. **Before Deployment**: Execute complete test collection
4. **Production Monitoring**: Use production environment for health checks

---

**Note**: Always test in SIMULATED mode first before using REAL mode with actual tax administration systems.

*Happy Testing! 🎉*