@echo off
echo ========================================
echo   AGGIORNAMENTO REPOSITORY GITHUB
echo ========================================
echo.

REM Verifica stato
echo Controllo stato Git...
git status

echo.
echo Vuoi continuare con l'aggiornamento? (Ctrl+C per annullare)
pause

REM Aggiungi tutti i file
echo.
echo Aggiunta file...
git add .

REM Mostra cosa verrà committato
echo.
echo File da committare:
git status --short

echo.
set /p COMMIT_MSG="Inserisci il messaggio di commit: "

REM Commit
git commit -m "%COMMIT_MSG%"

REM Push
echo.
echo Push su GitHub...
git push

echo.
echo ========================================
echo   AGGIORNAMENTO COMPLETATO!
echo ========================================
echo.
echo Repository aggiornato con successo!
echo.
pause
