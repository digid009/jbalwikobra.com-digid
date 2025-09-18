# Environment Files Duplicate Cleanup
Write-Host "Cleaning up duplicate environment test files..." -ForegroundColor Green

$duplicateFiles = @(
    "test-env.js",
    "scripts\validate-env-security.js", 
    "api\test\env-check.js"
)

foreach ($file in $duplicateFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file" -ForegroundColor Yellow
    }
    else {
        Write-Host "Not found: $file" -ForegroundColor Gray
    }
}

# Check for any remaining duplicate env files
Write-Host "`nChecking for remaining duplicate files..." -ForegroundColor Cyan
$envFiles = Get-ChildItem -Recurse -Name "*env*" | Where-Object { $_ -like "*.js" -or $_ -like "*.env*" }

if ($envFiles) {
    Write-Host "Remaining environment files:" -ForegroundColor Yellow
    $envFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
}

Write-Host "`nEnvironment cleanup completed!" -ForegroundColor Green
