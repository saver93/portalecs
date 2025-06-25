-- Funzione per creare utenti (da eseguire nel SQL Editor di Supabase)

-- Prima elimina la funzione se esiste già
DROP FUNCTION IF EXISTS create_user_with_role;

-- Crea la funzione per creare utenti
CREATE OR REPLACE FUNCTION create_user_with_role(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT,
  user_role TEXT,
  user_location_id UUID DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Importante: esegue con i privilegi del proprietario della funzione
SET search_path = public
AS $$
DECLARE
  new_user_id UUID;
  result json;
BEGIN
  -- Verifica che l'utente corrente sia un admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo gli amministratori possono creare utenti';
  END IF;

  -- Crea l'utente in auth.users
  -- Nota: questa parte deve essere gestita dall'applicazione perché 
  -- non possiamo chiamare auth.signUp da una funzione SQL
  
  -- Per ora, restituiamo solo un messaggio di successo
  -- L'applicazione dovrà prima creare l'utente con signUp,
  -- poi chiamare questa funzione per inserire i dati nella tabella users
  
  result := json_build_object(
    'success', true,
    'message', 'Usa questa funzione dopo aver creato l''utente con auth.signUp'
  );
  
  RETURN result;
END;
$$;

-- Funzione alternativa che inserisce solo nella tabella users
-- (da usare DOPO aver creato l'utente con auth.signUp)
CREATE OR REPLACE FUNCTION insert_user_profile(
  new_user_id UUID,
  user_email TEXT,
  user_full_name TEXT,
  user_role TEXT,
  user_location_id UUID DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Verifica che l'utente corrente sia un admin
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo gli amministratori possono creare profili utente';
  END IF;

  -- Inserisci l'utente nella tabella users
  INSERT INTO users (id, email, full_name, role, location_id)
  VALUES (new_user_id, user_email, user_full_name, user_role, user_location_id);
  
  result := json_build_object(
    'success', true,
    'message', 'Profilo utente creato con successo'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'message', SQLERRM
    );
    RETURN result;
END;
$$;

-- Concedi i permessi per eseguire le funzioni
GRANT EXECUTE ON FUNCTION insert_user_profile TO authenticated;
