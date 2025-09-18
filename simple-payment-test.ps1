# 🧪 Simple Unified Payment Test Script
# Consolidated testing script that works properly

param(
    [string]$TestType = "quick",
    [int]$Amount = 50000,
    [string]$PaymentMethod = "qris"
)

$BaseUrl = "https://www.jbalwikobra.com"

Write-Host "🧪 Simple Payment Testing" -ForegroundColor Green
Write-Host "Environment: Production ($BaseUrl)" -ForegroundColor Yellow
Write-Host "Test Type: $TestType" -ForegroundColor Yellow
Write-Host "Amount: IDR $('{0:N0}' -f $Amount)" -ForegroundColor Yellow
Write-Host "=" * 60

function Test-PaymentMethods {
    param([string]$BaseUrl, [int]$Amount)
    
    Write-Host "`n1️⃣ Testing Payment Methods API..." -ForegroundColor Cyan
    try {
        $payload = @{ amount = $Amount } | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/xendit/payment-methods" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $payload `
            -UseBasicParsing

        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            Write-Host "✅ Payment Methods API SUCCESS" -ForegroundColor Green
            Write-Host "📊 Available methods: $($data.payment_methods.Count)" -ForegroundColor Yellow
            return $true
        }
    } catch {
        Write-Host "❌ Payment Methods API FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-CreatePayment {
    param([string]$BaseUrl, [string]$PaymentMethodId, [int]$Amount, [string]$OrderType = "purchase")
    
    Write-Host "`n2️⃣ Testing $PaymentMethodId $OrderType payment..." -ForegroundColor Cyan
    try {
        $timestamp = Get-Date -Format 'yyyyMMddHHmmss'
        $payload = @{
            payment_method_id = $PaymentMethodId
            amount = $Amount
            currency = "IDR"
            customer = @{
                given_names = "Test User"
                email = "test@example.com"
                mobile_number = "+628123456789"
            }
            description = "Test $OrderType payment"
            external_id = "test_${PaymentMethodId}_${OrderType}_$timestamp"
            order = @{
                customer_name = "Test User"
                customer_email = "test@example.com"
                customer_phone = "+628123456789"
                product_name = "Test Product"
                amount = $Amount
                order_type = $OrderType
            }
        } | ConvertTo-Json -Depth 3
        
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/xendit/create-direct-payment" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $payload `
            -UseBasicParsing

        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            Write-Host "✅ $PaymentMethodId $OrderType SUCCESS" -ForegroundColor Green
            Write-Host "🆔 Payment ID: $($data.id)" -ForegroundColor Yellow
            Write-Host "📊 Status: $($data.status)" -ForegroundColor Yellow
            
            if ($data.qr_string) { Write-Host "📱 QR Code generated" -ForegroundColor Yellow }
            if ($data.account_number) { Write-Host "🏦 Virtual Account: $($data.account_number)" -ForegroundColor Yellow }
            if ($data.payment_url) { Write-Host "🌐 Payment URL available" -ForegroundColor Yellow }
            
            return $true
        } else {
            Write-Host "❌ $PaymentMethodId $OrderType FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $PaymentMethodId $OrderType FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
switch ($TestType.ToLower()) {
    "quick" {
        $paymentMethodsResult = Test-PaymentMethods -BaseUrl $BaseUrl -Amount $Amount
        Start-Sleep -Seconds 1
        $qrisResult = Test-CreatePayment -BaseUrl $BaseUrl -PaymentMethodId "qris" -Amount $Amount
        
        $successCount = @($paymentMethodsResult, $qrisResult) | Where-Object { $_ -eq $true } | Measure-Object | Select-Object -ExpandProperty Count
        
        Write-Host "`n📊 Quick Test Summary:" -ForegroundColor Blue
        Write-Host "Tests passed: $successCount/2" -ForegroundColor $(if ($successCount -eq 2) { "Green" } else { "Yellow" })
    }
    
    "comprehensive" {
        $results = @()
        
        # Test payment methods
        $results += Test-PaymentMethods -BaseUrl $BaseUrl -Amount $Amount
        Start-Sleep -Seconds 1
        
        # Test multiple payment methods
        $methods = @("qris", "bni", "dana")
        foreach ($method in $methods) {
            $results += Test-CreatePayment -BaseUrl $BaseUrl -PaymentMethodId $method -Amount $Amount -OrderType "purchase"
            Start-Sleep -Seconds 1
        }
        
        # Test rental flow
        $results += Test-CreatePayment -BaseUrl $BaseUrl -PaymentMethodId "qris" -Amount ($Amount * 2) -OrderType "rental"
        
        $successCount = ($results | Where-Object { $_ -eq $true }).Count
        $totalTests = $results.Count
        $successRate = [math]::Round(($successCount / $totalTests) * 100, 1)
        
        Write-Host "`n📊 Comprehensive Test Summary:" -ForegroundColor Blue
        Write-Host "Total tests: $totalTests" -ForegroundColor Yellow
        Write-Host "Successful: $successCount" -ForegroundColor Green
        Write-Host "Failed: $($totalTests - $successCount)" -ForegroundColor Red
        Write-Host "Success rate: $successRate%" -ForegroundColor $(if ($successRate -gt 80) { "Green" } else { "Yellow" })
    }
    
    "single" {
        $purchaseResult = Test-CreatePayment -BaseUrl $BaseUrl -PaymentMethodId $PaymentMethod -Amount $Amount -OrderType "purchase"
        Start-Sleep -Seconds 1
        $rentalResult = Test-CreatePayment -BaseUrl $BaseUrl -PaymentMethodId $PaymentMethod -Amount ($Amount * 2) -OrderType "rental"
        
        $successCount = @($purchaseResult, $rentalResult) | Where-Object { $_ -eq $true } | Measure-Object | Select-Object -ExpandProperty Count
        
        Write-Host "`n📊 $PaymentMethod Test Summary:" -ForegroundColor Blue
        Write-Host "Purchase: $(if ($purchaseResult) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($purchaseResult) { "Green" } else { "Red" })
        Write-Host "Rental: $(if ($rentalResult) { '✅ PASS' } else { '❌ FAIL' })" -ForegroundColor $(if ($rentalResult) { "Green" } else { "Red" })
    }
    
    default {
        Write-Host "❌ Invalid test type: $TestType" -ForegroundColor Red
        Write-Host "Valid options: quick, comprehensive, single" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n🎉 Testing completed!" -ForegroundColor Green
