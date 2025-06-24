@echo off
echo ========================================
echo   Portale Aziendale v2.0 - Avvio
echo ========================================
echo.

REM Controlla se node_modules esiste
if not exist "node_modules" (
    echo [*] Installazione dipendenze...
    call npm install
)

REM Controlla se .env.local esiste
if not exist ".env.local" (
    echo [!] File .env.local non trovato!
    echo [*] Creazione template .env.local...
    
    (
    echo # Supabase Configuration
    echo NEXT_PUBLIC_SUPABASE_URL=your-project-url
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    echo.
    echo # Optional: Enable debug mode
    echo # NEXT_PUBLIC_DEBUG=true
    ) > .env.local
    
    echo [OK] Template creato. Configura le variabili in .env.local
    pause
    exit /b 1
)

echo [OK] Configurazione completata
echo [*] Avvio server di sviluppo...
echo ========================================
echo.

call npm run dev