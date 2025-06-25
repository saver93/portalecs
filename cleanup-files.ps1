# Script di pulizia file inutili - Portale Aziendale
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PULIZIA FILE INUTILI PORTALE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Lista dei file da eliminare
$filesToDelete = @(
    # Script Aruba
    "aruba-vps-install.sh",
    "aruba-vps-install.sh.deleted",
    "deploy-aruba.sh",
    "deploy-aruba.sh.deleted",
    "ARUBA_VPS_DEPLOYMENT_GUIDE.md",
    "ARUBA_VPS_STEP_BY_STEP.md",
    "ARUBA_COST_OPTIMIZATION.md",
    
    # Script deployment duplicati
    "deploy-functions-npx.bat",
    "deploy-functions-npx.ps1",
    "DEPLOY_GUIDE.md",
    "DEPLOY_GUIDE_UPDATED.md",
    "DEPLOYMENT_GUIDE_COMPLETE.md",
    
    # Script test vecchi
    "test-setup.bat",
    "test-setup-v2.bat",
    "test-notifications.bat",
    "test-email-templates.js",
    
    # File fix temporanei
    "FIX_USER_CREATION_ERROR.md",
    "FIXES_IMPLEMENTED.md",
    "PRINT_SINGLE_FIX.md",
    "restore-original-policy.sql",
    
    # File esempio e idee
    "print-styles-examples.css",
    "sample-data.sql",
    "PRINT_FUTURE_IDEAS.md",
    "NOTIFICATIONS_INTEGRATION_EXAMPLE.md",
    "EDGE_FUNCTIONS_DEPLOY_GUIDE.md",
    
    # Script installazione CLI
    "install-supabase-cli.bat",
    "install-supabase-scoop.bat",
    
    # File specifici non necessari
    "ecosystem.config.js",
    "nginx-portale.conf",
    ".supabase-project-id.txt"
)

$deletedCount = 0
$totalSize = 0

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        $fileInfo = Get-Item $file
        $fileSize = $fileInfo.Length
        Remove-Item $file -Force
        Write-Host "✓ Eliminato: $file" -ForegroundColor Green
        Write-Host "  (Liberati: $([math]::Round($fileSize/1KB, 2)) KB)" -ForegroundColor Gray
        $deletedCount++
        $totalSize += $fileSize
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RIEPILOGO PULIZIA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "File eliminati: $deletedCount" -ForegroundColor Yellow
Write-Host "Spazio liberato: $([math]::Round($totalSize/1MB, 2)) MB" -ForegroundColor Yellow
Write-Host ""
Write-Host "File e cartelle mantenuti:" -ForegroundColor Green
Write-Host "✓ src/ - Codice sorgente" -ForegroundColor Green
Write-Host "✓ src_backup/ - Backup del codice" -ForegroundColor Green
Write-Host "✓ supabase/ - Configurazioni Supabase" -ForegroundColor Green
Write-Host "✓ node_modules/ - Dipendenze" -ForegroundColor Green
Write-Host "✓ .next/ - Build cache" -ForegroundColor Green
Write-Host "✓ File di configurazione principali" -ForegroundColor Green
Write-Host "✓ Script SQL necessari" -ForegroundColor Green
Write-Host "✓ Guide principali (README, SETUP, etc.)" -ForegroundColor Green
Write-Host ""
Write-Host "Pulizia completata!" -ForegroundColor Green
Write-Host ""
Read-Host "Premi INVIO per chiudere"
