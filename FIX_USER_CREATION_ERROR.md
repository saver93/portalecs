# Risoluzione Errore RLS nella Creazione Utenti

## Il Problema
Quando provi a creare un nuovo utente, ricevi l'errore:
```
new row violates row-level security policy for table "users"
```

Questo accade perché le Row Level Security (RLS) policies di Supabase impediscono l'inserimento di nuovi record nella tabella `users`.

## Soluzioni

### Soluzione 1: Modifica la Policy RLS (CONSIGLIATA - Più Semplice)

1. Vai nel **SQL Editor** di Supabase
2. Esegui questo script:

```sql
-- Elimina la policy esistente
DROP POLICY IF EXISTS "Only admins can insert users" ON users;

-- Crea una nuova policy che permette:
-- 1. Agli admin di inserire utenti
-- 2. Agli utenti di inserire il proprio record durante la registrazione
CREATE POLICY "Users can insert own profile or admins can insert any" ON users
FOR INSERT WITH CHECK (
  auth.uid() = id -- L'utente può inserire il proprio profilo
  OR 
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin') -- O è un admin
);
```

### Soluzione 2: Usa una Funzione SQL (Più Sicura ma Complessa)

1. Vai nel **SQL Editor** di Supabase
2. Esegui lo script nel file `create-user-function.sql`
3. Questa soluzione crea una funzione che bypassa RLS usando `SECURITY DEFINER`

### Soluzione 3: Disabilita Temporaneamente RLS (NON CONSIGLIATA)

⚠️ **ATTENZIONE**: Questa soluzione è solo per test!

```sql
-- Disabilita RLS temporaneamente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Quando hai finito i test, riabilita RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## Verifica

Dopo aver applicato una delle soluzioni:

1. Vai alla pagina **Gestione Utenti** del portale
2. Clicca su "Crea Utente"
3. Compila il form e clicca "Crea"
4. L'utente dovrebbe essere creato senza errori

## Note Importanti

- La **Soluzione 1** è la più semplice e funziona bene per la maggior parte dei casi
- La **Soluzione 2** offre più controllo ma richiede di mantenere la funzione SQL
- **MAI** lasciare RLS disabilitato in produzione!

## File Correlati

- `fix-rls-policy.sql` - Script per correggere le policy RLS
- `create-user-function.sql` - Funzione alternativa per creare utenti
- `src/app/users/page.tsx` - Codice della pagina di gestione utenti
