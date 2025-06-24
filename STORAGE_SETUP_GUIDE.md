# 📁 Configurazione Storage per Documenti Veicoli

## Setup Storage Bucket in Supabase

### 1. Crea il Bucket

1. Vai nel dashboard di Supabase
2. Clicca su **Storage** nel menu laterale
3. Clicca su **New bucket**
4. Configura il bucket:
   - **Name**: `vehicle-documents`
   - **Public bucket**: ✅ Sì (per permettere la visualizzazione dei file)
   - **File size limit**: 50MB (o secondo le tue necessità)
   - **Allowed MIME types**: Lascia vuoto per permettere tutti i tipi
5. Clicca **Create bucket**

### 2. Configura le Policy RLS

Dopo aver creato il bucket, devi configurare le policy di sicurezza:

1. Sempre nella sezione **Storage**
2. Clicca sul bucket `vehicle-documents`
3. Vai nella tab **Policies**
4. Crea le seguenti policy:

#### Policy 1: Allow admins to upload
- **Name**: `Allow admins to upload`
- **Policy command**: `INSERT`
- **Policy definition**:
```sql
bucket_id = 'vehicle-documents' 
AND auth.uid() IN (
  SELECT id FROM public.users WHERE role = 'admin'
)
```

#### Policy 2: Allow authenticated to view
- **Name**: `Allow authenticated to view`
- **Policy command**: `SELECT`
- **Policy definition**:
```sql
bucket_id = 'vehicle-documents' 
AND auth.uid() IS NOT NULL
```

#### Policy 3: Allow admins to delete
- **Name**: `Allow admins to delete`
- **Policy command**: `DELETE`
- **Policy definition**:
```sql
bucket_id = 'vehicle-documents' 
AND auth.uid() IN (
  SELECT id FROM public.users WHERE role = 'admin'
)
```

#### Policy 4: Allow admins to update
- **Name**: `Allow admins to update`
- **Policy command**: `UPDATE`
- **Policy definition**:
```sql
bucket_id = 'vehicle-documents' 
AND auth.uid() IN (
  SELECT id FROM public.users WHERE role = 'admin'
)
```

### 3. Verifica la Configurazione

Per verificare che tutto funzioni:

1. Accedi al portale come admin
2. Vai nella sezione **Parco Auto**
3. Clicca su un veicolo e poi su **Documenti**
4. Prova a caricare un documento

### 4. Tipi di File Supportati

L'applicazione supporta i seguenti formati:
- PDF (.pdf)
- Immagini (.jpg, .jpeg, .png)
- Documenti Word (.doc, .docx)

### 5. Limiti e Considerazioni

- **Dimensione massima file**: Configurabile nel bucket (default: 50MB)
- **Storage totale**: Dipende dal tuo piano Supabase
- **Bandwidth**: Considera i limiti di banda del tuo piano

### 6. Troubleshooting

#### Errore "new row violates row-level security policy"
- Verifica che l'utente sia un admin
- Controlla che le policy siano configurate correttamente

#### Errore "The resource was not found"
- Verifica che il bucket `vehicle-documents` esista
- Controlla il nome esatto del bucket

#### File non visibile dopo upload
- Verifica che il bucket sia pubblico
- Controlla le policy di SELECT

### 7. Backup e Sicurezza

⚠️ **Importante**:
- Fai backup regolari dei documenti importanti
- Non caricare documenti con dati sensibili non criptati
- Monitora l'utilizzo dello storage dal dashboard Supabase

## Note Aggiuntive

- I file vengono organizzati in cartelle per veicolo (usando l'ID del veicolo)
- I nomi dei file includono un timestamp per evitare conflitti
- I documenti eliminati vengono rimossi sia dal database che dallo storage
