@echo off
echo ========================================
echo   PULIZIA FILE DA GITHUB
echo ========================================
echo.

REM Rimuovi i file di deployment Aruba
git rm -f aruba-vps-install.sh.deleted 2>nul
git rm -f deploy-aruba.sh.deleted 2>nul
git rm -f ARUBA_*.md 2>nul

REM Rimuovi script di test vecchi
git rm -f test-setup.bat 2>nul
git rm -f test-setup-v2.bat 2>nul
git rm -f test-notifications.bat 2>nul

REM Rimuovi file di fix temporanei
git rm -f FIX_*.md 2>nul
git rm -f restore-original-policy.sql 2>nul

REM Rimuovi file di deployment duplicati
git rm -f deploy-functions-npx.* 2>nul
git rm -f DEPLOY_GUIDE.md 2>nul
git rm -f DEPLOY_GUIDE_UPDATED.md 2>nul
git rm -f DEPLOYMENT_GUIDE_COMPLETE.md 2>nul

REM Rimuovi altri file non necessari
git rm -f ecosystem.config.js 2>nul
git rm -f nginx-portale.conf 2>nul
git rm -f .supabase-project-id.txt 2>nul
git rm -f print-styles-examples.css 2>nul
git rm -f sample-data.sql 2>nul
git rm -f install-supabase-*.bat 2>nul

REM Mostra cosa verrà rimosso
echo.
echo File che verranno rimossi da GitHub:
git status --short

echo.
echo Vuoi procedere con la rimozione? (Ctrl+C per annullare)
pause

REM Commit e push
git commit -m "Pulizia: rimossi file di deployment e test non necessari"
git push

echo.
echo ========================================
echo   PULIZIA COMPLETATA!
echo ========================================
pause
