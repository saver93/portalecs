# 🚀 Guida Rapida - Setup Completo del Portale

## 1. Configurazione Database (Supabase)

### A. Schema Database
1. Vai nel **SQL Editor** di Supabase
2. Esegui il contenuto del file `database-schema.sql`

### B. Fix Policy per Creazione Utenti
1. Sempre nel **SQL Editor**
2. Esegui questo script:

```sql
-- Elimina la policy esistente
DROP POLICY IF EXISTS "Only admins can insert users" ON users;

-- Crea la nuova policy
CREATE POLICY "Users can insert own profile or admins can insert any" ON users
FOR INSERT WITH CHECK (
  auth.uid() = id OR 
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
```

### C. Inserisci Dati di Esempio (Opzionale)
1. Esegui le query nel file `sample-data.sql` per creare punti vendita di esempio

## 2. Crea il Primo Admin

### Metodo 1: Tramite Supabase Dashboard
1. Vai in **Authentication** > **Users**
2. Clicca **Add user** > **Create new user**
3. Inserisci email e password
4. Dopo la creazione, copia l'UUID dell'utente
5. Vai nel **SQL Editor** ed esegui:

```sql
INSERT INTO users (id, email, full_name, role, location_id) VALUES
('INCOLLA-UUID-QUI', 'admin@azienda.it', 'Nome Admin', 'admin', NULL);
```

### Metodo 2: Registrazione + Promozione
1. Registrati normalmente dal portale
2. Vai nel **SQL Editor** di Supabase
3. Esegui:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'tua-email@esempio.it';
```

## 3. Utilizzo del Portale

### Gestione Punti Vendita (solo Admin)
1. Login come admin
2. Vai su **Punti Vendita** nel menu
3. Aggiungi tutti i punti vendita necessari

### Creazione Utenti (solo Admin)
1. Vai su **Gestione Utenti**
2. Clicca **Crea Utente**
3. Compila tutti i campi:
   - Email (deve essere unica)
   - Password (minimo 8 caratteri)
   - Nome completo
   - Ruolo (Staff/Manager/Admin)
   - Punto vendita (opzionale)

### Gestione Richieste Risorse
- **Staff**: può creare richieste per il proprio punto vendita
- **Manager**: può approvare/rifiutare richieste
- **Admin**: accesso completo

### Gestione Parco Auto
- Tutti possono visualizzare i veicoli
- Solo gli **Admin** possono aggiungere/modificare veicoli

## 4. Troubleshooting

### Errore "row-level security policy"
- Esegui lo script in `fix-rls-policy.sql`

### Errore "Email già registrata"
- Verifica che l'email non sia già presente nel sistema
- Controlla in Supabase Dashboard > Authentication > Users

### Utente creato ma non può fare login
- Verifica che l'utente sia presente sia in auth.users che nella tabella users
- Controlla che email e password siano corretti

## 5. Note di Sicurezza

⚠️ **IMPORTANTE**:
- Non condividere mai le chiavi Supabase
- Mantieni sempre attive le Row Level Security (RLS)
- Usa password complesse per gli account admin
- Fai backup regolari del database

## 6. Prossimi Passi

✅ Schema database configurato
✅ Gestione utenti diretta (senza inviti)
✅ Gestione punti vendita
🔲 Notifiche email per approvazioni
🔲 Report e statistiche
🔲 App mobile
