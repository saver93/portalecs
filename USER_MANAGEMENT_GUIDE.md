# 🔐 Gestione Utenti e Password - Guida Completa

## Nuove Funzionalità Implementate

### 1. **Admin - Gestione Completa Utenti**
Gli amministratori ora possono:
- ✅ **Creare** nuovi utenti direttamente (senza inviti)
- ✅ **Modificare** utenti esistenti:
  - Nome completo
  - Ruolo (Staff/Manager/Admin)
  - Punto vendita assegnato
  - Password (con limitazioni - vedi note)
- ✅ **Eliminare** utenti (tranne se stessi)

### 2. **Tutti gli Utenti - Gestione Profilo**
Tutti gli utenti (Admin, Manager, Staff) possono:
- ✅ Accedere alla pagina **Profilo** dal menu
- ✅ Modificare il proprio nome completo
- ✅ Cambiare la propria password
- ✅ Visualizzare le proprie informazioni (email, ruolo, punto vendita)

### 3. **Admin - Gestione Richieste Risorse**
Gli amministratori ora possono:
- ✅ **Eliminare** qualsiasi richiesta di risorse
- ✅ Approvare/rifiutare richieste in attesa
- ✅ Visualizzare richieste di tutti i punti vendita
- ✅ Filtrare per stato, urgenza e location
- ✅ Stampare liste e richieste singole

### 4. **Tutti gli Utenti - Stampa Richieste**
Tutti gli utenti possono:
- ✅ **Stampare lista** completa delle richieste (con filtri applicati)
- ✅ **Stampare richiesta singola** con tutti i dettagli
- ✅ Salvare come PDF invece di stampare
- ✅ Vista ottimizzata per la stampa

## 📋 Come Usare le Nuove Funzionalità

### Per gli Admin - Modificare un Utente

1. Vai su **Gestione Utenti**
2. Clicca sull'icona **Modifica** (matita) accanto all'utente
3. Nel popup puoi modificare:
   - Nome completo
   - Ruolo
   - Punto vendita
   - Password (opzionale)
4. Clicca **Salva Modifiche**

### Per Tutti - Cambiare la Propria Password

1. Clicca su **Profilo** nel menu di navigazione
2. Nella sezione **Cambia Password**:
   - Inserisci la nuova password (minimo 8 caratteri)
   - Conferma la nuova password
3. Clicca **Cambia Password**

## 🛠️ Configurazione Necessaria

### Policy RLS da Aggiornare

Esegui questo script nel **SQL Editor** di Supabase:

```sql
-- Elimina la policy esistente
DROP POLICY IF EXISTS "Only admins can update users" ON users;

-- Crea la nuova policy per permettere modifiche
CREATE POLICY "Users can update own profile or admins can update any" ON users
FOR UPDATE USING (
  auth.uid() = id OR 
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
)
WITH CHECK (
  auth.uid() = id OR 
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
```

## ⚠️ Note Importanti

### Cambio Password da Admin
- Gli admin possono tentare di cambiare la password di altri utenti
- **Limitazione**: Supabase richiede privilegi speciali (Service Role Key) per questa operazione
- Se il cambio password da admin fallisce, l'utente dovrà cambiare la password autonomamente dal proprio profilo

### Sicurezza
- Un admin non può modificare il proprio ruolo (per evitare di rimuoversi i privilegi per errore)
- Un admin non può eliminare se stesso
- Le password devono essere di almeno 8 caratteri
- Si consiglia di usare password complesse con lettere, numeri e simboli

### Punto Vendita
- Gli utenti senza punto vendita assegnato vedranno "-" nella tabella
- Il punto vendita può essere assegnato/modificato solo dagli admin

## 📁 File Modificati/Creati

1. **`/src/app/users/page.tsx`** - Aggiunta funzionalità di modifica utenti
2. **`/src/app/profile/page.tsx`** - Nuova pagina profilo per tutti gli utenti
3. **`/src/components/Navbar.tsx`** - Aggiunto link al profilo nel menu
4. **`update-user-policies.sql`** - Script per aggiornare le policy RLS

## 🚀 Prossimi Passi Consigliati

1. **Reset Password via Email**: Implementare funzionalità di recupero password
2. **Upload Foto Profilo**: Permettere agli utenti di caricare una foto profilo
3. **Log Attività**: Tracciare le modifiche fatte agli utenti
4. **Notifiche**: Inviare email quando un admin modifica un account
5. **2FA**: Implementare autenticazione a due fattori per maggiore sicurezza

## 💡 Suggerimenti

- Crea password sicure e uniche per ogni utente
- Assegna i ruoli appropriati (principio del minimo privilegio)
- Mantieni aggiornati i punti vendita assegnati
- Fai backup regolari del database
- Monitora gli accessi e le modifiche degli admin
