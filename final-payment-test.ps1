# Enhanced Payment Testing Script for JBalwikobra.com
# Tests unified payment system after refactoring

Write-Host "🚀 Starting Payment System Test..." -ForegroundColor Cyan
Write-Host "🌐 Testing: www.jbalwikobra.com" -ForegroundColor Yellow
Write-Host "⏰ Started at: $(Get-Date)" -ForegroundColor Gray

# Test Configuration
$baseUrl = "https://www.jbalwikobra.com"
$apiUrl = "$baseUrl/api/xendit/create-direct-payment"

# QRIS Test
Write-Host "`n📱 Testing QRIS Payment..." -ForegroundColor Cyan

try {
    $qrisPayload = @{
        amount = 15000
        paymentMethod = "QRIS"
        customerName = "PowerShell Test User"
        customerEmail = "test@example.com"
        description = "Test QRIS payment - refactored system"
    } | ConvertTo-Json

    $qrisHeaders = @{
        'Content-Type' = 'application/json'
        'Accept' = 'application/json'
    }

    Write-Host "🔄 Making API request..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri $apiUrl -Method POST -Body $qrisPayload -Headers $qrisHeaders -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ QRIS Payment: SUCCESS" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "🆔 Payment ID: $($data.id)" -ForegroundColor Yellow
        Write-Host "📊 Status: $($data.status)" -ForegroundColor Yellow
        
        if ($data.qr_string) {
            Write-Host "📱 QR Code generated successfully" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "❌ QRIS Payment: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Virtual Account Test
Write-Host "`n🏦 Testing Virtual Account (BCA)..." -ForegroundColor Cyan

try {
    $vaPayload = @{
        amount = 25000
        paymentMethod = "VIRTUAL_ACCOUNT"
        bankCode = "BCA"
        customerName = "PowerShell VA Test"
        customerEmail = "va-test@example.com"
        description = "Test VA payment - centralized config"
    } | ConvertTo-Json

    $vaHeaders = @{
        'Content-Type' = 'application/json'
        'Accept' = 'application/json'
    }

    Write-Host "🔄 Making VA API request..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri $apiUrl -Method POST -Body $vaPayload -Headers $vaHeaders -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Virtual Account: SUCCESS" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "🆔 Payment ID: $($data.id)" -ForegroundColor Yellow
        Write-Host "📊 Status: $($data.status)" -ForegroundColor Yellow
        
        if ($data.virtual_account_number) {
            Write-Host "🏦 VA Number: $($data.virtual_account_number)" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "❌ Virtual Account: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Payment testing completed!" -ForegroundColor Green
Write-Host "⏰ Finished at: $(Get-Date)" -ForegroundColor Gray
Write-Host "`n📋 Summary: Tested refactored payment system with centralized configuration" -ForegroundColor Cyan
