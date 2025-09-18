# Environment Files Security Cleanup
Write-Host "🚨 Starting Environment Files Security Cleanup..." -ForegroundColor Red

$filesToRemove = @(
    ".env",
    ".env.local", 
    ".env.development.local"
)

$backupDir = "backup-env-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "📦 Creating backup of environment files..." -ForegroundColor Yellow

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Copy-Item $file "$backupDir\$file" -Force
        Write-Host "Backed up: $file" -ForegroundColor Gray
    }
}

Write-Host "`n🗑️ Removing files with hardcoded secrets..." -ForegroundColor Red

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Removed: $file" -ForegroundColor Yellow
    }
    else {
        Write-Host "Not found: $file" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Security cleanup completed!" -ForegroundColor Green
Write-Host "📁 Backup created in: $backupDir" -ForegroundColor Cyan
Write-Host "⚠️  Next: Configure secrets in Vercel environment variables" -ForegroundColor Yellow
