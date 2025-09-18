# Cleanup Obsolete Test Files
Write-Host "Cleaning up obsolete test files..." -ForegroundColor Green

$filesToRemove = @(
    "auto-setup-storage.js",
    "browser-debug-mark-as-read.js", 
    "browser-debug-payment-flow.js",
    "browser-fix-dashboard.js",
    "check-connections.js",
    "check-orders-schema.js",
    "check-recent-products.js",
    "check-rental-options.js",
    "check-schema.js",
    "check-tables.js",
    "clear-and-test-notifications.js",
    "clear-cache-fix.js",
    "clear-cache.js",
    "comprehensive-debug.js",
    "create-reviews-script.js",
    "create-test-notification-browser.js",
    "debug-create-product.js",
    "debug-dashboard-data.js",
    "debug-flash-sales-navigation.js",
    "debug-orders-table.js",
    "debug-payment-interface.js",
    "debug-payment-issues.js",
    "debug-payment-redirect.js",
    "debug-production-purchase-flow.js",
    "debug-products.js"
)

$removed = 0
$skipped = 0

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force
            Write-Host "Removed: $file" -ForegroundColor Yellow
            $removed++
        }
        catch {
            Write-Host "Failed to remove: $file" -ForegroundColor Red
        }
    }
    else {
        Write-Host "Not found: $file" -ForegroundColor Gray
        $skipped++
    }
}

Write-Host "`nCleanup Summary:" -ForegroundColor Green
Write-Host "Files removed: $removed" -ForegroundColor Yellow
Write-Host "Files not found: $skipped" -ForegroundColor Gray

Write-Host "`nCleanup completed!" -ForegroundColor Green
