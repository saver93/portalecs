# 🚀 Portale Aziendale v2.0 - Gestione Risorse e Parco Auto

Sistema web completo per la gestione delle richieste risorse aziendali e del parco auto con interfaccia moderna, animazioni fluide e supporto per dark mode.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)

## ✨ Novità v2.0

### 🎨 Interfaccia Completamente Ridisegnata
- **Dark Mode** automatico e manuale con persistenza delle preferenze
- **Animazioni fluide** per transizioni e interazioni
- **Design moderno** con glassmorphism e gradient effects
- **Layout responsive** ottimizzato per tutti i dispositivi
- **Componenti UI riutilizzabili** (Alert, Modal, Badge, Tabs, etc.)

### 🚀 Miglioramenti Performance
- **Caricamento ottimizzato** con skeleton loaders
- **Animazioni GPU-accelerate** per fluidità massima
- **Code splitting** automatico per bundle più piccoli
- **CSS variables** per cambio tema istantaneo

### ♿ Accessibilità Migliorata
- **WCAG AA compliant** per contrasti colore
- **Focus indicators** chiari per navigazione da tastiera
- **Screen reader friendly** con ARIA labels
- **Typography responsive** per migliore leggibilità

## 🚀 Funzionalità Principali

### Sistema di Autenticazione e Ruoli
- **Login sicuro** con Supabase Auth
- **Tre ruoli**: Admin, Manager, Staff
- **Permessi granulari** basati sul ruolo
- **Profilo personale** con cambio password sicuro

### Dashboard Interattiva
- **Statistiche in tempo reale** con animazioni
- **Widget informativi** per richieste e veicoli
- **Grafici progressivi** per admin
- **Azioni rapide** contestuali
- **Attività recenti** con timeline

### Gestione Richieste Risorse
- **Creazione richieste** per materiali, personale o altro
- **Sistema di approvazione** multi-livello
- **Filtri avanzati** con ricerca in tempo reale
- **Stati visuali** con badge colorati
- **Stampa richieste** ottimizzata
- **Tabs navigabili** per organizzazione

### Gestione Parco Auto
- **Inventario completo** con card interattive
- **Tracking scadenze** con progress bar visive
- **Alert automatici** per scadenze imminenti
- **Assegnazione dinamica** a utenti/punti vendita
- **Upload documenti** con gestione allegati

### Gestione Utenti (Admin)
- **Creazione diretta** con validazione in tempo reale
- **Avatar automatici** con iniziali
- **Filtri e ricerca** avanzati
- **Statistiche ruoli** in dashboard
- **Modifica inline** senza reload pagina

### Tema e Personalizzazione
- **3 modalità**: Chiaro, Scuro, Sistema
- **Switch istantaneo** senza reload
- **Persistenza locale** delle preferenze
- **Colori personalizzabili** via CSS variables

## 🛠️ Tecnologie Utilizzate

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS con custom theme system
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Lucide React
- **Date**: date-fns
- **Animazioni**: CSS personalizzato + Tailwind

## 📋 Prerequisiti

