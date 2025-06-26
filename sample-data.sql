-- Esempio di dati iniziali per il database
-- Esegui queste query dopo aver creato lo schema del database

-- 1. Inserisci alcuni punti vendita di esempio
INSERT INTO locations (name, address) VALUES
('Sede Centrale', 'Via Roma 1, 20121 Milano'),
('Filiale Nord', 'Via Torino 50, 10121 Torino'),
('Filiale Sud', 'Via Napoli 100, 80121 Napoli'),
('Filiale Est', 'Via Venezia 25, 30121 Venezia'),
('Magazzino Centrale', 'Via Logistica 10, 20090 Segrate (MI)');

-- 2. Dopo aver creato il primo utente admin tramite Supabase Auth,
-- ricordati di inserire i suoi dati nella tabella users con il ruolo 'admin'

-- Esempio (sostituisci con i dati reali):
-- INSERT INTO users (id, email, full_name, role, location_id) VALUES
-- ('uuid-dell-utente', 'admin@azienda.it', 'Mario Rossi', 'admin', 
--  (SELECT id FROM locations WHERE name = 'Sede Centrale' LIMIT 1));

-- 3. Esempio di veicoli (opzionale)
-- INSERT INTO vehicles (license_plate, brand, model, year, status, 
--   insurance_expiry, tax_expiry, inspection_expiry, location_id) VALUES
-- ('AB123CD', 'Fiat', 'Panda', 2022, 'available', '2025-06-30', '2025-12-31', '2026-03-15',
--   (SELECT id FROM locations WHERE name = 'Sede Centrale' LIMIT 1)),
-- ('EF456GH', 'Ford', 'Focus', 2021, 'available', '2025-08-15', '2025-11-30', '2025-09-20',
--   (SELECT id FROM locations WHERE name = 'Filiale Nord' LIMIT 1));

-- 4. Esempio di richieste risorse (opzionale)
-- INSERT INTO resource_requests (location_id, requested_by, resource_type, 
--   quantity, urgency, notes, status) VALUES
-- ((SELECT id FROM locations WHERE name = 'Filiale Nord' LIMIT 1),
--  'uuid-dell-utente', 'material', 50, 'medium', 
--  'Richiesta carta A4 per ufficio', 'pending');
