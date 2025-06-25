-- Tabella per le notifiche
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('request', 'approval', 'rejection', 'vehicle', 'warning', 'info', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  metadata JSONB,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Gli utenti possono vedere solo le proprie notifiche
CREATE POLICY "Users can view own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

-- Policy: Gli utenti possono aggiornare solo le proprie notifiche (per marcare come lette)
CREATE POLICY "Users can update own notifications" ON notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Gli utenti possono eliminare solo le proprie notifiche
CREATE POLICY "Users can delete own notifications" ON notifications
FOR DELETE USING (auth.uid() = user_id);

-- Policy: Il sistema può inserire notifiche per qualsiasi utente
-- (richiede service role key o trigger da database)
CREATE POLICY "System can insert notifications" ON notifications
FOR INSERT WITH CHECK (true);

-- Funzione per creare notifiche (può essere chiamata da trigger)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, metadata, action_url)
  VALUES (p_user_id, p_type, p_title, p_message, p_metadata, p_action_url)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per pulire le notifiche vecchie (opzionale)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  -- Elimina notifiche lette più vecchie di 30 giorni
  DELETE FROM notifications 
  WHERE read = true 
  AND created_at < NOW() - INTERVAL '30 days';
  
  -- Elimina notifiche non lette più vecchie di 90 giorni
  DELETE FROM notifications 
  WHERE read = false 
  AND created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Esempio: Inserisci una notifica di test (sostituisci USER_ID con un ID reale)
-- INSERT INTO notifications (user_id, type, title, message, action_url)
-- VALUES ('USER_ID', 'info', 'Benvenuto!', 'Benvenuto nel portale aziendale', '/dashboard');
