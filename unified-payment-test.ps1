# 🧪 Unified Payment Testing Script
# Consolidated script that replaces terminal-e2e-test.ps1, quick-test.ps1, and other duplicated scripts

param(
    [string]$Environment = "production",
    [string]$TestType = "comprehensive",
    [int]$Amount = 50000,
    [string]$PaymentMethod = "all"
)

# Configuration
$Config = @{
    production = @{
        baseUrl = "https://www.jbalwikobra.com"
        name = "Production"
    }
    local = @{
        baseUrl = "http://localhost:3000"
        name = "Local Development"
    }
}

$PaymentMethods = @{
    qris = "QRIS"
    bni = "BNI Virtual Account"
    mandiri = "Mandiri Virtual Account"
    bca = "BCA Virtual Account"
    dana = "DANA E-Wallet"
    gopay = "GoPay E-Wallet"
    shopeepay = "ShopeePay E-Wallet"
}

$TestAmounts = @{
    small = 10000
    medium = 50000
    large = 100000
}

# Helper Functions
function Write-TestHeader {
    param([string]$Title, [string]$Color = "Green")
    Write-Host "`n🧪 $Title" -ForegroundColor $Color
    Write-Host "$('=' * 60)" -ForegroundColor Gray
}

function Write-TestStep {
    param([string]$Step, [string]$Description)
    Write-Host "`n$Step $Description" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Yellow
}

function Test-PaymentMethodsAPI {
    param([string]$BaseUrl, [int]$Amount)
    
    try {
        $payload = @{ amount = $Amount } | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/xendit/payment-methods" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $payload `
            -UseBasicParsing

        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            Write-Success "Payment Methods API (Status: $($response.StatusCode))"
            Write-Info "Data source: $($data.source)"
            Write-Info "Available methods: $($data.payment_methods.Count)"
            
            if ($data.payment_methods.Count -gt 0) {
                $methods = $data.payment_methods | ForEach-Object { $_.id }
                Write-Info "Methods: $($methods -join ', ')"
            }
            return $true
        } else {
            Write-Error "Payment Methods API failed with status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-Error "Payment Methods API failed: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            Write-Info "Response status: $($_.Exception.Response.StatusCode.value__)"
        }
        return $false
    }
}

function Test-CreatePayment {
    param(
        [string]$BaseUrl,
        [string]$PaymentMethodId,
        [int]$Amount,
        [string]$OrderType = "purchase"
    )
    
    try {
        $timestamp = Get-Date -Format 'yyyyMMddHHmmss'
        $customer = @{
            given_names = "Test User Terminal"
            email = "test.terminal@example.com"
            mobile_number = "+628123456789"
        }
        
        $order = @{
            customer_name = $customer.given_names
            customer_email = $customer.email
            customer_phone = $customer.mobile_number
            product_name = "Test $OrderType Product"
            amount = $Amount
            order_type = $OrderType
        }
        
        if ($OrderType -eq "rental") {
            $order.rental_duration = 7
        }
        
        $payload = @{
            payment_method_id = $PaymentMethodId
            amount = $Amount
            currency = "IDR"
            customer = $customer
            description = "Terminal Test - $PaymentMethodId $OrderType"
            external_id = "test_${PaymentMethodId}_${OrderType}_$timestamp"
            success_redirect_url = "$BaseUrl/payment-status?status=success"
            failure_redirect_url = "$BaseUrl/payment-status?status=failed"
            order = $order
        } | ConvertTo-Json -Depth 3
        
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/xendit/create-direct-payment" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $payload `
            -UseBasicParsing

        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            Write-Success "$($PaymentMethods[$PaymentMethodId]) $OrderType (Status: $($response.StatusCode))"
            Write-Info "Payment ID: $($data.id)"
            Write-Info "Status: $($data.status)"
            
            # Show method-specific info
            if ($data.qr_string) {
                Write-Info "QR Code generated successfully"
            }
            if ($data.account_number) {
                Write-Info "Virtual Account: $($data.account_number)"
            }
            if ($data.payment_url) {
                Write-Info "Payment URL available"
            }
            
            return @{ success = $true; payment_id = $data.id; data = $data }
        } else {
            Write-Error "$($PaymentMethods[$PaymentMethodId]) $OrderType failed (Status: $($response.StatusCode))"
            return @{ success = $false; status = $response.StatusCode }
        }
    } catch {
        Write-Error "$($PaymentMethods[$PaymentMethodId]) $OrderType failed: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Info "Error details: $errorContent"
        }
        return @{ success = $false; error = $_.Exception.Message }
    }
}

function Test-QuickDiagnosticRun {
    param([string]$BaseUrl, [int]$Amount)
    
    Write-TestHeader "Quick Diagnostic Test" "Blue"
    
    $results = @{
        paymentMethods = $false
        qrisPayment = $false
    }
    
    # Test 1: Payment Methods
    Write-TestStep "1️⃣" "Payment Methods API"
    $results.paymentMethods = Test-PaymentMethodsAPI -BaseUrl $BaseUrl -Amount $Amount
    
    # Test 2: Simple QRIS Payment
    Write-TestStep "2️⃣" "Simple QRIS Payment"
    $paymentResult = Test-CreatePayment -BaseUrl $BaseUrl -PaymentMethodId "qris" -Amount $Amount
    $results.qrisPayment = $paymentResult.success
    
    # Summary
    $successCount = ($results.Values | Where-Object { $_ -eq $true }).Count
    $totalTests = $results.Count
    
    Write-Host "`n📊 Quick Diagnostic Summary:" -ForegroundColor Blue
    Write-Host "Tests passed: $successCount/$totalTests" -ForegroundColor $(if ($successCount -eq $totalTests) { "Green" } else { "Yellow" })
    
    return $results
}

