# 📚 Guida Git e GitHub per il Portale

## 🚀 Setup Iniziale (solo la prima volta)

### 1. Installa Git
- Windows: Scarica da [git-scm.com](https://git-scm.com/download/win)
- Verifica: `git --version`

### 2. Configura Git
```bash
git config --global user.name "Tuo Nome"
git config --global user.email "tua@email.com"
```

### 3. Crea Repository su GitHub
1. Vai su [github.com](https://github.com)
2. Clicca su "New repository"
3. Nome: `portale-aziendale` (o quello che preferisci)
4. Privato/Pubblico: scegli tu
5. NON inizializzare con README (ce l'hai già)

### 4. Collega il Progetto Locale
```bash
cd C:\Users\spugl\Desktop\portalecs
git init
git remote add origin https://github.com/TUO_USERNAME/portale-aziendale.git
```

## 📤 Aggiornare su GitHub

### Metodo 1: Script Automatico (Consigliato)
Doppio click su uno di questi file:
- `update-github.bat` - Script semplice
- `update-github.ps1` - Script avanzato con più opzioni

### Metodo 2: Comandi Manuali
```bash
# 1. Aggiungi le modifiche
git add .

# 2. Crea il commit
git commit -m "Descrizione delle modifiche"

# 3. Push su GitHub
git push origin main
```

## 📝 Messaggi di Commit Consigliati

### Formato
```
tipo: breve descrizione

- Dettaglio 1
- Dettaglio 2
```

### Tipi comuni:
- `feat:` nuova funzionalità
- `fix:` correzione bug
- `docs:` documentazione
- `style:` modifiche UI/CSS
- `refactor:` refactoring codice
- `test:` aggiunta test
- `chore:` manutenzione

### Esempi:
```bash
git commit -m "feat: aggiunto sistema notifiche real-time"
git commit -m "fix: risolto problema cancellazione notifiche"
git commit -m "style: navbar ridisegnata con glass morphism"
```

## 🔍 Comandi Utili

```bash
# Vedere lo stato
git status

# Vedere la cronologia
git log --oneline

# Vedere le differenze
git diff

# Annullare modifiche locali
git checkout -- nomefile

# Tornare al commit precedente
git reset --hard HEAD~1

# Aggiornare da GitHub
git pull origin main
```

## ⚠️ File Sensibili

Il `.gitignore` protegge automaticamente:
- `.env.local` (credenziali Supabase)
- `node_modules/` (dipendenze)
- `.next/` (build cache)

**MAI** committare:
- Password
- API keys
- File `.env`

## 🆘 Risoluzione Problemi

### "Permission denied"
```bash
# Configura le credenziali
git config --global credential.helper manager
```

### "Repository not found"
- Verifica l'URL: `git remote -v`
- Cambia URL: `git remote set-url origin NUOVO_URL`

### "Rejected - non-fast-forward"
```bash
# Sincronizza prima di pushare
git pull origin main --rebase
git push
```

### "Large files detected"
File > 100MB non sono permessi. Usa:
```bash
# Rimuovi dal commit
git rm --cached nomefile_grande
# Aggiungi a .gitignore
echo "nomefile_grande" >> .gitignore
```

## 📊 Workflow Consigliato

1. **Ogni mattina**: `git pull` per sincronizzare
2. **Durante il lavoro**: commit frequenti con messaggi chiari
3. **Fine giornata**: `git push` per salvare su GitHub
4. **Settimanale**: review del codice e pulizia

## 🏷️ Versionamento

Quando rilasci una versione:
```bash
# Crea un tag
git tag -a v2.1.0 -m "Versione 2.1.0 - Sistema notifiche completo"
git push origin v2.1.0
```

## 🔐 Backup

GitHub funge da backup, ma considera anche:
- Backup locale periodico
- Export del database Supabase
- Documentazione delle configurazioni

---

**Suggerimento**: Usa `update-github.bat` per aggiornamenti rapidi giornalieri!
