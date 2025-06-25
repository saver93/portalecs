@echo off
echo ========================================
echo   PULIZIA FILE INUTILI PORTALE
echo ========================================
echo.

echo Eliminazione script Aruba...
del /f /q aruba-vps-install.sh 2>nul
del /f /q aruba-vps-install.sh.deleted 2>nul
del /f /q deploy-aruba.sh 2>nul
del /f /q deploy-aruba.sh.deleted 2>nul
del /f /q ARUBA_VPS_DEPLOYMENT_GUIDE.md 2>nul
del /f /q ARUBA_VPS_STEP_BY_STEP.md 2>nul
del /f /q ARUBA_COST_OPTIMIZATION.md 2>nul

echo Eliminazione script deployment duplicati...
del /f /q deploy-functions-npx.bat 2>nul
del /f /q deploy-functions-npx.ps1 2>nul
del /f /q DEPLOY_GUIDE.md 2>nul
del /f /q DEPLOY_GUIDE_UPDATED.md 2>nul
del /f /q DEPLOYMENT_GUIDE_COMPLETE.md 2>nul

echo Eliminazione script test vecchi...
del /f /q test-setup.bat 2>nul
del /f /q test-setup-v2.bat 2>nul
del /f /q test-notifications.bat 2>nul
del /f /q test-email-templates.js 2>nul

echo Eliminazione file fix temporanei...
del /f /q FIX_USER_CREATION_ERROR.md 2>nul
del /f /q FIXES_IMPLEMENTED.md 2>nul
del /f /q PRINT_SINGLE_FIX.md 2>nul
del /f /q restore-original-policy.sql 2>nul

echo Eliminazione file esempio e idee...
del /f /q print-styles-examples.css 2>nul
del /f /q sample-data.sql 2>nul
del /f /q PRINT_FUTURE_IDEAS.md 2>nul
del /f /q NOTIFICATIONS_INTEGRATION_EXAMPLE.md 2>nul
del /f /q EDGE_FUNCTIONS_DEPLOY_GUIDE.md 2>nul

echo Eliminazione script installazione CLI...
del /f /q install-supabase-cli.bat 2>nul
del /f /q install-supabase-scoop.bat 2>nul

echo Eliminazione file specifici non necessari...
del /f /q ecosystem.config.js 2>nul
del /f /q nginx-portale.conf 2>nul
del /f /q .supabase-project-id.txt 2>nul

echo.
echo ========================================
echo   PULIZIA COMPLETATA!
echo ========================================
echo.
echo File importanti mantenuti:
echo - Cartella src/
echo - Cartella src_backup/
echo - Cartella supabase/
echo - File di configurazione principali
echo - Script SQL necessari
echo - Guide principali
echo - Script di avvio
echo.
pause
