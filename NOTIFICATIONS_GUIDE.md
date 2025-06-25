# 🔔 Sistema di Notifiche - Guida Completa

## Panoramica

Il sistema di notifiche implementato offre:
- ✅ **Notifiche in-app real-time** con Supabase Realtime
- ✅ **Badge contatore** nella navbar
- ✅ **Toast notifications** per feedback immediato
- ✅ **Notifiche email** per eventi importanti
- ✅ **Notifiche browser** (Web Push API)
- ✅ **Trigger automatici** nel database
- ✅ **Sistema di template** per email

## 🚀 Setup Iniziale

### 1. Configurazione Database

Esegui questi script SQL nel tuo database Supabase:

```sql
-- 1. Aggiungi colonne mancanti alla tabella notifications
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS action_url TEXT;

-- 2. Crea la tabella per i log delle email
-- Esegui: email-logs-table.sql

-- 3. Installa i trigger per notifiche automatiche
-- Esegui: notification-triggers.sql
```

### 2. Configurazione Supabase Edge Functions

```bash
# Installa Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al progetto
supabase link --project-ref [your-project-ref]

# Deploy della funzione send-email
supabase functions deploy send-email

# Imposta le variabili d'ambiente
supabase secrets set RESEND_API_KEY=[your-resend-api-key]
# oppure
supabase secrets set SENDGRID_API_KEY=[your-sendgrid-api-key]
```

### 3. Configurazione Email Provider

