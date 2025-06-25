-- Tabella per le impostazioni utente
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Notifiche
  email_notifications_enabled BOOLEAN DEFAULT true,
  push_notifications_enabled BOOLEAN DEFAULT false,
  
  -- Email
  notification_email VARCHAR(255),
  digest_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly', 'never')),
  
  -- Sicurezza
  session_timeout INTEGER DEFAULT 30 CHECK (session_timeout >= 5 AND session_timeout <= 120),
  two_factor_enabled BOOLEAN DEFAULT false,
  
  -- Database
  auto_backup_enabled BOOLEAN DEFAULT true,
  
  -- Aspetto
  primary_color VARCHAR(20) DEFAULT 'blue',
  font_size VARCHAR(10) DEFAULT 'normal' CHECK (font_size IN ('small', 'normal', 'large')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Policy RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Gli utenti possono vedere e modificare solo le proprie impostazioni
CREATE POLICY "Users can view own settings" ON user_settings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
FOR DELETE USING (auth.uid() = user_id);

-- Funzione per ottenere o creare le impostazioni di un utente
CREATE OR REPLACE FUNCTION get_or_create_user_settings(p_user_id UUID)
RETURNS user_settings AS $$
DECLARE
  v_settings user_settings;
BEGIN
  -- Prova a ottenere le impostazioni esistenti
  SELECT * INTO v_settings FROM user_settings WHERE user_id = p_user_id;
  
  -- Se non esistono, creale
  IF NOT FOUND THEN
    INSERT INTO user_settings (user_id) VALUES (p_user_id)
    RETURNING * INTO v_settings;
  END IF;
  
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indice per performance
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
