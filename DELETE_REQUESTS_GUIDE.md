# 🗑️ Gestione Eliminazione Richieste Risorse

## Nuova Funzionalità: Eliminazione Richieste (Solo Admin)

### Cosa è cambiato

Gli amministratori ora possono **eliminare definitivamente** le richieste di risorse dal sistema. Questa funzionalità è disponibile per:
- ✅ Richieste in qualsiasi stato (pending, approved, rejected)
- ✅ Richieste di qualsiasi punto vendita
- ✅ Richieste di qualsiasi data

### Come funziona

1. **Accedi come Admin** al portale
2. Vai nella sezione **Richieste Risorse**
3. Nella colonna **Azioni**, vedrai l'icona del cestino 🗑️
4. Clicca sull'icona per eliminare la richiesta
5. Conferma l'eliminazione nel popup

### Permessi

| Ruolo | Visualizza | Crea | Approva/Rifiuta | Elimina |
|-------|-----------|------|-----------------|---------|
| Staff | ✅ (solo proprie) | ✅ | ❌ | ❌ |
| Manager | ✅ (tutte) | ✅ | ✅ | ❌ |
| Admin | ✅ (tutte) | ✅ | ✅ | ✅ |

### Configurazione Database

Per abilitare questa funzionalità, esegui il seguente script SQL in Supabase:

```sql
-- Elimina policy esistente se presente
DROP POLICY IF EXISTS "Only admins can delete resource requests" ON resource_requests;

-- Crea policy per permettere solo agli admin di eliminare
CREATE POLICY "Only admins can delete resource requests" ON resource_requests
FOR DELETE USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
```

### Quando usare l'eliminazione

**Usa l'eliminazione per:**
- 🧹 Richieste duplicate create per errore
- 📝 Richieste di test durante lo sviluppo
- 🚫 Richieste non valide o spam
- 📅 Pulizia periodica di richieste molto vecchie

**NON usare per:**
- ❌ Nascondere richieste rifiutate (meglio tenerle per storico)
- ❌ Modificare richieste (meglio crearne una nuova)
- ❌ Richieste approvate recenti (potrebbero servire per report)

### Sicurezza e Best Practices

1. **Conferma sempre**: Il sistema chiede conferma prima di eliminare
2. **Nessun ripristino**: L'eliminazione è **permanente** e non reversibile
3. **Tracciabilità**: Considera di tenere un log esterno delle eliminazioni importanti
4. **Backup**: Fai backup regolari del database prima di eliminazioni massive

### Differenze tra Stati

- **Rifiutare** una richiesta: La mantiene nel sistema con stato "rejected"
- **Eliminare** una richiesta: La rimuove completamente dal database

### Troubleshooting

#### Errore "row-level security policy"
```
Error: new row violates row-level security policy for table "resource_requests"
```
**Soluzione**: Esegui lo script SQL sopra nel SQL Editor di Supabase

#### Il pulsante elimina non appare
**Possibili cause**:
1. Non sei loggato come admin
2. La tabella non ha richieste
3. Problema di cache del browser (prova F5)

#### L'eliminazione non funziona
**Verifica**:
1. Sei un admin nel sistema
2. La policy DELETE è stata creata
3. Non ci sono foreign key che impediscono l'eliminazione

### FAQ

**D: Posso recuperare una richiesta eliminata?**
R: No, l'eliminazione è permanente. Assicurati prima di procedere.

**D: I manager possono eliminare richieste?**
R: No, solo gli amministratori hanno questo permesso.

**D: Viene tenuta traccia delle eliminazioni?**
R: No, non automaticamente. Se necessario, implementa un sistema di audit log.

**D: Posso eliminare più richieste contemporaneamente?**
R: Attualmente no, devi eliminarle una alla volta per sicurezza.

### Suggerimenti

1. **Prima di eliminare**, considera se la richiesta potrebbe servire per:
   - Report storici
   - Analisi dei trend
   - Audit trail

2. **Alternative all'eliminazione**:
   - Filtra per nascondere richieste vecchie
   - Usa lo stato "rejected" per richieste non valide
   - Esporta i dati prima di eliminarli

3. **Pulizia periodica**:
   - Stabilisci una policy aziendale (es: elimina richieste > 2 anni)
   - Fai sempre un backup prima
   - Documenta le eliminazioni effettuate
