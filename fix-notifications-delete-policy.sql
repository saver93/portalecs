-- Verifica e correggi le policy RLS per la tabella notifications

-- Prima verifica le policy esistenti
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'notifications';

-- Elimina le policy esistenti che potrebbero causare problemi
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Ricrea le policy corrette

-- 1. Gli utenti possono vedere solo le proprie notifiche
CREATE POLICY "Users can view own notifications" ON notifications
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Gli utenti possono aggiornare solo le proprie notifiche (per marcare come lette)
CREATE POLICY "Users can update own notifications" ON notifications
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Gli utenti possono eliminare solo le proprie notifiche
CREATE POLICY "Users can delete own notifications" ON notifications
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Permetti l'inserimento di notifiche (per il sistema/admin)
-- Questa policy è più permissiva per permettere ai trigger di inserire notifiche
CREATE POLICY "Anyone can insert notifications" ON notifications
FOR INSERT 
WITH CHECK (true);

-- Verifica che RLS sia abilitato
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Test: conta le notifiche per verificare l'accesso
SELECT COUNT(*) as total_notifications FROM notifications;

-- Test: verifica che l'utente corrente possa vedere solo le sue notifiche
SELECT 
  COUNT(*) as my_notifications,
  auth.uid() as current_user_id
FROM notifications 
WHERE user_id = auth.uid();

-- Se hai problemi, puoi temporaneamente disabilitare RLS per debug (NON FARE IN PRODUZIONE!)
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Per vedere cosa succede quando provi a cancellare:
-- Questo ti mostrerà se ci sono trigger o constraint che impediscono la cancellazione
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'notifications'::regclass;

-- Verifica se ci sono trigger sulla tabella
SELECT 
  tgname AS trigger_name,
  tgtype AS trigger_type,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'notifications'::regclass
AND NOT tgisinternal;
