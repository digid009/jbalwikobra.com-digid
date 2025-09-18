# 🧪 Terminal-based E2E Testing Script for Production
# Run these commands in PowerShell to test www.jbalwikobra.com

Write-Host "🚀 Production E2E Testing via Terminal" -ForegroundColor Green
Write-Host "Testing: www.jbalwikobra.com" -ForegroundColor Yellow
Write-Host "=" * 60

# Test 1: Payment Methods API
Write-Host "`n1️⃣ Testing Payment Methods API..." -ForegroundColor Cyan
try {
    $paymentMethodsResponse = Invoke-WebRequest -Uri "https://www.jbalwikobra.com/api/xendit/payment-methods" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"amount": 50000}' `
        -UseBasicParsing

    Write-Host "✅ Payment Methods API Status: $($paymentMethodsResponse.StatusCode)" -ForegroundColor Green
    
    $paymentMethodsData = $paymentMethodsResponse.Content | ConvertFrom-Json
    Write-Host "📊 Data source: $($paymentMethodsData.source)" -ForegroundColor Yellow
    Write-Host "🔢 Available methods: $($paymentMethodsData.payment_methods.Count)" -ForegroundColor Yellow
    
    if ($paymentMethodsData.payment_methods.Count -gt 0) {
        $methods = $paymentMethodsData.payment_methods | ForEach-Object { $_.id }
        Write-Host "💳 Methods: $($methods -join ', ')" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Payment Methods API failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

# Test 2: Create Purchase Payment (QRIS)
Write-Host "`n2️⃣ Testing Purchase Payment Creation (QRIS)..." -ForegroundColor Cyan

$purchasePayload = @{
    payment_method_id = "qris"
    amount = 50000
    currency = "IDR"
    customer = @{
        given_names = "Test User Terminal"
        email = "test.terminal@production-e2e.com"
        mobile_number = "+628123456789"
    }
    description = "Terminal E2E Test Purchase - QRIS"
    external_id = "terminal_purchase_$(Get-Date -Format 'yyyyMMddHHmmss')"
    success_redirect_url = "https://www.jbalwikobra.com/payment-status?status=success"
    failure_redirect_url = "https://www.jbalwikobra.com/payment-status?status=failed"
    order = @{
        customer_name = "Test User Terminal"
        customer_email = "test.terminal@production-e2e.com"
        customer_phone = "+628123456789"
        product_name = "Test Product - Purchase (Terminal E2E)"
        amount = 50000
        order_type = "purchase"
        rental_duration = $null
    }
} | ConvertTo-Json -Depth 3

try {
    $purchaseResponse = Invoke-WebRequest -Uri "https://www.jbalwikobra.com/api/xendit/create-direct-payment" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $purchasePayload `
        -UseBasicParsing

    Write-Host "✅ Purchase Payment Status: $($purchaseResponse.StatusCode)" -ForegroundColor Green
    
    $purchaseData = $purchaseResponse.Content | ConvertFrom-Json
    Write-Host "🆔 Payment ID: $($purchaseData.id)" -ForegroundColor Yellow
    Write-Host "📱 Status: $($purchaseData.status)" -ForegroundColor Yellow
    Write-Host "🔗 QR Code available: $(if($purchaseData.qr_string) { 'Yes' } else { 'No' })" -ForegroundColor Yellow
    
    if ($purchaseData.qr_string) {
        Write-Host "📱 QR Code ready for scanning!" -ForegroundColor Green
        $paymentUrl = "https://www.jbalwikobra.com/payment?id=$($purchaseData.id)&method=qris&amount=50000&external_id=$($purchaseData.external_id)"
        Write-Host "🔗 Payment URL: $paymentUrl" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Purchase Payment failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}

# Test 3: Create Rental Payment (BNI VA)
Write-Host "`n3️⃣ Testing Rental Payment Creation (BNI VA)..." -ForegroundColor Cyan

$rentalPayload = @{
    payment_method_id = "bni"
    amount = 25000
    currency = "IDR"
    customer = @{
        given_names = "Test User Terminal Rental"
        email = "test.rental.terminal@production-e2e.com"
        mobile_number = "+628123456789"
    }
    description = "Terminal E2E Test Rental - BNI VA"
    external_id = "terminal_rental_$(Get-Date -Format 'yyyyMMddHHmmss')"
    success_redirect_url = "https://www.jbalwikobra.com/payment-status?status=success"
    failure_redirect_url = "https://www.jbalwikobra.com/payment-status?status=failed"
    order = @{
        customer_name = "Test User Terminal Rental"
        customer_email = "test.rental.terminal@production-e2e.com"
        customer_phone = "+628123456789"
        product_name = "Test Product - Rental (Terminal E2E)"
        amount = 25000
        order_type = "rental"
        rental_duration = "1 hari"
    }
} | ConvertTo-Json -Depth 3

try {
    $rentalResponse = Invoke-WebRequest -Uri "https://www.jbalwikobra.com/api/xendit/create-direct-payment" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $rentalPayload `
        -UseBasicParsing

    Write-Host "✅ Rental Payment Status: $($rentalResponse.StatusCode)" -ForegroundColor Green
    
    $rentalData = $rentalResponse.Content | ConvertFrom-Json
    Write-Host "🆔 Payment ID: $($rentalData.id)" -ForegroundColor Yellow
    Write-Host "📱 Status: $($rentalData.status)" -ForegroundColor Yellow
    Write-Host "🏦 Virtual Account: $(if($rentalData.account_number) { $rentalData.account_number } else { 'N/A' })" -ForegroundColor Yellow
    Write-Host "🏪 Bank Code: $(if($rentalData.bank_code) { $rentalData.bank_code } else { 'N/A' })" -ForegroundColor Yellow
    
    if ($rentalData.account_number) {
        Write-Host "💰 Transfer to BNI VA: $($rentalData.account_number) (Amount: Rp $($rentalData.amount.ToString('N0')))" -ForegroundColor Green
        $rentalUrl = "https://www.jbalwikobra.com/payment?id=$($rentalData.id)&method=bni&amount=25000&external_id=$($rentalData.external_id)"
        Write-Host "🔗 Payment URL: $rentalUrl" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Rental Payment failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}

# Test 4: Quick Diagnostic
Write-Host "`n4️⃣ Quick Diagnostic..." -ForegroundColor Cyan

$diagnosticPayload = @{
    payment_method_id = "qris"
    amount = 10000
    currency = "IDR"
    external_id = "diagnostic_$(Get-Date -Format 'yyyyMMddHHmmss')"
    description = "Diagnostic Test"
} | ConvertTo-Json

try {
    $diagnosticResponse = Invoke-WebRequest -Uri "https://www.jbalwikobra.com/api/xendit/create-direct-payment" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $diagnosticPayload `
        -UseBasicParsing

    Write-Host "✅ Minimal payment test passed: $($diagnosticResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Minimal payment test failed" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
        
        # Check for specific error patterns
        if ($errorContent -like "*XENDIT_SECRET_KEY*") {
            Write-Host "💡 Issue: Xendit secret key not configured in production" -ForegroundColor Yellow
        } elseif ($errorContent -like "*unauthorized*") {
            Write-Host "💡 Issue: Xendit authentication failed" -ForegroundColor Yellow
        } elseif ($errorContent -like "*validation*") {
            Write-Host "💡 Issue: Request validation failed" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n🎯 Terminal E2E Testing Complete!" -ForegroundColor Green
Write-Host "=" * 60
