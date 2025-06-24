# 🖨️ Guida Stampa Richieste Risorse

## Nuova Funzionalità: Stampa Richieste

Ora tutti gli utenti possono stampare le richieste di risorse in due modalità:
1. **Stampa Lista Completa** - Stampa tutte le richieste visibili con i filtri applicati
2. **Stampa Richiesta Singola** - Stampa il dettaglio completo di una singola richiesta

## Come Funziona

### Stampa Lista Completa

1. Vai nella sezione **Richieste Risorse**
2. Applica i filtri desiderati (stato, urgenza, punto vendita)
3. Clicca sul pulsante **"Stampa Lista"** 🖨️ in alto a destra
4. Si aprirà la finestra di stampa del browser
5. Seleziona le opzioni di stampa e conferma

**Cosa viene stampato:**
- Intestazione con titolo e data/ora di stampa
- Tabella completa delle richieste filtrate
- Tutti i dati essenziali (stato, tipo, quantità, urgenza, etc.)
- Layout ottimizzato per formato A4

### Stampa Richiesta Singola

1. Trova la richiesta che vuoi stampare nella lista
2. Clicca sull'icona **Stampa** 🖨️ nella colonna Azioni
3. Si aprirà una vista dettagliata della richiesta
4. La stampa partirà automaticamente
5. Puoi chiudere la vista dettagliata dopo la stampa

**Cosa viene stampato:**
- ID della richiesta
- Informazioni complete della richiesta
- Dati del richiedente e punto vendita
- Note (se presenti)
- Data e ora di stampa

## Caratteristiche della Stampa

### Ottimizzazioni Automatiche

✅ **Layout pulito**: Vengono nascosti tutti gli elementi non necessari (menu, pulsanti, filtri)
✅ **Colori ottimizzati**: Testo nero su sfondo bianco per risparmio inchiostro
✅ **Tabelle leggibili**: Bordi chiari e spaziatura adeguata
✅ **Formato A4**: Layout ottimizzato per il formato standard
✅ **Interruzioni di pagina**: Gestione intelligente per evitare tagli nelle righe

### Elementi Nascosti durante la Stampa

- Barra di navigazione
- Pulsanti di azione
- Filtri e controlli
- Icone colorate
- Effetti hover
- Ombre e sfondi colorati

## Suggerimenti per una Stampa Ottimale

### Prima di Stampare

1. **Applica i filtri** per stampare solo le richieste necessarie
2. **Verifica l'anteprima** nella finestra di stampa
3. **Orienta il foglio** in orizzontale per tabelle larghe

### Opzioni di Stampa Consigliate

- **Orientamento**: Verticale per richieste singole, Orizzontale per liste lunghe
- **Margini**: Normali (già ottimizzati nel CSS)
- **Scala**: 100% (non ridurre)
- **Colore**: Bianco e nero per risparmio

### Risparmio Carta

💡 **Suggerimenti**:
- Filtra per stampare solo le richieste necessarie
- Usa la stampa fronte/retro se disponibile
- Considera l'esportazione PDF invece della stampa fisica
- Stampa più richieste singole solo se necessario

## Casi d'Uso

### Quando stampare la lista completa
- Report mensili/settimanali
- Riunioni di revisione
- Archiviazione cartacea periodica
- Condivisione con chi non ha accesso al sistema

### Quando stampare richieste singole
- Documentazione per approvazioni
- Allegati per ordini
- Richieste urgenti da processare
- Backup di richieste importanti

## Risoluzione Problemi

### La stampa non parte
- Verifica che il popup del browser non sia bloccato
- Prova con un browser diverso (Chrome/Firefox consigliati)
- Disabilita temporaneamente i blocchi popup

### Layout non corretto
- Assicurati di non aver modificato lo zoom del browser
- Usa l'anteprima di stampa per verificare
- Prova a ricaricare la pagina (F5)

### Testo tagliato
- Passa all'orientamento orizzontale
- Riduci leggermente la scala (95%)
- Verifica i margini della stampante

## Note Tecniche

### Browser Supportati
- ✅ Chrome (consigliato)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ Internet Explorer (supporto limitato)

### CSS Print Media
Il sistema utilizza CSS `@media print` per:
- Nascondere elementi non stampabili
- Ottimizzare colori e contrasti
- Gestire interruzioni di pagina
- Formattare tabelle per la stampa

### Personalizzazione
Gli amministratori possono modificare gli stili di stampa nel file `globals.css` se necessario.

## FAQ

**D: Posso salvare come PDF invece di stampare?**
R: Sì! Nella finestra di stampa, seleziona "Salva come PDF" come stampante.

**D: Posso stampare solo alcune colonne?**
R: Attualmente no, ma puoi usare i filtri per limitare le righe.

**D: La stampa include le note?**
R: Sì, nella stampa singola. Nella lista, le note sono nascoste per risparmiare spazio.

**D: Posso personalizzare l'intestazione di stampa?**
R: L'intestazione mostra automaticamente data e ora. Per personalizzazioni, contatta l'amministratore.
