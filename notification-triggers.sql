-- Trigger per notifiche automatiche

-- Funzione per notificare cambio stato richiesta
CREATE OR REPLACE FUNCTION notify_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se lo stato è cambiato
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notifica l'utente che ha fatto la richiesta
    IF NEW.status = 'approved' THEN
      INSERT INTO notifications (user_id, type, title, message, metadata, action_url)
      VALUES (
        NEW.requested_by,
        'approval',
        'Richiesta approvata',
        'La tua richiesta di ' || NEW.resource_type || ' è stata approvata',
        jsonb_build_object('request_id', NEW.id),
        '/resources?id=' || NEW.id
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO notifications (user_id, type, title, message, metadata, action_url)
      VALUES (
        NEW.requested_by,
        'rejection',
        'Richiesta rifiutata',
        'La tua richiesta di ' || NEW.resource_type || ' è stata rifiutata',
        jsonb_build_object('request_id', NEW.id),
        '/resources?id=' || NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per cambio stato richiesta
DROP TRIGGER IF EXISTS request_status_change_trigger ON resource_requests;
CREATE TRIGGER request_status_change_trigger
AFTER UPDATE OF status ON resource_requests
FOR EACH ROW
EXECUTE FUNCTION notify_request_status_change();

-- Funzione per notificare nuova richiesta ai manager/admin
CREATE OR REPLACE FUNCTION notify_new_request()
RETURNS TRIGGER AS $$
DECLARE
  manager_record RECORD;
  location_name TEXT;
BEGIN
  -- Ottieni il nome della location
  SELECT name INTO location_name FROM locations WHERE id = NEW.location_id;
  
  -- Notifica tutti i manager e admin
  FOR manager_record IN 
    SELECT id FROM users WHERE role IN ('manager', 'admin')
  LOOP
    INSERT INTO notifications (user_id, type, title, message, metadata, action_url)
    VALUES (
      manager_record.id,
      'request',
      'Nuova richiesta di risorse',
      'Nuova richiesta di ' || NEW.resource_type || ' da ' || COALESCE(location_name, 'location sconosciuta'),
      jsonb_build_object('request_id', NEW.id, 'urgency', NEW.urgency),
      '/resources?id=' || NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per nuova richiesta
DROP TRIGGER IF EXISTS new_request_trigger ON resource_requests;
CREATE TRIGGER new_request_trigger
AFTER INSERT ON resource_requests
FOR EACH ROW
EXECUTE FUNCTION notify_new_request();

-- Funzione per notificare assegnazione veicolo
CREATE OR REPLACE FUNCTION notify_vehicle_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Se il veicolo è stato assegnato a qualcuno
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO notifications (user_id, type, title, message, metadata, action_url)
    VALUES (
      NEW.assigned_to,
      'vehicle',
      'Veicolo assegnato',
      'Ti è stato assegnato il veicolo ' || NEW.license_plate || ' (' || NEW.brand || ' ' || NEW.model || ')',
      jsonb_build_object('vehicle_id', NEW.id, 'license_plate', NEW.license_plate),
      '/vehicles/' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per assegnazione veicolo
DROP TRIGGER IF EXISTS vehicle_assignment_trigger ON vehicles;
CREATE TRIGGER vehicle_assignment_trigger
AFTER UPDATE OF assigned_to ON vehicles
FOR EACH ROW
EXECUTE FUNCTION notify_vehicle_assignment();

-- Funzione per controllare scadenze veicoli (da eseguire periodicamente)
CREATE OR REPLACE FUNCTION check_vehicle_expiries()
RETURNS void AS $$
DECLARE
  vehicle_record RECORD;
  days_until_expiry INTEGER;
  expiry_type TEXT;
  expiry_date DATE;
BEGIN
  -- Controlla ogni veicolo
  FOR vehicle_record IN 
    SELECT * FROM vehicles WHERE assigned_to IS NOT NULL
  LOOP
    -- Controlla assicurazione
    days_until_expiry := vehicle_record.insurance_expiry - CURRENT_DATE;
    IF days_until_expiry BETWEEN 0 AND 7 THEN
      -- Controlla se non esiste già una notifica recente
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE user_id = vehicle_record.assigned_to 
        AND metadata->>'vehicle_id' = vehicle_record.id::text
        AND metadata->>'expiry_type' = 'assicurazione'
        AND created_at > CURRENT_DATE - INTERVAL '1 day'
      ) THEN
        INSERT INTO notifications (user_id, type, title, message, metadata, action_url)
        VALUES (
          vehicle_record.assigned_to,
          'warning',
          'Scadenza assicurazione imminente',
          'Il veicolo ' || vehicle_record.license_plate || ' ha l''assicurazione in scadenza tra ' || days_until_expiry || ' giorni',
          jsonb_build_object('vehicle_id', vehicle_record.id, 'expiry_type', 'assicurazione', 'days', days_until_expiry),
          '/vehicles/' || vehicle_record.id
        );
      END IF;
    END IF;

    -- Controlla bollo
    days_until_expiry := vehicle_record.tax_expiry - CURRENT_DATE;
    IF days_until_expiry BETWEEN 0 AND 7 THEN
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE user_id = vehicle_record.assigned_to 
        AND metadata->>'vehicle_id' = vehicle_record.id::text
        AND metadata->>'expiry_type' = 'bollo'
        AND created_at > CURRENT_DATE - INTERVAL '1 day'
      ) THEN
        INSERT INTO notifications (user_id, type, title, message, metadata, action_url)
        VALUES (
          vehicle_record.assigned_to,
          'warning',
          'Scadenza bollo imminente',
          'Il veicolo ' || vehicle_record.license_plate || ' ha il bollo in scadenza tra ' || days_until_expiry || ' giorni',
          jsonb_build_object('vehicle_id', vehicle_record.id, 'expiry_type', 'bollo', 'days', days_until_expiry),
          '/vehicles/' || vehicle_record.id
        );
      END IF;
    END IF;

    -- Controlla revisione
    days_until_expiry := vehicle_record.inspection_expiry - CURRENT_DATE;
    IF days_until_expiry BETWEEN 0 AND 7 THEN
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE user_id = vehicle_record.assigned_to 
        AND metadata->>'vehicle_id' = vehicle_record.id::text
        AND metadata->>'expiry_type' = 'revisione'
        AND created_at > CURRENT_DATE - INTERVAL '1 day'
      ) THEN
        INSERT INTO notifications (user_id, type, title, message, metadata, action_url)
        VALUES (
          vehicle_record.assigned_to,
          'warning',
          'Scadenza revisione imminente',
          'Il veicolo ' || vehicle_record.license_plate || ' ha la revisione in scadenza tra ' || days_until_expiry || ' giorni',
          jsonb_build_object('vehicle_id', vehicle_record.id, 'expiry_type', 'revisione', 'days', days_until_expiry),
          '/vehicles/' || vehicle_record.id
        );
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Aggiungi colonna metadata alla tabella notifications se non esiste
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS action_url TEXT;

-- Crea un scheduled job per controllare le scadenze ogni giorno (richiede pg_cron extension)
-- Se pg_cron non è disponibile, puoi chiamare check_vehicle_expiries() da un cron job esterno
-- SELECT cron.schedule('check-vehicle-expiries', '0 9 * * *', 'SELECT check_vehicle_expiries();');