-- SOLUZIONE ALTERNATIVA PIÙ SEMPLICE
-- Esegui questo script nel SQL Editor di Supabase per risolvere il problema RLS

-- Opzione 1: Modifica la policy esistente per permettere la creazione durante il signup
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

-- Opzione 2: Se preferisci mantenere il controllo stretto, usa un trigger
-- Questo trigger crea automaticamente un record nella tabella users quando
-- un nuovo utente si registra

-- Prima elimina il trigger se esiste
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Crea la funzione che gestirà i nuovi utenti
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Inserisci automaticamente nella tabella users quando un utente si registra
  INSERT INTO public.users (id, email, full_name, role, location_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'staff', -- Ruolo di default
    NULL -- Nessun punto vendita assegnato di default
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crea il trigger (commentato di default - decommenta se vuoi usarlo)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- NOTA: Consiglio di usare l'Opzione 1 (modificare la policy) perché è più semplice
-- e ti permette di controllare meglio i dati inseriti dalla tua applicazione.
