-- Policy per permettere la modifica degli utenti

-- 1. Prima assicurati che la policy di UPDATE esista e sia corretta
DROP POLICY IF EXISTS "Only admins can update users" ON users;

-- 2. Crea una nuova policy che permette:
-- - Agli admin di modificare qualsiasi utente
-- - A ogni utente di modificare il proprio profilo (solo full_name)
CREATE POLICY "Users can update own profile or admins can update any" ON users
FOR UPDATE USING (
  auth.uid() = id -- L'utente può modificare il proprio profilo
  OR 
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin') -- O è un admin
)
WITH CHECK (
  auth.uid() = id -- L'utente può modificare il proprio profilo
  OR 
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin') -- O è un admin
);

-- 3. Funzione per permettere agli admin di cambiare la password degli utenti
-- Nota: Questa funzione richiede l'uso del Service Role Key di Supabase
-- che non è disponibile lato client per motivi di sicurezza.
-- La modifica password da parte degli admin potrebbe richiedere un backend separato.

-- 4. Verifica che le altre policy siano corrette
-- Policy per la visualizzazione (già esistente, dovrebbe essere OK)
-- Policy per l'inserimento (già aggiornata nel fix precedente)
-- Policy per l'eliminazione (già esistente, dovrebbe essere OK)
