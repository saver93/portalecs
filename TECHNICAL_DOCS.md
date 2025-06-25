# Documentazione Tecnica - Portale Aziendale

## Architettura

### Frontend
- **Framework**: Next.js 14 con App Router
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS
- **Icone**: Lucide React
- **Gestione Date**: date-fns

### Backend
- **Database**: PostgreSQL (tramite Supabase)
- **Autenticazione**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime (disponibile per future implementazioni)

## Struttura Database

### Tabelle Principali

#### users
- `id` (UUID, PK): Riferimento a auth.users
- `email` (VARCHAR): Email dell'utente
- `full_name` (VARCHAR): Nome completo
- `role` (VARCHAR): admin | manager | staff
- `location_id` (UUID, FK): Punto vendita assegnato
- `created_at` (TIMESTAMP): Data creazione

#### locations
- `id` (UUID, PK): ID univoco
- `name` (VARCHAR): Nome punto vendita
- `address` (TEXT): Indirizzo
- `created_at` (TIMESTAMP): Data creazione

#### resource_requests
- `id` (UUID, PK): ID univoco
- `location_id` (UUID, FK): Punto vendita richiedente
- `requested_by` (UUID, FK): Utente richiedente
- `resource_type` (VARCHAR): material | personnel | other
- `quantity` (INTEGER): Quantità richiesta
- `urgency` (VARCHAR): low | medium | high
- `notes` (TEXT): Note aggiuntive
- `status` (VARCHAR): pending | approved | rejected
- `created_at` (TIMESTAMP): Data creazione
- `updated_at` (TIMESTAMP): Data ultimo aggiornamento

#### vehicles
- `id` (UUID, PK): ID univoco
- `license_plate` (VARCHAR): Targa (univoca)
- `brand` (VARCHAR): Marca
- `model` (VARCHAR): Modello
- `year` (INTEGER): Anno immatricolazione
- `location_id` (UUID, FK): Punto vendita assegnato
- `assigned_to` (UUID, FK): Utente assegnatario
- `insurance_expiry` (DATE): Scadenza assicurazione
- `tax_expiry` (DATE): Scadenza bollo
- `inspection_expiry` (DATE): Scadenza revisione
- `status` (VARCHAR): available | in_use | maintenance
- `created_at` (TIMESTAMP): Data creazione
- `updated_at` (TIMESTAMP): Data ultimo aggiornamento

#### vehicle_documents
- `id` (UUID, PK): ID univoco
- `vehicle_id` (UUID, FK): Veicolo di riferimento
- `document_type` (VARCHAR): Tipo documento
- `file_url` (TEXT): URL del file su Supabase Storage
- `file_name` (VARCHAR): Nome del file
- `uploaded_at` (TIMESTAMP): Data caricamento

#### notifications
- `id` (UUID, PK): ID univoco
- `user_id` (UUID, FK): Utente destinatario
- `type` (VARCHAR): Tipo notifica
- `title` (VARCHAR): Titolo
- `message` (TEXT): Messaggio
- `read` (BOOLEAN): Letta/Non letta
- `created_at` (TIMESTAMP): Data creazione

## Sicurezza

### Row Level Security (RLS)
Tutte le tabelle hanno RLS abilitato con policy specifiche:

- **users**: Tutti possono visualizzare, solo admin può modificare
- **locations**: Tutti possono visualizzare, solo admin può modificare
- **resource_requests**: 
  - Staff vede solo richieste del proprio punto vendita
  - Manager/Admin vedono tutto
  - Manager/Admin possono approvare/rifiutare
- **vehicles**: Tutti possono visualizzare, solo admin può modificare
- **notifications**: Utenti vedono solo le proprie

### Autenticazione
- Gestita tramite Supabase Auth
- Middleware Next.js per protezione route
- Token JWT per sessioni

## API Endpoints (Supabase)

Tutte le operazioni CRUD sono gestite tramite Supabase Client:

```typescript
// Esempio: Fetch richieste
const { data, error } = await supabase
  .from('resource_requests')
  .select('*')
  .eq('status', 'pending')

// Esempio: Inserimento veicolo
const { data, error } = await supabase
  .from('vehicles')
  .insert({ ...vehicleData })

// Esempio: Update con RLS
const { error } = await supabase
  .from('resource_requests')
  .update({ status: 'approved' })
  .eq('id', requestId)
```

## Funzionalità Future

### 1. Sistema Notifiche Email
```typescript
// Implementare con Supabase Edge Functions
// Trigger su cambio stato richieste
// Email template per approvazioni/rifiuti
```

### 2. Dashboard Analytics
- Grafici statistiche richieste
- Utilizzo veicoli nel tempo
- KPI per punto vendita

### 3. Sistema Documenti Avanzato
- Preview documenti inline
- Versioning documenti
- Scadenze automatiche con reminder

### 4. Mobile App
- React Native con Supabase
- Notifiche push
- Foto dirette per documenti veicoli

### 5. Integrazione Calendar
- Scadenze veicoli su Google Calendar
- Promemoria automatici
- Pianificazione manutenzioni

### 6. Report e Export
- Export PDF richieste
- Report mensili automatici
- Statistiche per management

### 7. Workflow Approvazioni
- Approvazioni multi-livello
- Deleghe temporanee
- Storico decisioni

### 8. API REST Esterna
```typescript
// Per integrazioni con altri sistemi
app.get('/api/vehicles', authenticateAPI, async (req, res) => {
  // Logica per esporre dati veicoli
})
```

## Performance

### Ottimizzazioni Implementate
- Indici su campi di ricerca frequente
- Lazy loading componenti
- Image optimization Next.js

### Ottimizzazioni Future
- Caching con Redis
- CDN per assets statici
- Server-side pagination
- Debouncing ricerche

## Testing

### Unit Tests (da implementare)
```typescript
// __tests__/components/Navbar.test.tsx
import { render, screen } from '@testing-library/react'
import Navbar from '@/components/Navbar'

test('renders navigation links', () => {
  render(<Navbar userRole="admin" />)
  expect(screen.getByText('Dashboard')).toBeInTheDocument()
})
```

### E2E Tests (da implementare)
```typescript
// cypress/e2e/login.cy.ts
describe('Login Flow', () => {
  it('should login successfully', () => {
    cy.visit('/auth/login')
    cy.get('#email').type('test@example.com')
    cy.get('#password').type('password')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})
```

## Deployment

### Vercel (Consigliato)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker (Alternativa)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoraggio

### Sentry (da implementare)
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

### Analytics (da implementare)
- Google Analytics 4
- Mixpanel per eventi custom
- Hotjar per heatmaps

## Manutenzione

### Backup Database
- Configurare backup automatici in Supabase
- Export settimanali
- Test di restore periodici

### Aggiornamenti
- Dipendenze: `npm update` mensile
- Security patches: immediati
- Next.js major versions: trimestrale

### Monitoring
- Uptime monitoring con Pingdom
- Error tracking con Sentry
- Performance con Lighthouse CI
