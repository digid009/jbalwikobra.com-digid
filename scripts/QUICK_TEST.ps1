# Quick Test - Simple One-Liner
# Copy and paste this into PowerShell terminal

# QRIS Test (Quick)
Invoke-RestMethod -Uri 'https://www.jbalwikobra.com/api/xendit/create-direct-payment' -Method Post -Body (@{ amount=50000; currency='IDR'; payment_method_id='qris'; external_id="test-$(Get-Date -Format 'yyyyMMddHHmmss')"; description='Quick Test'; customer=@{given_names='Test';email='test@test.com';mobile_number='+628123456789'} } | ConvertTo-Json -Depth 10) -ContentType 'application/json' | ConvertTo-Json -Depth 10

# BNI VA Test (Quick)
Invoke-RestMethod -Uri 'https://www.jbalwikobra.com/api/xendit/create-direct-payment' -Method Post -Body (@{ amount=75000; currency='IDR'; payment_method_id='bni'; external_id="test-$(Get-Date -Format 'yyyyMMddHHmmss')"; description='Quick Test BNI'; customer=@{given_names='Test';email='test@test.com';mobile_number='+628123456789'} } | ConvertTo-Json -Depth 10) -ContentType 'application/json' | ConvertTo-Json -Depth 10

# ShopeePay Test (Quick)
Invoke-RestMethod -Uri 'https://www.jbalwikobra.com/api/xendit/create-direct-payment' -Method Post -Body (@{ amount=100000; currency='IDR'; payment_method_id='shopeepay'; external_id="test-$(Get-Date -Format 'yyyyMMddHHmmss')"; description='Quick Test ShopeePay'; customer=@{given_names='Test';email='test@test.com';mobile_number='+628123456789'} } | ConvertTo-Json -Depth 10) -ContentType 'application/json' | ConvertTo-Json -Depth 10
