# 🔍 Quick Production API Test
# Test the production APIs directly from terminal

Write-Host "🧪 Quick Production Test - www.jbalwikobra.com" -ForegroundColor Green

# Test Payment Methods API first
Write-Host "`n1️⃣ Payment Methods API Test..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://www.jbalwikobra.com/api/xendit/payment-methods" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"amount": 50000}' `
        -UseBasicParsing

    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "📊 Payment methods count: $($data.payment_methods.Count)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Simple Payment Creation
Write-Host "`n2️⃣ Simple Payment Creation Test..." -ForegroundColor Cyan
$simplePayload = @{
    payment_method_id = "qris"
    amount = 10000
    currency = "IDR"
    external_id = "test_$(Get-Date -Format 'HHmmss')"
    description = "Terminal Test"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "https://www.jbalwikobra.com/api/xendit/create-direct-payment" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $simplePayload `
        -UseBasicParsing

    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "🆔 Payment ID: $($data.id)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error: $errorContent" -ForegroundColor Red
    }
}

Write-Host "`n✅ Quick test complete!" -ForegroundColor Green
