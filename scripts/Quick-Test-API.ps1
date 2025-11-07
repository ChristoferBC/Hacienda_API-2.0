# Simple PowerShell script to test individual endpoints
# Quick-Test-API.ps1

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("health", "issue", "validate", "send", "query", "list")]
    [string]$Test,
    
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Consecutive = "",
    [string]$Key = ""
)

function Invoke-HealthCheck {
    Write-Host "🏥 Testing Health Check..." -ForegroundColor Blue
    
    try {
        $Response = Invoke-RestMethod -Uri "$BaseUrl/api/en/invoices/health/check" -Method GET
        
        Write-Host "✅ Health Check Successful!" -ForegroundColor Green
        Write-Host "Status: $($Response.status)" -ForegroundColor Cyan
        Write-Host "Language: $($Response.language)" -ForegroundColor Cyan
        Write-Host "Version: $($Response.version)" -ForegroundColor Cyan
        Write-Host "Mode: $($Response.mode)" -ForegroundColor Cyan
        
        return $Response
    } catch {
        Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Invoke-IssueInvoice {
    Write-Host "📄 Testing Issue Invoice..." -ForegroundColor Blue
    
    $InvoiceData = @{
        documentType = "01"
        currencyCode = "USD"
        exchangeRate = 650.00
        issuer = @{
            name = "Quick Test Company"
            identification = "123456789"
            identificationType = "02"
            email = "test@quicktest.com"
            phone = "+1-555-0100"
            countryCode = "US"
            province = "01"
            canton = "01"
            district = "01"
            address = "123 Quick Test Street"
        }
        receiver = @{
            name = "Test Receiver CR"
            identification = "310123456789"
            identificationType = "02"
            email = "receiver@test.cr"
            phone = "+506-2100-5000"
        }
        serviceDetail = @(
            @{
                lineNumber = 1
                code = "QUICK-001"
                description = "Quick Test Service"
                quantity = 1
                unitOfMeasure = "Unit"
                unitPrice = 50.00
                totalAmount = 50.00
                discount = 0.00
                discountNature = "No discount"
                subtotal = 50.00
                tax = @{
                    code = "01"
                    rateCode = "08"
                    rate = 13.00
                    amount = 6.50
                }
                totalLineAmount = 56.50
            }
        )
        invoiceSummary = @{
            totalTaxableServices = 50.00
            totalExemptServices = 0.00
            totalTaxableGoods = 0.00
            totalExemptGoods = 0.00
            totalTaxable = 50.00
            totalExempt = 0.00
            totalSale = 50.00
            totalDiscounts = 0.00
            totalNetSale = 50.00
            totalTax = 6.50
            totalInvoice = 56.50
        }
        saleCondition = "01"
        creditTerm = "0"
        observations = "Quick test invoice - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    }
    
    try {
        $Body = $InvoiceData | ConvertTo-Json -Depth 10
        $Response = Invoke-RestMethod -Uri "$BaseUrl/api/en/invoices/issue" -Method POST -Body $Body -ContentType "application/json"
        
        Write-Host "✅ Invoice Issued Successfully!" -ForegroundColor Green
        Write-Host "Consecutive: $($Response.consecutive)" -ForegroundColor Yellow
        Write-Host "Key: $($Response.key)" -ForegroundColor Yellow
        Write-Host "Status: $($Response.status)" -ForegroundColor Cyan
        Write-Host "Mode: $($Response.mode)" -ForegroundColor Cyan
        
        return $Response
    } catch {
        Write-Host "❌ Issue Invoice Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Invoke-ValidateInvoice {
    param([string]$ConsecutiveNum, [string]$InvoiceKey)
    
    Write-Host "✅ Testing Validate Invoice..." -ForegroundColor Blue
    
    if (-not $ConsecutiveNum -and -not $InvoiceKey) {
        Write-Host "❌ Missing consecutive number and key for validation" -ForegroundColor Red
        return $null
    }
    
    $ValidationData = @{
        consecutive = $ConsecutiveNum
        key = $InvoiceKey
    }
    
    try {
        $Body = $ValidationData | ConvertTo-Json
        $Response = Invoke-RestMethod -Uri "$BaseUrl/api/en/invoices/validate" -Method POST -Body $Body -ContentType "application/json"
        
        Write-Host "✅ Validation Successful!" -ForegroundColor Green
        Write-Host "Valid: $($Response.valid)" -ForegroundColor Cyan
        Write-Host "Method: $($Response.method)" -ForegroundColor Cyan
        
        return $Response
    } catch {
        Write-Host "❌ Validation Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Invoke-SendInvoice {
    param([string]$ConsecutiveNum)
    
    Write-Host "📤 Testing Send Invoice..." -ForegroundColor Blue
    
    if (-not $ConsecutiveNum) {
        Write-Host "❌ Missing consecutive number for sending" -ForegroundColor Red
        return $null
    }
    
    $SendData = @{
        consecutive = $ConsecutiveNum
    }
    
    try {
        $Body = $SendData | ConvertTo-Json
        $Response = Invoke-RestMethod -Uri "$BaseUrl/api/en/invoices/send" -Method POST -Body $Body -ContentType "application/json"
        
        Write-Host "✅ Send Successful!" -ForegroundColor Green
        Write-Host "Status: $($Response.status)" -ForegroundColor Cyan
        Write-Host "Receipt Number: $($Response.receiptNumber)" -ForegroundColor Cyan
        
        return $Response
    } catch {
        Write-Host "❌ Send Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Invoke-QueryInvoice {
    param([string]$ConsecutiveNum)
    
    Write-Host "🔍 Testing Query Invoice..." -ForegroundColor Blue
    
    if (-not $ConsecutiveNum) {
        Write-Host "❌ Missing consecutive number for query" -ForegroundColor Red
        return $null
    }
    
    try {
        $Response = Invoke-RestMethod -Uri "$BaseUrl/api/en/invoices/$ConsecutiveNum?includeContent=true" -Method GET
        
        Write-Host "✅ Query Successful!" -ForegroundColor Green
        Write-Host "Found: $($Response.found)" -ForegroundColor Cyan
        Write-Host "Language: $($Response.language)" -ForegroundColor Cyan
        
        return $Response
    } catch {
        Write-Host "❌ Query Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Invoke-ListInvoices {
    Write-Host "📋 Testing List Invoices..." -ForegroundColor Blue
    
    try {
        $Response = Invoke-RestMethod -Uri "$BaseUrl/api/en/invoices?limit=5&offset=0" -Method GET
        
        Write-Host "✅ List Successful!" -ForegroundColor Green
        Write-Host "Total: $($Response.pagination.total)" -ForegroundColor Cyan
        Write-Host "Returned: $($Response.invoices.Count)" -ForegroundColor Cyan
        Write-Host "Language: $($Response.metadata.language)" -ForegroundColor Cyan
        
        return $Response
    } catch {
        Write-Host "❌ List Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Main execution
Write-Host "`n🚀 Quick English Invoice API Test" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "Test: $Test" -ForegroundColor Cyan
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan

switch ($Test.ToLower()) {
    "health" {
        Invoke-HealthCheck
    }
    "issue" {
        Invoke-IssueInvoice
    }
    "validate" {
        if ($Consecutive -and $Key) {
            Invoke-ValidateInvoice -ConsecutiveNum $Consecutive -InvoiceKey $Key
        } else {
            Write-Host "❌ For validate test, provide -Consecutive and -Key parameters" -ForegroundColor Red
            Write-Host "Example: .\Quick-Test-API.ps1 -Test validate -Consecutive '12345678901234567890' -Key 'your-key-here'" -ForegroundColor Yellow
        }
    }
    "send" {
        if ($Consecutive) {
            Invoke-SendInvoice -ConsecutiveNum $Consecutive
        } else {
            Write-Host "❌ For send test, provide -Consecutive parameter" -ForegroundColor Red
            Write-Host "Example: .\Quick-Test-API.ps1 -Test send -Consecutive '12345678901234567890'" -ForegroundColor Yellow
        }
    }
    "query" {
        if ($Consecutive) {
            Invoke-QueryInvoice -ConsecutiveNum $Consecutive
        } else {
            Write-Host "❌ For query test, provide -Consecutive parameter" -ForegroundColor Red
            Write-Host "Example: .\Quick-Test-API.ps1 -Test query -Consecutive '12345678901234567890'" -ForegroundColor Yellow
        }
    }
    "list" {
        Invoke-ListInvoices
    }
}

Write-Host "`n✨ Test completed!" -ForegroundColor Green