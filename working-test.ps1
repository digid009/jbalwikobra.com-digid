# 🧪 Working Payment Test Script

param(
    [string]$TestType = "quick"
)

$BaseUrl = "https://www.jbalwikobra.com"
$Amount = 50000

Write-Host "🧪 Payment Testing" -ForegroundColor Green
Write-Host "URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "Test: $TestType" -ForegroundColor Yellow
Write-Host "=" * 50

# Test 1: Payment Methods
Write-Host "`n1️⃣ Testing Payment Methods API..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/xendit/payment-methods" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"amount": 50000}' `
        -UseBasicParsing

    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Payment Methods API: SUCCESS" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "📊 Available methods: $($data.payment_methods.Count)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Payment Methods API: FAILED" -ForegroundColor Red
}

# Test 2: QRIS Payment
Write-Host "`n2️⃣ Testing QRIS Payment..." -ForegroundColor Cyan
$timestamp = Get-Date -Format 'HHmmss'
$payload = @{
    payment_method_id = "qris"
    amount = 50000
    currency = "IDR"
    external_id = "test_qris_$timestamp"
    description = "Test QRIS payment"
    customer = @{
        given_names = "Test User"
        email = "test@example.com"
        mobile_number = "+628123456789"
    }
    order = @{
        customer_name = "Test User"
        customer_email = "test@example.com"
        customer_phone = "+628123456789"
        product_name = "Test Product"
        amount = 50000
        order_type = "purchase"
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/xendit/create-direct-payment" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $payload `
        -UseBasicParsing

    if ($response.StatusCode -eq 200) {
        Write-Host "✅ QRIS Payment: SUCCESS" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "🆔 Payment ID: $($data.id)" -ForegroundColor Yellow
        Write-Host "📊 Status: $($data.status)" -ForegroundColor Yellow
        
        if ($data.qr_string) {
            Write-Host "📱 QR Code generated successfully" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ QRIS Payment: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Testing completed!" -ForegroundColor Green
