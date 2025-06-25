@echo off
echo ====================================
echo Deploy Edge Functions per Portale Aziendale
echo ====================================
echo.

REM Controlla se Supabase CLI è installato
where supabase >nul 2>1
if %errorlevel% neq 0 (
    echo [ERRORE] Supabase CLI non trovato!
    echo.
    echo Installa con: npm install -g supabase
    echo.
    pause
    exit /b 1
)

echo [OK] Supabase CLI trovato
echo.

REM Chiedi il project ID se non è già linkato
if not exist ".supabase\project-id" (
    set /p PROJECT_ID="Inserisci il tuo Supabase Project ID: "
    echo.
    echo Collegamento al progetto...
    supabase link --project-ref %PROJECT_ID%
    if %errorlevel% neq 0 (
        echo [ERRORE] Impossibile collegare il progetto
        pause
        exit /b 1
    )
)

echo Deploy della funzione send-email...
supabase functions deploy send-email

if %errorlevel% eq 0 (
    echo.
    echo [OK] Deploy completato con successo!
    echo.
    echo Ora devi impostare le variabili d'ambiente:
    echo.
    echo Per Resend:
    echo   supabase secrets set RESEND_API_KEY=your_api_key
    echo.
    echo Per SendGrid:
    echo   supabase secrets set SENDGRID_API_KEY=your_api_key
) else (
    echo.
    echo [ERRORE] Deploy fallito
)

echo.
pause