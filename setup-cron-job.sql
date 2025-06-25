-- Configurazione del cron job per check-expiries
-- Esegui questo nel SQL Editor di Supabase

-- Opzione 1: Usando pg_cron (se disponibile)
-- Prima verifica se pg_cron è disponibile
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Se pg_cron è installato, crea il job schedulato
SELECT cron.schedule(
  'check-vehicle-expiries-edge-function',
  '0 9 * * *', -- Ogni giorno alle 9:00
  $$
    SELECT
      net.http_post(
        url := 'https://olaxxacwskjbvxjaeggt.supabase.co/functions/v1/check-expiries',
        headers := jsonb_build_object(
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object('scheduled', true)
      );
  $$
);

-- Per vedere i job schedulati
-- SELECT * FROM cron.job;

-- Per rimuovere il job se necessario
-- SELECT cron.unschedule('check-vehicle-expiries-edge-function');

-- Opzione 2: Trigger diretto dalla funzione SQL
-- Se pg_cron non è disponibile, puoi chiamare la funzione SQL direttamente
-- Ma dovrai configurare un cron esterno (come cron-job.org) per chiamare questo endpoint
CREATE OR REPLACE FUNCTION trigger_check_expiries()
RETURNS void AS $$
BEGIN
  -- Chiama direttamente la funzione di controllo scadenze
  PERFORM check_vehicle_expiries();
END;
$$ LANGUAGE plpgsql;

-- Test immediato della funzione
-- SELECT check_vehicle_expiries();