function Test-Comprehensive {
    param([string]$BaseUrl, [int]$Amount)
    
    Write-TestHeader "Comprehensive E2E Test Suite" "Green"
    
    $results = @{
        paymentMethods = $false
        purchaseTests = @{}
        rentalTests = @{}
    }
    
    # Test 1: Payment Methods API
    Write-TestStep "1️⃣" "Payment Methods API"
    $results.paymentMethods = Test-PaymentMethodsAPI -BaseUrl $BaseUrl -Amount $Amount
    
    # Test 2: Purchase Flow Tests
    Write-TestStep "2️⃣" "Purchase Payment Tests"
    $purchaseMethods = @("qris", "bni", "dana")
    foreach ($method in $purchaseMethods) {
        $result = Test-CreatePayment -BaseUrl $BaseUrl -PaymentMethodId $method -Amount $Amount -OrderType "purchase"
        $results.purchaseTests[$method] = $result.success
        Start-Sleep -Seconds 1
    }
    
    # Test 3: Rental Flow Tests
    Write-TestStep "3️⃣" "Rental Payment Tests"
    $rentalMethods = @("qris", "mandiri")
    foreach ($method in $rentalMethods) {
        $result = Test-CreatePayment -BaseUrl $BaseUrl -PaymentMethodId $method -Amount ($Amount * 2) -OrderType "rental"
        $results.rentalTests[$method] = $result.success
        Start-Sleep -Seconds 1
    }
    
    # Summary
    $allTests = @($results.paymentMethods) + $results.purchaseTests.Values + $results.rentalTests.Values
    $successCount = ($allTests | Where-Object { $_ -eq $true }).Count
    $totalTests = $allTests.Count
    $successRate = [math]::Round(($successCount / $totalTests) * 100, 1)
    
    Write-Host "`n📊 Comprehensive Test Summary:" -ForegroundColor Green
    Write-Host "Total tests: $totalTests" -ForegroundColor Yellow
    Write-Host "Successful: $successCount" -ForegroundColor Green
    Write-Host "Failed: $($totalTests - $successCount)" -ForegroundColor Red
    Write-Host "Success rate: $successRate%" -ForegroundColor $(if ($successRate -gt 80) { "Green" } elseif ($successRate -gt 60) { "Yellow" } else { "Red" })
    
    return $results
}

function Test-SinglePaymentMethod {
    param([string]$BaseUrl, [string]$PaymentMethodId, [int]$Amount)
    
    Write-TestHeader "Single Payment Method Test: $($PaymentMethods[$PaymentMethodId])" "Blue"
    
    # Test purchase
    Write-TestStep "1️⃣" "Purchase Payment"
    $purchaseResult = Test-CreatePayment -BaseUrl $BaseUrl -PaymentMethodId $PaymentMethodId -Amount $Amount -OrderType "purchase"
    
    # Test rental
    Write-TestStep "2️⃣" "Rental Payment"
    $rentalResult = Test-CreatePayment -BaseUrl $BaseUrl -PaymentMethodId $PaymentMethodId -Amount ($Amount * 2) -OrderType "rental"
    
    # Summary
    $successCount = @($purchaseResult.success, $rentalResult.success) | Where-Object { $_ -eq $true } | Measure-Object | Select-Object -ExpandProperty Count
    
    Write-Host "`n📊 $($PaymentMethods[$PaymentMethodId]) Test Summary:" -ForegroundColor Blue
    Write-Host "Purchase: $(if ($purchaseResult.success) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($purchaseResult.success) { "Green" } else { "Red" })
    Write-Host "Rental: $(if ($rentalResult.success) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($rentalResult.success) { "Green" } else { "Red" })
    
    return @{
        purchase = $purchaseResult
        rental = $rentalResult
        successCount = $successCount
    }
}

# Main Execution
$currentConfig = $Config[$Environment]
if (-not $currentConfig) {
    Write-Error "Invalid environment: $Environment. Use 'production' or 'local'"
    exit 1
}

Write-TestHeader "$($currentConfig.name) Payment Testing" "Magenta"
Write-Host "Environment: $($currentConfig.name)" -ForegroundColor Yellow
Write-Host "Base URL: $($currentConfig.baseUrl)" -ForegroundColor Yellow
Write-Host "Test Type: $TestType" -ForegroundColor Yellow
Write-Host "Amount: IDR $('{0:N0}' -f $Amount)" -ForegroundColor Yellow

switch ($TestType.ToLower()) {
    "quick" {
        $results = Test-QuickDiagnosticRun -BaseUrl $currentConfig.baseUrl -Amount $Amount
    }
    "comprehensive" {
        $results = Test-Comprehensive -BaseUrl $currentConfig.baseUrl -Amount $Amount
    }
    "single" {
        if ($PaymentMethod -eq "all" -or -not $PaymentMethods.ContainsKey($PaymentMethod)) {
            Write-Error "For single test, specify a valid payment method: $($PaymentMethods.Keys -join ', ')"
            exit 1
        }
        $results = Test-SinglePaymentMethod -BaseUrl $currentConfig.baseUrl -PaymentMethodId $PaymentMethod -Amount $Amount
    }
    default {
        Write-Error "Invalid test type: $TestType. Use 'quick', 'comprehensive', or 'single'"
        exit 1
    }
}

Write-Host "`n🎉 Testing completed!" -ForegroundColor Green
Write-Host "Use -TestType to specify test type (quick/comprehensive/single)" -ForegroundColor Gray
Write-Host "Use -PaymentMethod for single tests (qris/bni/mandiri/dana/etc.)" -ForegroundColor Gray
Write-Host "Use -Environment to test different environments (production/local)" -ForegroundColor Gray
Write-Host "Use -Amount to specify test amount" -ForegroundColor Gray
