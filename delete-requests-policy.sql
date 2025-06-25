-- Policy per permettere agli admin di eliminare le richieste risorse

-- 1. Prima verifica se esiste già una policy per DELETE
-- Se esiste, eliminala
DROP POLICY IF EXISTS "Only admins can delete resource requests" ON resource_requests;

-- 2. Crea la nuova policy per permettere solo agli admin di eliminare
CREATE POLICY "Only admins can delete resource requests" ON resource_requests
FOR DELETE USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

-- 3. Verifica che le altre policy siano corrette
-- Assicurati che queste policy esistano già, altrimenti creale:

-- Policy per visualizzare le richieste (già esistente nel database-schema.sql)
-- Gli utenti possono vedere le richieste del proprio punto vendita
-- Manager e admin possono vedere tutte le richieste

-- Policy per creare richieste (già esistente)
-- Tutti gli utenti autenticati possono creare richieste

-- Policy per aggiornare richieste (già esistente)
-- Manager e admin possono aggiornare lo stato delle richieste
