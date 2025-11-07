# PowerShell script to test English Invoice API endpoints
# Test-EnglishInvoiceAPI.ps1

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Mode = "development",
    [switch]$RunAll = $false,
    [switch]$Verbose = $false
)

# Colors for output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue
$Cyan = [System.ConsoleColor]::Cyan

# Global variables
$script:TestResults = @()
$script:ConsecutiveNumber = $null
$script:InvoiceKey = $null

function Write-ColoredOutput {
    param(
        [string]$Message,
        [System.ConsoleColor]$Color = [System.ConsoleColor]::White
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Uri,
        [object]$Body = $null,
        [hashtable]$Headers = @{"Content-Type" = "application/json"},
        [int[]]$ExpectedStatusCodes = @(200, 201)
    )
    
    Write-ColoredOutput "`n🧪 Testing: $Name" $Blue
    Write-ColoredOutput "   Method: $Method" $Cyan
    Write-ColoredOutput "   URI: $Uri" $Cyan
    
    $TestResult = @{
        Name = $Name
        Method = $Method
        Uri = $Uri
        Success = $false
        StatusCode = $null
        Response = $null
        Error = $null
        Duration = $null
    }
    
    try {
        $Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        $RequestParams = @{
            Uri = $Uri
            Method = $Method
            Headers = $Headers
            TimeoutSec = 30
        }
        
        if ($Body) {
            $RequestParams.Body = ($Body | ConvertTo-Json -Depth 10)
            if ($Verbose) {
                Write-ColoredOutput "   Body: $($RequestParams.Body)" $Yellow
            }
        }
        
        $Response = Invoke-RestMethod @RequestParams
        $Stopwatch.Stop()
        
        $StatusCode = 200  # Default for successful Invoke-RestMethod
        
        if ($ExpectedStatusCodes -contains $StatusCode) {
            $TestResult.Success = $true
            $TestResult.StatusCode = $StatusCode
            $TestResult.Response = $Response
            $TestResult.Duration = $Stopwatch.ElapsedMilliseconds
            
            Write-ColoredOutput "   ✅ SUCCESS - Status: $StatusCode (${($Stopwatch.ElapsedMilliseconds)}ms)" $Green
            
            # Extract important data for later tests
            if ($Response.consecutive) {
                $script:ConsecutiveNumber = $Response.consecutive
                Write-ColoredOutput "   📝 Saved consecutive: $($script:ConsecutiveNumber)" $Yellow
            }
            if ($Response.key) {
                $script:InvoiceKey = $Response.key
                Write-ColoredOutput "   🔑 Saved key: $($script:InvoiceKey)" $Yellow
            }
            
        } else {
            $TestResult.Success = $false
            $TestResult.Error = "Unexpected status code: $StatusCode"
            Write-ColoredOutput "   ❌ FAILED - Unexpected status: $StatusCode" $Red
        }
        
    } catch {
        $Stopwatch.Stop()
        $TestResult.Success = $false
        $TestResult.Error = $_.Exception.Message
        $TestResult.Duration = $Stopwatch.ElapsedMilliseconds
        
        # Try to get status code from exception
        if ($_.Exception.Response) {
            $TestResult.StatusCode = [int]$_.Exception.Response.StatusCode
        }
        
        Write-ColoredOutput "   ❌ FAILED - Error: $($_.Exception.Message)" $Red
        
        if ($Verbose) {
            Write-ColoredOutput "   Full Error: $_" $Red
        }
    }
    
    $script:TestResults += $TestResult
    return $TestResult
}

function Test-HealthCheck {
    Write-ColoredOutput "`n🏥 === HEALTH CHECK ===" $Blue
    
    $Result = Test-Endpoint -Name "Health Check" -Method "GET" -Uri "$BaseUrl/api/en/invoices/health/check"
    
    if ($Result.Success) {
        $Response = $Result.Response
        if ($Response.status -eq "healthy" -and $Response.language -eq "english") {
            Write-ColoredOutput "   🎉 API is healthy and ready for English invoicing!" $Green
        } else {
            Write-ColoredOutput "   ⚠️ API responded but status may not be optimal" $Yellow
        }
    }
    
    return $Result.Success
}