#### Opzione A: Resend (Consigliato)
1. Crea un account su [resend.com](https://resend.com)
2. Verifica il tuo dominio
3. Copia l'API key
4. Aggiorna l'Edge Function con il tuo dominio

#### Opzione B: SendGrid
1. Crea un account su [sendgrid.com](https://sendgrid.com)
2. Verifica il sender
3. Copia l'API key
4. Decommenta il codice SendGrid nell'Edge Function

## 📱 Utilizzo nel Codice

### 1. Notifiche Toast

```typescript
import { useToast } from '@/components/Toast'

function MyComponent() {
  const { showToast } = useToast()

  const handleSuccess = () => {
    showToast({
      type: 'success',
      title: 'Operazione completata',
      message: 'I dati sono stati salvati con successo'
    })
  }

  // Tipi disponibili: success, error, warning, info
}
```

### 2. Creare Notifiche Programmaticamente

```typescript
import { createEventNotification } from '@/utils/notifications'

// Esempio: notifica approvazione richiesta
await createEventNotification('request_approved', userId, {
  request_id: '123',
  resource_type: 'materiali',
  location: 'Milano Centro'
})
```

### 3. Hook per Azioni con Notifiche

```typescript
import { useNotificationActions } from '@/hooks/useNotificationActions'

function RequestsPage() {
  const { notifyRequestStatusChange, notifyNewRequest } = useNotificationActions()

  const handleApprove = async (requestId: string) => {
    // Approva la richiesta
    await approveRequest(requestId)
    
    // Invia notifica
    await notifyRequestStatusChange(requestId, 'approved')
  }

  const handleCreateRequest = async (data: any) => {
    // Crea la richiesta
    const newRequest = await createRequest(data)
    
    // Notifica manager/admin
    await notifyNewRequest(newRequest)
  }
}
```

### 4. Badge Notifiche nella Navbar

Il componente `NotificationBadge` è già integrato. Per aggiungerlo alla navbar:

```typescript
import NotificationBadge from '@/components/NotificationBadge'

function Navbar() {
  return (
    <nav>
      {/* Altri elementi */}
      <NotificationBadge />
    </nav>
  )
}
```

## 🔧 Configurazione Avanzata

### Eventi Disponibili

Il sistema supporta questi eventi:
- `request_created` - Nuova richiesta creata
- `request_approved` - Richiesta approvata
- `request_rejected` - Richiesta rifiutata
- `vehicle_expiry_warning` - Scadenza veicolo imminente
- `vehicle_expired` - Veicolo scaduto
- `vehicle_assigned` - Veicolo assegnato
- `user_created` - Nuovo utente creato
- `user_role_changed` - Ruolo utente modificato

### Personalizzare i Template Email

Modifica i template in `supabase/functions/send-email/index.ts`:

```typescript
const emailTemplates = {
  myCustomTemplate: (data: any) => ({
    subject: 'Oggetto Email',
    html: `
      <h1>Titolo</h1>
      <p>${data.customField}</p>
    `
  })
}
```

### Aggiungere Nuovi Trigger

Crea un nuovo trigger nel database:

```sql
CREATE OR REPLACE FUNCTION notify_custom_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, metadata)
  VALUES (
    NEW.user_id,
    'custom',
    'Titolo notifica',
    'Messaggio notifica',
    jsonb_build_object('data', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER custom_event_trigger
AFTER INSERT ON your_table
FOR EACH ROW
EXECUTE FUNCTION notify_custom_event();
```

## 🔄 Job Schedulati

### Controllo Scadenze Veicoli

Per controllare automaticamente le scadenze ogni giorno:

#### Opzione 1: Supabase Cron (se disponibile)
```sql
SELECT cron.schedule(
  'check-vehicle-expiries',
  '0 9 * * *', -- Ogni giorno alle 9:00
  'SELECT check_vehicle_expiries();'
);
```

#### Opzione 2: Cron Job Esterno
Crea un endpoint API o una Edge Function che chiami:
```typescript
const { checkAndNotifyVehicleExpiries } = useNotificationActions()
await checkAndNotifyVehicleExpiries()
```

## 🎨 Personalizzazione UI

### Modificare i Colori dei Toast

In `Toast.tsx`:
```typescript
const colors = {
  success: 'bg-green-50 text-green-800',
  // Modifica qui i colori
}
```

### Modificare la Posizione dei Toast

In `ToastContainer`:
```typescript
// Cambia da bottom-right a top-center
<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
```

## 📊 Monitoraggio

### Dashboard Admin per Email

Crea una pagina admin per monitorare le email inviate:

```typescript
const { data: emailLogs } = await supabase
  .from('email_logs')
  .select('*')
  .order('sent_at', { ascending: false })
  .limit(100)
```

### Metriche Notifiche

```sql
-- Notifiche per tipo
SELECT type, COUNT(*) 
FROM notifications 
GROUP BY type;

-- Tasso di lettura
SELECT 
  COUNT(*) FILTER (WHERE read = true) * 100.0 / COUNT(*) as read_rate
FROM notifications;
```

## ⚠️ Troubleshooting

### Le notifiche real-time non funzionano
1. Verifica che Realtime sia abilitato nel progetto Supabase
2. Controlla la console per errori WebSocket
3. Verifica le policy RLS

### Le email non vengono inviate
1. Controlla i log della Edge Function
2. Verifica l'API key del provider email
3. Controlla il dominio verificato (per Resend)

### Le notifiche browser non appaiono
1. Verifica i permessi del browser
2. Assicurati di usare HTTPS in produzione
3. Controlla che il browser supporti le Web Notifications

## 🚦 Best Practices

1. **Non spammare**: Limita le notifiche per non infastidire gli utenti
2. **Priorità**: Usa i livelli di priorità per notifiche importanti
3. **Azioni chiare**: Ogni notifica dovrebbe avere un'azione chiara
4. **Pulizia periodica**: Elimina notifiche vecchie periodicamente
5. **Test**: Testa sempre le notifiche in sviluppo prima di produzione

## 📚 Esempi Completi

### Esempio: Notifica Completa con Email

```typescript
// Quando una richiesta viene approvata
const approveRequest = async (requestId: string) => {
  // 1. Aggiorna lo stato nel database
  const { data: request } = await supabase
    .from('resource_requests')
    .update({ status: 'approved' })
    .eq('id', requestId)
    .select('*, requested_by')
    .single()

  // 2. Crea notifica in-app (trigger automatico dal DB)
  // 3. Mostra toast di conferma
  showToast({
    type: 'success',
    title: 'Richiesta approvata',
    message: 'La notifica è stata inviata all\'utente'
  })

  // 4. L'email viene inviata automaticamente dal sistema
}
```

---

Il sistema di notifiche è ora completamente operativo! 🎉