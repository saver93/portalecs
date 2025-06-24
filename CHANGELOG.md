# 📋 Changelog - Portale Aziendale

## [1.3.2] - 2024-01-24

### 🎉 Nuove Funzionalità

#### Stampa Richieste Risorse (Tutti gli utenti)
- **Stampa lista completa**: Pulsante per stampare tutte le richieste filtrate
- **Stampa richiesta singola**: Icona stampa per ogni richiesta con vista dettagliata
- **Layout ottimizzato**: CSS dedicato per una stampa pulita e professionale
- **Intestazioni automatiche**: Data e ora di stampa incluse automaticamente

### 🔧 Miglioramenti

- Aggiunto CSS `@media print` per ottimizzare il layout di stampa
- Vista modale per dettagli richiesta singola prima della stampa
- Icone e tooltip intuitivi per le azioni
- Nascosti elementi non necessari durante la stampa

### 🔧 Bug Fix

- **Risolto**: Preview stampa singola richiesta mostrava anche lista e dashboard
- **Fix**: Aggiunta classe `printing-single-request` al body durante stampa
- **Migliorato**: Isolamento completo del modal durante la stampa

### 📁 File Modificati

- `resources/page.tsx` - Aggiunta funzionalità di stampa e fix isolamento modal
- `globals.css` - Aggiunti stili CSS per la stampa e fix preview
- `PRINT_REQUESTS_GUIDE.md` - Guida completa sulla stampa
- `PRINT_SINGLE_FIX.md` - Documentazione fix stampa singola

---

## [1.3.1] - 2024-01-24

### 🎉 Nuove Funzionalità

#### Eliminazione Richieste Risorse (Admin)
- **Pulsante elimina**: Gli admin ora possono eliminare definitivamente le richieste
- **Conferma sicurezza**: Popup di conferma prima dell'eliminazione
- **Icone intuitive**: Uso di icone per approvare, rifiutare ed eliminare
- **Policy dedicate**: Solo gli admin possono eliminare richieste

### 🔧 Miglioramenti

- Riorganizzata la colonna azioni nella tabella richieste
- Aggiunti tooltip alle icone per maggiore chiarezza
- Migliorata la gestione degli errori durante l'eliminazione

### 📁 Nuovi File

- `delete-requests-policy.sql` - Policy per abilitare eliminazione admin
- `DELETE_REQUESTS_GUIDE.md` - Guida completa sulla funzionalità

---

## [1.3.0] - 2024-01-24

### 🎉 Nuove Funzionalità

#### Gestione Completa Veicoli
- **Creazione veicoli**: Nuova pagina per aggiungere veicoli al parco auto
- **Modifica veicoli**: Possibilità di modificare tutti i dati del veicolo
- **Eliminazione veicoli**: Rimozione sicura con conferma
- **Gestione documenti**: Sistema completo per caricare, visualizzare e gestire documenti
  - Upload multiplo di documenti (PDF, immagini, Word)
  - Categorizzazione per tipo (Libretto, Assicurazione, etc.)
  - Download e visualizzazione diretta
  - Eliminazione documenti

### 🔧 Fix

- Risolto errore 404 sui link "Modifica" e "Documenti" nella pagina veicoli
- Creata struttura corretta delle route dinamiche Next.js

### 📁 Nuovi File

- `vehicles/new/page.tsx` - Pagina creazione nuovo veicolo
- `vehicles/[id]/edit/page.tsx` - Pagina modifica veicolo
- `vehicles/[id]/documents/page.tsx` - Pagina gestione documenti
- `STORAGE_SETUP_GUIDE.md` - Guida configurazione storage Supabase
- `storage-setup.sql` - Script configurazione storage

---

## [1.2.0] - 2024-01-24

### 🎉 Nuove Funzionalità

#### Gestione Utenti Avanzata (Admin)
- **Creazione diretta utenti**: Gli admin ora possono creare utenti direttamente dal portale senza dover inviare inviti email
- **Modifica utenti**: Possibilità di modificare nome, ruolo e punto vendita degli utenti esistenti
- **Reset password**: Gli admin possono tentare di resettare la password degli utenti (con limitazioni tecniche)
- **Eliminazione utenti**: Rimozione sicura degli utenti non più attivi

#### Pagina Profilo Personale
- **Nuova sezione Profilo**: Accessibile a tutti gli utenti dal menu principale
- **Cambio password self-service**: Ogni utente può cambiare la propria password
- **Modifica dati personali**: Possibilità di aggiornare il proprio nome
- **Visualizzazione info account**: Email, ruolo e punto vendita assegnato

#### Gestione Punti Vendita (Admin)
- **CRUD completo**: Creazione, modifica ed eliminazione punti vendita
- **Interfaccia intuitiva**: Vista a griglia con icone e azioni rapide
- **Gestione indirizzi**: Campo opzionale per l'indirizzo fisico

### 🔧 Miglioramenti

#### Interfaccia Utente
- **Navbar aggiornata**: Aggiunto link al profilo per tutti gli utenti
- **Icone distintive**: Icone diverse per admin, manager e staff
- **Modal migliorati**: Form più chiari per creazione e modifica
- **Feedback utente**: Messaggi di errore più descrittivi

#### Sicurezza
- **Policy RLS aggiornate**: Nuove policy per permettere la creazione e modifica utenti
- **Validazione password**: Minimo 8 caratteri con suggerimenti per password sicure
- **Protezione ruoli**: Un admin non può modificare il proprio ruolo
- **Controlli eliminazione**: Un admin non può eliminare se stesso

### 📝 Modifiche Tecniche

#### Database
- Nuove policy RLS per INSERT e UPDATE sulla tabella users
- Funzioni SQL opzionali per gestione utenti avanzata

#### Componenti React
- `users/page.tsx`: Aggiunta gestione completa CRUD utenti
- `profile/page.tsx`: Nuova pagina per gestione profilo personale
- `locations/page.tsx`: Nuova pagina per gestione punti vendita
- `Navbar.tsx`: Aggiunto link profilo e punti vendita

### 🐛 Bug Fix
- Risolto errore "row-level security policy" nella creazione utenti
- Gestione corretta degli errori per email duplicate
- Migliorata la gestione degli stati nei form

### 📚 Documentazione
- **USER_MANAGEMENT_GUIDE.md**: Guida completa per la gestione utenti
- **SETUP_GUIDE.md**: Guida rapida per il setup iniziale
- **README.md**: Aggiornato con le nuove funzionalità
- Script SQL documentati per risolvere problemi comuni

---

## [1.1.0] - 2024-01-23

### 🎉 Versione Iniziale
- Sistema di autenticazione con 3 ruoli
- Dashboard con statistiche
- Gestione richieste risorse
- Gestione parco auto
- Sistema di notifiche base

---

## 🔮 Prossime Release (Roadmap)

### [1.3.0] - Pianificata
- [ ] Sistema di notifiche email automatiche
- [ ] Reset password via email
- [ ] Upload foto profilo
- [ ] Export dati in Excel/PDF

### [1.4.0] - Futura
- [ ] App mobile companion
- [ ] Integrazione calendario
- [ ] Report avanzati con grafici
- [ ] Sistema di backup automatico
- [ ] Autenticazione a due fattori (2FA)
