# Deploy Edge Functions per Portale Aziendale

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Deploy Edge Functions per Portale Aziendale" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Controlla se Supabase CLI è installato
try {
    $null = Get-Command supabase -ErrorAction Stop
    Write-Host "[OK] Supabase CLI trovato" -ForegroundColor Green
} catch {
    Write-Host "[ERRORE] Supabase CLI non trovato!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installa con uno di questi metodi:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase"
    Write-Host "  scoop install supabase"
    Write-Host ""
    Read-Host "Premi ENTER per uscire"
    exit 1
}

Write-Host ""

# Controlla se il progetto è già collegato
if (-not (Test-Path ".supabase\project-id")) {
    $projectId = Read-Host "Inserisci il tuo Supabase Project ID"
    Write-Host ""
    Write-Host "Collegamento al progetto..." -ForegroundColor Yellow
    
    supabase link --project-ref $projectId
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERRORE] Impossibile collegare il progetto" -ForegroundColor Red
        Read-Host "Premi ENTER per uscire"
        exit 1
    }
}

Write-Host "Deploy della funzione send-email..." -ForegroundColor Yellow
supabase functions deploy send-email

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Deploy completato con successo!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ora devi impostare le variabili d'ambiente:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Per Resend:" -ForegroundColor Cyan
    Write-Host "  supabase secrets set RESEND_API_KEY=your_api_key"
    Write-Host ""
    Write-Host "Per SendGrid:" -ForegroundColor Cyan
    Write-Host "  supabase secrets set SENDGRID_API_KEY=your_api_key"
} else {
    Write-Host ""
    Write-Host "[ERRORE] Deploy fallito" -ForegroundColor Red
}

Write-Host ""
Read-Host "Premi ENTER per uscire"