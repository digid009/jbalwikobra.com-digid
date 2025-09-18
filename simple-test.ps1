# Simple Payment Test - Clean PowerShell Script
Write-Host "Testing Payment System..." -ForegroundColor Green

$apiUrl = "https://www.jbalwikobra.com/api/xendit/create-direct-payment"

$payload = @{
    amount = 15000
    paymentMethod = "QRIS"
    customerName = "Test User"
    customerEmail = "test@example.com"
    description = "Test payment"
}

$json = $payload | ConvertTo-Json
$headers = @{'Content-Type' = 'application/json'}

try {
    $response = Invoke-WebRequest -Uri $apiUrl -Method POST -Body $json -Headers $headers -UseBasicParsing
    Write-Host "SUCCESS: Payment API working" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Yellow
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test completed." -ForegroundColor Cyan