function Test-IssueBasicInvoice {
    Write-ColoredOutput "`n📄 === ISSUE BASIC INVOICE ===" $Blue
    
    $InvoiceData = @{
        documentType = "01"
        currencyCode = "USD"
        exchangeRate = 650.00
        issuer = @{
            name = "PowerShell Test Company LLC"
            identification = "123456789"
            identificationType = "02"
            email = "test@powershell.com"
            phone = "+1-555-0100"
            countryCode = "US"
            province = "01"
            canton = "01"
            district = "01"
            address = "123 PowerShell Avenue"
        }
        receiver = @{
            name = "Test Client Costa Rica SA"
            identification = "310123456789"
            identificationType = "02"
            email = "client@testcr.com"
            phone = "+506-2100-5000"
        }
        serviceDetail = @(
            @{
                lineNumber = 1
                code = "PS-TEST-001"
                description = "PowerShell API Testing Service"
                quantity = 1
                unitOfMeasure = "Unit"
                unitPrice = 100.00
                totalAmount = 100.00
                discount = 0.00
                discountNature = "No discount applied"
                subtotal = 100.00
                tax = @{
                    code = "01"
                    rateCode = "08"
                    rate = 13.00
                    amount = 13.00
                }
                totalLineAmount = 113.00
            }
        )
        invoiceSummary = @{
            totalTaxableServices = 100.00
            totalExemptServices = 0.00
            totalTaxableGoods = 0.00
            totalExemptGoods = 0.00
            totalTaxable = 100.00
            totalExempt = 0.00
            totalSale = 100.00
            totalDiscounts = 0.00
            totalNetSale = 100.00
            totalTax = 13.00
            totalInvoice = 113.00
        }
        saleCondition = "01"
        creditTerm = "0"
        observations = "PowerShell automated test invoice - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
    
    $Result = Test-Endpoint -Name "Issue Basic Invoice" -Method "POST" -Uri "$BaseUrl/api/en/invoices/issue" -Body $InvoiceData -ExpectedStatusCodes @(201)
    
    return $Result.Success
}

function Test-ValidateInvoice {
    Write-ColoredOutput "`n✅ === VALIDATE INVOICE ===" $Blue
    
    if (-not $script:ConsecutiveNumber -or -not $script:InvoiceKey) {
        Write-ColoredOutput "   ⚠️ No consecutive number or key available. Skipping validation test." $Yellow
        return $false
    }
    
    $ValidationData = @{
        key = $script:InvoiceKey
        consecutive = $script:ConsecutiveNumber
    }
    
    $Result = Test-Endpoint -Name "Validate Invoice by Key" -Method "POST" -Uri "$BaseUrl/api/en/invoices/validate" -Body $ValidationData
    
    return $Result.Success
}

function Test-SendInvoice {
    Write-ColoredOutput "`n📤 === SEND INVOICE ===" $Blue
    
    if (-not $script:ConsecutiveNumber) {
        Write-ColoredOutput "   ⚠️ No consecutive number available. Skipping send test." $Yellow
        return $false
    }
    
    $SendData = @{
        consecutive = $script:ConsecutiveNumber
    }
    
    $Result = Test-Endpoint -Name "Send Invoice" -Method "POST" -Uri "$BaseUrl/api/en/invoices/send" -Body $SendData
    
    return $Result.Success
}

function Test-QueryInvoice {
    Write-ColoredOutput "`n🔍 === QUERY INVOICE ===" $Blue
    
    if (-not $script:ConsecutiveNumber) {
        Write-ColoredOutput "   ⚠️ No consecutive number available. Skipping query test." $Yellow
        return $false
    }
    
    $Result = Test-Endpoint -Name "Query Invoice" -Method "GET" -Uri "$BaseUrl/api/en/invoices/$($script:ConsecutiveNumber)?includeContent=true" -ExpectedStatusCodes @(200, 404)
    
    return $Result.Success
}

function Test-ListInvoices {
    Write-ColoredOutput "`n📋 === LIST INVOICES ===" $Blue
    
    $Result = Test-Endpoint -Name "List Invoices" -Method "GET" -Uri "$BaseUrl/api/en/invoices?limit=5&offset=0"
    
    return $Result.Success
}

function Test-ErrorHandling {
    Write-ColoredOutput "`n❌ === ERROR HANDLING ===" $Blue
    
    # Test invalid data
    $InvalidData = @{
        documentType = ""
        issuer = @{
            name = ""
        }
    }
    
    $Result = Test-Endpoint -Name "Invalid Invoice Data" -Method "POST" -Uri "$BaseUrl/api/en/invoices/issue" -Body $InvalidData -ExpectedStatusCodes @(400)
    
    if ($Result.StatusCode -eq 400) {
        Write-ColoredOutput "   ✅ Error handling working correctly - returned 400 as expected" $Green
        return $true
    } else {
        Write-ColoredOutput "   ❌ Error handling not working - expected 400 status code" $Red
        return $false
    }
}

function Show-TestSummary {
    Write-ColoredOutput "`n📊 === TEST SUMMARY ===" $Blue
    Write-ColoredOutput "========================================" $Blue
    
    $TotalTests = $script:TestResults.Count
    $SuccessfulTests = ($script:TestResults | Where-Object { $_.Success }).Count
    $FailedTests = $TotalTests - $SuccessfulTests
    
    Write-ColoredOutput "`nTotal Tests: $TotalTests" $Cyan
    Write-ColoredOutput "Successful: $SuccessfulTests" $Green
    Write-ColoredOutput "Failed: $FailedTests" $Red
    Write-ColoredOutput "Success Rate: $(($SuccessfulTests / $TotalTests * 100).ToString('F1'))%" $Cyan
    
    if ($FailedTests -gt 0) {
        Write-ColoredOutput "`n❌ Failed Tests:" $Red
        $script:TestResults | Where-Object { -not $_.Success } | ForEach-Object {
            Write-ColoredOutput "   • $($_.Name): $($_.Error)" $Red
        }
    }
    
    Write-ColoredOutput "`n⏱️ Performance Summary:" $Cyan
    $script:TestResults | Where-Object { $_.Duration } | ForEach-Object {
        $Status = if ($_.Success) { "✅" } else { "❌" }
        Write-ColoredOutput "   $Status $($_.Name): $($_.Duration)ms" $Cyan
    }
    
    Write-ColoredOutput "`n🎯 Collected Data:" $Yellow
    if ($script:ConsecutiveNumber) {
        Write-ColoredOutput "   • Consecutive Number: $($script:ConsecutiveNumber)" $Yellow
    }
    if ($script:InvoiceKey) {
        Write-ColoredOutput "   • Invoice Key: $($script:InvoiceKey)" $Yellow
    }
}

# Main execution
function Main {
    Write-ColoredOutput "🚀 English Invoice API Test Suite" $Green
    Write-ColoredOutput "=================================" $Green
    Write-ColoredOutput "Base URL: $BaseUrl" $Cyan
    Write-ColoredOutput "Mode: $Mode" $Cyan
    Write-ColoredOutput "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" $Cyan
    
    # Test 1: Health Check (mandatory)
    $HealthOK = Test-HealthCheck
    
    if (-not $HealthOK) {
        Write-ColoredOutput "`n❌ API is not healthy. Stopping tests." $Red
        Write-ColoredOutput "Please make sure the API server is running on $BaseUrl" $Yellow
        exit 1
    }
    
    if ($RunAll) {
        Write-ColoredOutput "`n🔄 Running full test suite..." $Green
        
        # Test 2: Issue Invoice
        Test-IssueBasicInvoice
        
        # Test 3: Validate Invoice (depends on previous test)
        Test-ValidateInvoice
        
        # Test 4: Send Invoice (depends on issue test)
        Test-SendInvoice
        
        # Test 5: Query Invoice (depends on issue test)
        Test-QueryInvoice
        
        # Test 6: List Invoices
        Test-ListInvoices
        
        # Test 7: Error Handling
        Test-ErrorHandling
        
    } else {
        Write-ColoredOutput "`n✅ Health check passed. Use -RunAll to execute full test suite." $Green
        Write-ColoredOutput "Example: .\Test-EnglishInvoiceAPI.ps1 -RunAll -Verbose" $Cyan
    }
    
    # Show summary
    Show-TestSummary
    
    # Return success status
    $FailedTests = ($script:TestResults | Where-Object { -not $_.Success }).Count
    if ($FailedTests -eq 0) {
        Write-ColoredOutput "`n🎉 All tests passed successfully!" $Green
        exit 0
    } else {
        Write-ColoredOutput "`n⚠️ Some tests failed. Check the summary above." $Yellow
        exit 1
    }
}

# Execute main function
Main