-- Verifica che le policy siano state create correttamente

-- 1. Mostra tutte le policy sulla tabella notifications
SELECT 
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'notifications'
ORDER BY policyname;

-- 2. Verifica il tuo user_id corrente
SELECT 
  auth.uid() as my_user_id,
  email
FROM auth.users 
WHERE id = auth.uid();

-- 3. Conta le tue notifiche
SELECT 
  COUNT(*) as my_notifications_count,
  COUNT(CASE WHEN read = false THEN 1 END) as unread_count
FROM notifications 
WHERE user_id = auth.uid();

-- 4. TEST: Prova a inserire una notifica di test
INSERT INTO notifications (user_id, type, title, message, metadata)
VALUES (
  auth.uid(), 
  'info', 
  'Test Notifica', 
  'Questa è una notifica di test per verificare il sistema',
  '{"test": true}'::jsonb
)
RETURNING id, title, created_at;

-- 5. TEST: Prova a cancellare la notifica di test appena creata
DELETE FROM notifications 
WHERE user_id = auth.uid() 
  AND metadata->>'test' = 'true'
RETURNING id, title;

-- 6. Se tutto funziona, il problema era nelle policy!
-- Ora le notifiche dovrebbero cancellarsi correttamente dal frontend
