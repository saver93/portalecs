# 🔧 Risoluzione Problemi - Gestione Veicoli

## Errore 404 su "Modifica" e "Documenti"

### Problema
Cliccando sui link "Modifica" o "Documenti" nella pagina veicoli, ricevi un errore 404.

### Soluzione
Questo problema è stato risolto nella versione 1.3.0. Assicurati di avere tutti i file necessari:

1. Verifica che esistano queste cartelle:
   ```
   src/app/vehicles/new/
   src/app/vehicles/[id]/edit/
   src/app/vehicles/[id]/documents/
   ```

2. Verifica che ogni cartella contenga un file `page.tsx`

3. Se mancano, ricrea la struttura o scarica i file dal repository

## Errore Upload Documenti

### Problema
Non riesci a caricare documenti, ricevi errori di permessi o il bucket non esiste.

### Soluzioni

#### 1. Bucket non esistente
```
Error: The resource was not found
```

**Soluzione**: 
1. Vai su Supabase Dashboard > Storage
2. Crea un bucket chiamato `vehicle-documents`
3. Rendilo pubblico

#### 2. Errore di permessi
```
Error: new row violates row-level security policy
```

**Soluzione**:
1. Verifica di essere loggato come admin
2. Controlla le policy del bucket in Storage > Policies
3. Segui le istruzioni in `STORAGE_SETUP_GUIDE.md`

#### 3. File non si carica
**Possibili cause**:
- File troppo grande (limite default: 50MB)
- Tipo di file non supportato
- Connessione internet lenta

**Soluzioni**:
- Riduci la dimensione del file
- Usa formati supportati (PDF, JPG, PNG, DOC, DOCX)
- Riprova con una connessione stabile

## Veicolo non si salva/modifica

### Problema
Quando provi a creare o modificare un veicolo, l'operazione fallisce.

### Soluzioni

1. **Controlla i campi obbligatori**:
   - Targa (unica)
   - Marca
   - Modello
   - Anno
   - Tutte le date di scadenza

2. **Targa duplicata**:
   - Verifica che la targa non sia già presente nel sistema
   - Le targhe devono essere uniche

3. **Formato date**:
   - Usa il formato corretto per le date
   - Non inserire date passate per le scadenze

## Documenti non visibili dopo upload

### Problema
Hai caricato un documento ma non lo vedi nella lista.

### Soluzioni

1. **Ricarica la pagina** (F5 o Ctrl+R)

2. **Verifica il bucket sia pubblico**:
   - Storage > vehicle-documents > Settings
   - Assicurati che "Public bucket" sia attivo

3. **Controlla la console del browser** per errori JavaScript

## Performance lenta

### Problema
La pagina veicoli o documenti si carica lentamente.

### Soluzioni

1. **Ottimizza le query**:
   - Limita il numero di veicoli visualizzati
   - Implementa la paginazione

2. **Comprimi le immagini** prima dell'upload

3. **Pulisci i documenti vecchi** non più necessari

## Best Practices

### Gestione Documenti
- **Organizza per tipo**: Usa categorie consistenti
- **Nomi file descrittivi**: Include data o versione nel nome
- **Backup regolari**: Scarica documenti importanti
- **Pulizia periodica**: Rimuovi documenti obsoleti

### Sicurezza
- **Non caricare dati sensibili** non criptati
- **Verifica i permessi** regolarmente
- **Monitora l'utilizzo** dello storage

### Manutenzione
- **Aggiorna le scadenze** tempestivamente
- **Verifica i dati** periodicamente
- **Testa le funzionalità** dopo aggiornamenti

## Contatti Supporto

Se il problema persiste:
1. Controlla i log in Supabase Dashboard
2. Verifica la console del browser (F12)
3. Contatta il supporto tecnico con:
   - Descrizione dettagliata del problema
   - Screenshot dell'errore
   - Passi per riprodurre il problema
