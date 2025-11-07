# PowerShell Testing Scripts

This directory contains PowerShell scripts for testing the English Invoice API.

## 📁 Files

### 1. `Test-EnglishInvoiceAPI.ps1`
**Comprehensive Test Suite** - Full automated testing with detailed reporting.

#### Usage:
```powershell
# Health check only
.\Test-EnglishInvoiceAPI.ps1

# Full test suite
.\Test-EnglishInvoiceAPI.ps1 -RunAll

# Full test with verbose output
.\Test-EnglishInvoiceAPI.ps1 -RunAll -Verbose

# Custom base URL
.\Test-EnglishInvoiceAPI.ps1 -BaseUrl "http://localhost:8080" -RunAll
```

#### Features:
- ✅ Complete test coverage
- 📊 Detailed reporting and statistics
- 🔄 Sequential test execution
- 💾 Automatic data preservation between tests
- ⏱️ Performance measurements
- 🎨 Color-coded output

### 2. `Quick-Test-API.ps1`
**Individual Endpoint Testing** - Quick tests for specific endpoints.

#### Usage:
```powershell
# Test health check
.\Quick-Test-API.ps1 -Test health

# Issue a new invoice
.\Quick-Test-API.ps1 -Test issue

# Validate an existing invoice
.\Quick-Test-API.ps1 -Test validate -Consecutive "12345678901234567890" -Key "your-invoice-key"

# Send invoice to tax administration
.\Quick-Test-API.ps1 -Test send -Consecutive "12345678901234567890"

# Query specific invoice
.\Quick-Test-API.ps1 -Test query -Consecutive "12345678901234567890"

# List invoices
.\Quick-Test-API.ps1 -Test list
```

#### Available Tests:
- `health` - API health check
- `issue` - Issue new invoice
- `validate` - Validate invoice by key/consecutive
- `send` - Send invoice to tax administration
- `query` - Query specific invoice
- `list` - List invoices with pagination

## 🚀 Getting Started

### Prerequisites
1. **PowerShell 5.1+** (Windows) or **PowerShell Core 6+** (Cross-platform)
2. **API Server Running** on `http://localhost:3000` (or specify different URL)

### Quick Start
1. Open PowerShell as Administrator
2. Navigate to the scripts directory:
   ```powershell
   cd "c:\Users\Christofer Brenes\Documents\PRACTICA\Hacienda_API\scripts"
   ```
3. Run health check:
   ```powershell
   .\Quick-Test-API.ps1 -Test health
   ```

### Full Test Workflow
```powershell
# 1. Health check first
.\Quick-Test-API.ps1 -Test health

# 2. Issue an invoice and note the consecutive number
.\Quick-Test-API.ps1 -Test issue

# 3. Use the consecutive number from step 2
.\Quick-Test-API.ps1 -Test query -Consecutive "CONSECUTIVE_FROM_STEP_2"

# 4. Or run everything automatically
.\Test-EnglishInvoiceAPI.ps1 -RunAll
```

## 📊 Example Output

### Health Check Success:
```
🏥 Testing Health Check...
✅ Health Check Successful!
Status: healthy
Language: english
Version: 1.0.0
Mode: SIMULATED
```

### Invoice Issue Success:
```
📄 Testing Issue Invoice...
✅ Invoice Issued Successfully!
Consecutive: 12345678901234567890
Key: 50612345678901234567890123456789012345678901
Status: issued
Mode: SIMULATED
```

### Full Test Suite Results:
```
📊 === TEST SUMMARY ===
========================================

Total Tests: 7
Successful: 7
Failed: 0
Success Rate: 100.0%

⏱️ Performance Summary:
   ✅ Health Check: 145ms
   ✅ Issue Basic Invoice: 892ms
   ✅ Validate Invoice by Key: 234ms
   ✅ Send Invoice: 456ms
   ✅ Query Invoice: 123ms
   ✅ List Invoices: 167ms
   ✅ Invalid Invoice Data: 89ms

🎯 Collected Data:
   • Consecutive Number: 12345678901234567890
   • Invoice Key: 50612345678901234567890123456789012345678901
```

## 🛠 Troubleshooting

### Common Issues

#### 1. "Connection refused" or "API not responding"
```
❌ Health Check Failed: Unable to connect to the remote server
```
**Solution:**
- Ensure API server is running: `npm start`
- Check if port 3000 is available
- Verify base URL is correct

#### 2. "Execution Policy" Error
```
cannot be loaded because running scripts is disabled on this system
```
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 3. "Invalid consecutive format"
```
❌ Query Failed: Invalid consecutive format
```
**Solution:**
- Ensure consecutive number is exactly 20 digits
- Use consecutive number from successful invoice issue

#### 4. SSL/TLS Errors (HTTPS)
```powershell
# For testing with self-signed certificates
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
```

### Debug Mode
Run scripts with verbose output for debugging:
```powershell
.\Test-EnglishInvoiceAPI.ps1 -RunAll -Verbose
```

## 🔧 Customization

### Custom Base URL
```powershell
.\Test-EnglishInvoiceAPI.ps1 -BaseUrl "https://api.yourcompany.com" -RunAll
```

### Custom Test Data
Edit the `$InvoiceData` object in the scripts to test with your specific data:

```powershell
$InvoiceData = @{
    documentType = "01"
    currencyCode = "EUR"  # Change currency
    exchangeRate = 720.00  # Update exchange rate
    issuer = @{
        name = "Your Company Name"  # Customize issuer
        # ... other fields
    }
    # ... rest of invoice data
}
```

## 📈 Performance Testing

### Load Testing with PowerShell
```powershell
# Run multiple instances
1..10 | ForEach-Object {
    Start-Job -ScriptBlock {
        .\Quick-Test-API.ps1 -Test issue
    }
}

# Check results
Get-Job | Receive-Job
Get-Job | Remove-Job
```

### Timing Analysis
```powershell
# Measure execution time
Measure-Command { .\Quick-Test-API.ps1 -Test issue }
```

## 🔄 Automation

### Scheduled Testing
Create a scheduled task to run tests regularly:
```powershell
# Run every hour
$Trigger = New-ScheduledTaskTrigger -Repetition (New-TimeSpan -Hours 1) -At (Get-Date)
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\path\to\Test-EnglishInvoiceAPI.ps1 -RunAll"
Register-ScheduledTask -TaskName "API-Health-Check" -Trigger $Trigger -Action $Action
```

### CI/CD Integration
```powershell
# Exit with error code if tests fail
.\Test-EnglishInvoiceAPI.ps1 -RunAll
if ($LASTEXITCODE -ne 0) {
    Write-Error "API tests failed"
    exit 1
}
```

## 📝 Logging

### Enable Logging
```powershell
# Redirect output to file
.\Test-EnglishInvoiceAPI.ps1 -RunAll | Tee-Object -FilePath "test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
```

### View Historical Results
```powershell
# View recent test logs
Get-ChildItem -Filter "test-results-*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

---

## 🎯 Best Practices

1. **Always run health check first** before other tests
2. **Use SIMULATED mode** for development and testing
3. **Save consecutive numbers** from successful invoice creations
4. **Run full test suite** before deploying changes
5. **Monitor performance** trends over time
6. **Test error scenarios** regularly to ensure proper error handling

## 🆘 Support

For issues with the PowerShell scripts:
1. Check PowerShell version: `$PSVersionTable.PSVersion`
2. Verify execution policy: `Get-ExecutionPolicy`
3. Test basic connectivity: `Test-NetConnection localhost -Port 3000`
4. Review API logs in the main application

---

*Happy Testing with PowerShell! 🎉*