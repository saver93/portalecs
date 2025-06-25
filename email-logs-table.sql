-- Tabella per log delle email inviate
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  template VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  status VARCHAR(50) DEFAULT 'sent',
  resend_id VARCHAR(255),
  error TEXT,
  metadata JSONB
);

-- Indice per ricerche veloci
CREATE INDEX idx_email_logs_to ON email_logs(to_email);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);

-- Policy RLS per email_logs (solo admin possono vedere)
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view email logs" ON email_logs
FOR SELECT USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

-- Crea un job schedulato per pulire i log vecchi (opzionale)
-- Rimuove log più vecchi di 90 giorni
/*
CREATE OR REPLACE FUNCTION cleanup_old_email_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM email_logs WHERE sent_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
*/