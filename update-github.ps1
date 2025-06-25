# Script PowerShell per aggiornare GitHub con opzioni avanzate

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AGGIORNAMENTO REPOSITORY GITHUB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se git è installato
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERRORE: Git non è installato!" -ForegroundColor Red
    Write-Host "Scarica Git da: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Verifica se siamo in un repository git
if (!(Test-Path .git)) {
    Write-Host "ERRORE: Questa cartella non è un repository Git!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vuoi inizializzare un nuovo repository? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'S' -or $response -eq 's') {
        git init
        Write-Host "Repository inizializzato!" -ForegroundColor Green
        Write-Host ""
        $remoteUrl = Read-Host "Inserisci l'URL del repository GitHub (es: https://github.com/username/repo.git)"
        git remote add origin $remoteUrl
        Write-Host "Remote aggiunto!" -ForegroundColor Green
    } else {
        exit 1
    }
}

# Mostra lo stato corrente
Write-Host "Stato attuale del repository:" -ForegroundColor Yellow
git status --short

# Conta i file modificati
$changes = git status --porcelain | Measure-Object -Line
if ($changes.Lines -eq 0) {
    Write-Host ""
    Write-Host "Nessuna modifica da committare!" -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "Trovate $($changes.Lines) modifiche" -ForegroundColor Yellow
Write-Host ""

# Chiedi se vuole vedere le differenze
Write-Host "Vuoi vedere le differenze? (S/N)" -ForegroundColor Cyan
$showDiff = Read-Host
if ($showDiff -eq 'S' -or $showDiff -eq 's') {
    git diff --stat
    Write-Host ""
    pause
}

# Aggiungi i file
Write-Host "Aggiunta di tutti i file..." -ForegroundColor Yellow
git add .

# Chiedi il messaggio di commit
Write-Host ""
Write-Host "Inserisci il messaggio di commit (o premi INVIO per messaggio automatico):" -ForegroundColor Cyan
$commitMessage = Read-Host

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $date = Get-Date -Format "dd/MM/yyyy HH:mm"
    $commitMessage = "Update del $date - Fix notifiche e miglioramenti UI"
}

# Fai il commit
Write-Host ""
Write-Host "Esecuzione commit..." -ForegroundColor Yellow
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRORE durante il commit!" -ForegroundColor Red
    exit 1
}

# Verifica il branch corrente
$currentBranch = git branch --show-current
Write-Host ""
Write-Host "Branch corrente: $currentBranch" -ForegroundColor Cyan

# Push
Write-Host ""
Write-Host "Push su GitHub..." -ForegroundColor Yellow
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   AGGIORNAMENTO COMPLETATO!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Repository aggiornato con successo!" -ForegroundColor Green
    
    # Mostra l'URL del repository
    $remoteUrl = git remote get-url origin
    if ($remoteUrl) {
        Write-Host "📍 Repository: $remoteUrl" -ForegroundColor Cyan
    }
} else {
    Write-Host ""
    Write-Host "ERRORE durante il push!" -ForegroundColor Red
    Write-Host "Possibili soluzioni:" -ForegroundColor Yellow
    Write-Host "1. Verifica le tue credenziali GitHub" -ForegroundColor Yellow
    Write-Host "2. Assicurati di avere i permessi di scrittura" -ForegroundColor Yellow
    Write-Host "3. Prova: git pull origin $currentBranch --rebase" -ForegroundColor Yellow
}

Write-Host ""
pause
