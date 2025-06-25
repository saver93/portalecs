-- Configurazione Storage per i documenti dei veicoli

-- NOTA: Lo storage bucket deve essere creato dal dashboard di Supabase
-- Vai su Storage > New Bucket e crea un bucket chiamato "vehicle-documents"

-- Policy per il bucket vehicle-documents
-- Queste policy devono essere aggiunte nel dashboard di Supabase sotto Storage > Policies

-- 1. Policy per permettere agli admin di caricare file
-- Nome: Allow admins to upload
-- Operazione: INSERT
-- Definizione:
-- bucket_id = 'vehicle-documents' AND auth.uid() IN (SELECT id FROM users WHERE role = 'admin')

-- 2. Policy per permettere a tutti di visualizzare i file
-- Nome: Allow authenticated to view
-- Operazione: SELECT
-- Definizione:
-- bucket_id = 'vehicle-documents' AND auth.uid() IS NOT NULL

-- 3. Policy per permettere agli admin di eliminare file
-- Nome: Allow admins to delete
-- Operazione: DELETE
-- Definizione:
-- bucket_id = 'vehicle-documents' AND auth.uid() IN (SELECT id FROM users WHERE role = 'admin')

-- 4. Policy per permettere agli admin di aggiornare file
-- Nome: Allow admins to update
-- Operazione: UPDATE
-- Definizione:
-- bucket_id = 'vehicle-documents' AND auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