- Node.js 18+ installato
- npm 9+ o yarn
- Account Supabase (gratuito su [supabase.com](https://supabase.com))

## 🔧 Installazione e Configurazione

### 1. Clona il repository e installa

```bash
git clone [url-repository]
cd sito
npm install
```

### 2. Configura Supabase

1. Crea un nuovo progetto su [Supabase](https://supabase.com)
2. Una volta creato il progetto, vai su **Settings > API**
3. Copia:
   - `Project URL` (sarà il tuo NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (sarà il tuo NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Configura il Database

Nel dashboard Supabase, vai su **SQL Editor** ed esegui in ordine:

1. `database-schema.sql` - Schema completo del database
2. `fix-rls-policy.sql` - Policy per la creazione utenti
3. `update-user-policies.sql` - Policy per la modifica utenti
4. `storage-setup.sql` - Configurazione storage per documenti

### 4. Configura le variabili d'ambiente

Crea un file `.env.local` nella root del progetto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tuoprogetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-anon-key
```

### 5. Avvia l'applicazione

```bash
npm run dev
```

L'applicazione sarà disponibile su [http://localhost:3000](http://localhost:3000)

## 📱 Screenshots

### Light Mode
- Dashboard con statistiche animate
- Gestione richieste con tabs e filtri
- Parco auto con card interattive
- Profilo utente con validazione password

### Dark Mode
- Tema scuro ottimizzato per ridurre affaticamento visivo
- Contrasti ottimizzati per leggibilità
- Colori vibranti per elementi interattivi

## 🔐 Ruoli e Permessi

| Funzionalità | Admin | Manager | Staff |
|--------------|-------|---------|-------|
| Dashboard completa | ✅ | ✅ | ✅ |
| Creare richieste | ✅ | ✅ | ✅ |
| Approvare richieste | ✅ | ✅ | ❌ |
| Eliminare richieste | ✅ | ❌ | ❌ |
| Gestire veicoli | ✅ | ❌ | ❌ |
| Gestire utenti | ✅ | ❌ | ❌ |
| Gestire punti vendita | ✅ | ❌ | ❌ |
| Dark mode | ✅ | ✅ | ✅ |

## 📦 Scripts Disponibili

```bash
# Sviluppo
npm run dev          # Avvia in modalità sviluppo

# Build e produzione
npm run build        # Build per produzione
npm run start        # Avvia in produzione

# Utility
npm run lint         # Controllo errori codice
npm run type-check   # Controllo tipi TypeScript
npm run format       # Formatta codice con Prettier
npm run clean        # Pulisce cache e reinstalla
```

## 🚀 Deploy

### Vercel (Consigliato)
1. Importa il progetto su [Vercel](https://vercel.com)
2. Configura le variabili d'ambiente
3. Deploy automatico ad ogni push

### Altri Hosting
- Netlify
- Railway
- Qualsiasi hosting Node.js

## 🎨 Personalizzazione

### Colori del Brand
Modifica le variabili CSS in `globals.css`:

```css
:root {
  --color-primary-500: 59 130 246; /* Blu di default */
  /* Cambia con i tuoi colori RGB */
}
```

### Animazioni
Personalizza in `tailwind.config.js`:

```javascript
animation: {
  'slideInUp': 'slideInUp 0.3s ease-out',
  // Aggiungi le tue animazioni
}
```

## 🔧 Troubleshooting

### Dark Mode non funziona
- Verifica che il browser supporti `prefers-color-scheme`
- Controlla localStorage per preferenze salvate

### Animazioni lente
- Disabilita in `globals.css` per dispositivi low-end
- Riduci `animation-duration` per animazioni più veloci

### Errori Supabase
- Verifica le policy RLS siano configurate
- Controlla le variabili d'ambiente

## 🤝 Contribuire

1. Fork il progetto
2. Crea un branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Changelog

### v2.0.0 (Dicembre 2024)
- ✨ Interfaccia completamente ridisegnata
- 🌙 Aggiunto supporto Dark Mode
- 🎨 Nuovo sistema di temi con CSS variables
- ✨ Animazioni e transizioni fluide
- 📱 Migliorato design responsive
- ♿ Miglioramenti accessibilità
- 🚀 Ottimizzazioni performance
- 🧩 Componenti UI riutilizzabili

### v1.0.0
- 🎉 Release iniziale
- 📋 Gestione richieste base
- 🚗 Gestione veicoli
- 👥 Sistema utenti

## 📄 Licenza

Questo progetto è proprietario e confidenziale.

## 👥 Team

- **Development**: Il tuo team
- **UI/UX Design**: Design system moderno
- **Backend**: Powered by Supabase

---

Made with ❤️ and lots of ☕ by your development team