# 🧹 Cleanup Script - Remove Obsolete Test Files
# This script helps identify and remove duplicate/obsolete test files

param(
    [switch]$DryRun = $false,
    [switch]$Interactive = $false
)

Write-Host "🧹 Test File Cleanup Utility" -ForegroundColor Green
Write-Host "=" * 50

# Define patterns of obsolete files that can be safely removed
$ObsoletePatterns = @(
    # Old test scripts that are now replaced by unified versions
    "test-production-purchase.js",
    "test-jbalwikobra-payment-flow.js", 
    "debug-production-purchase-flow.js",
    "e2e-test-development.js",
    "browser-e2e-test.js",
    "production-e2e-test.js",
    "quick-diagnostic.js",
    "debug-payment-redirect.js",
    "test-direct-payment-response.js",
    "test-enhanced-payment-flow.js",
    "production-diagnosis.js",
    "quick-production-api-test.js",
    "test-payment-simple.js",
    "test-production-rental.js",
    
    # Terminal test scripts (replaced by unified-payment-test.ps1)
    "terminal-e2e-test.ps1",
    "quick-test.ps1",
    
    # Old debug/diagnosis scripts
    "debug-*.js",
    "test-*-debug.js",
    "comprehensive-debug.js",
    
    # Temporary test files
    "temp-*.js",
    "tmp-*.js",
    "*-temp.js",
    "*-tmp.js"
)

# Files to keep (important ones)
$KeepFiles = @(
    "unified-payment-test.ps1",
    "unified-browser-test.js", 
    "src/utils/paymentTestingUtils.ts",
    "src/config/paymentMethodConfig.ts"
)

function Get-ObsoleteFiles {
    $obsoleteFiles = @()
    
    foreach ($pattern in $ObsoletePatterns) {
        $files = Get-ChildItem -Path . -Name $pattern -ErrorAction SilentlyContinue
        if ($files) {
            $obsoleteFiles += $files
        }
    }
    
    # Filter out files we want to keep
    $filteredFiles = $obsoleteFiles | Where-Object { 
        $file = $_
        -not ($KeepFiles | Where-Object { $file -like "*$_*" })
    }
    
    return $filteredFiles
}

function Show-FileAnalysis {
    param([array]$Files)
    
    if ($Files.Count -eq 0) {
        Write-Host "✅ No obsolete files found!" -ForegroundColor Green
        return
    }
    
    Write-Host "`n📊 Found $($Files.Count) potentially obsolete files:" -ForegroundColor Yellow
    
    foreach ($file in $Files) {
        $size = (Get-Item $file -ErrorAction SilentlyContinue).Length
        $sizeKB = [math]::Round($size / 1KB, 1)
        $lastModified = (Get-Item $file -ErrorAction SilentlyContinue).LastWriteTime
        
        Write-Host "  📄 $file" -ForegroundColor White
        Write-Host "      Size: $sizeKB KB | Modified: $($lastModified.ToString('yyyy-MM-dd'))" -ForegroundColor Gray
    }
}

function Remove-ObsoleteFiles {
    param([array]$Files, [bool]$Interactive)
    
    $removed = 0
    $skipped = 0
    
    foreach ($file in $Files) {
        if ($Interactive) {
            $choice = Read-Host "`nRemove '$file'? (y/N/a=all/q=quit)"
            
            switch ($choice.ToLower()) {
                'q' { 
                    Write-Host "❌ Cleanup cancelled by user" -ForegroundColor Yellow
                    return 
                }
                'a' {
                    $Interactive = $false
                    # Fall through to remove
                }
                'y' {
                    # Remove this file
                }
                default {
                    Write-Host "⏭️  Skipped: $file" -ForegroundColor Yellow
                    $skipped++
                    continue
                }
            }
        }
        
        try {
            Remove-Item $file -Force
            Write-Host "🗑️  Removed: $file" -ForegroundColor Green
            $removed++
        } catch {
            Write-Host "❌ Failed to remove: $file - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n📈 Cleanup Summary:" -ForegroundColor Cyan
    Write-Host "  Removed: $removed files" -ForegroundColor Green
    Write-Host "  Skipped: $skipped files" -ForegroundColor Yellow
}

function Show-CleanupPlan {
    Write-Host "`n🎯 Cleanup Plan:" -ForegroundColor Cyan
    Write-Host "  ✅ Keep unified-payment-test.ps1 (comprehensive terminal testing)" -ForegroundColor Green
    Write-Host "  ✅ Keep unified-browser-test.js (comprehensive browser testing)" -ForegroundColor Green
    Write-Host "  ✅ Keep src/utils/paymentTestingUtils.ts (shared utilities)" -ForegroundColor Green
    Write-Host "  ✅ Keep src/config/paymentMethodConfig.ts (centralized config)" -ForegroundColor Green
    Write-Host "  ❌ Remove old individual test scripts" -ForegroundColor Red
    Write-Host "  ❌ Remove debug scripts" -ForegroundColor Red
    Write-Host "  ❌ Remove temporary files" -ForegroundColor Red
}

# Main execution
Show-CleanupPlan

$obsoleteFiles = Get-ObsoleteFiles
Show-FileAnalysis -Files $obsoleteFiles

if ($obsoleteFiles.Count -eq 0) {
    exit 0
}

if ($DryRun) {
    Write-Host "`n🔍 DRY RUN - No files will be removed" -ForegroundColor Blue
    Write-Host "Run without -DryRun to actually remove files" -ForegroundColor Blue
    exit 0
}

$totalSize = ($obsoleteFiles | ForEach-Object { 
    (Get-Item $_ -ErrorAction SilentlyContinue).Length 
} | Measure-Object -Sum).Sum

$totalSizeKB = [math]::Round($totalSize / 1KB, 1)

Write-Host "`n💾 Total space to free: $totalSizeKB KB" -ForegroundColor Cyan

if (-not $Interactive) {
    $confirm = Read-Host "`nProceed with cleanup? (y/N)"
    if ($confirm.ToLower() -ne 'y') {
        Write-Host "❌ Cleanup cancelled" -ForegroundColor Yellow
        exit 0
    }
}

Remove-ObsoleteFiles -Files $obsoleteFiles -Interactive $Interactive

Write-Host "`n🎉 Cleanup completed!" -ForegroundColor Green
Write-Host "`n💡 Usage tips:" -ForegroundColor Blue
Write-Host "  - Use unified-payment-test.ps1 for all terminal testing" -ForegroundColor Blue
Write-Host "  - Use unified-browser-test.js for all browser testing" -ForegroundColor Blue
Write-Host "  - Check src/utils/paymentTestingUtils.ts for shared functions" -ForegroundColor Blue
