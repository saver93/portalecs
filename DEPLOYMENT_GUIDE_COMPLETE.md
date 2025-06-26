# 🚀 Guida Completa al Deployment del Portale Aziendale

## 📋 Indice
1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Opzione 1: Vercel (Consigliata)](#opzione-1-vercel-consigliata)
3. [Opzione 2: Netlify](#opzione-2-netlify)
4. [Opzione 3: Railway](#opzione-3-railway)
5. [Opzione 4: Self-Hosting](#opzione-4-self-hosting)
6. [Configurazione Dominio](#configurazione-dominio)
7. [Post-Deployment](#post-deployment)

## Pre-deployment Checklist

### ✅ 1. Verifica il codice
```bash
# Esegui il build locale per verificare che non ci siano errori
npm run build

# Testa la versione di produzione
npm run start
```

### ✅ 2. Variabili d'ambiente
Assicurati che `.env.local` NON sia committato (controlla `.gitignore`):
```gitignore
# .gitignore dovrebbe contenere:
.env.local
.env
```

### ✅ 3. Aggiorna le policy di Supabase
Nel dashboard Supabase, vai su Authentication → URL Configuration e aggiungi:
- Site URL: `https://tuo-dominio.vercel.app`
- Redirect URLs: `https://tuo-dominio.vercel.app/*`

### ✅ 4. Ottimizza le immagini e assets
```bash
# Se hai immagini statiche, ottimizzale prima del deploy
# Puoi usare tool come: https://tinypng.com/
```

---

## Opzione 1: Vercel (Consigliata) 

### 🎯 Perché Vercel?
- **Gratis** per progetti personali/piccoli team
- **Zero-config** per Next.js
- **Deploy automatici** ad ogni push su GitHub
- **Preview deployments** per ogni PR
- **Analytics** integrati
- **Edge Functions** supportate

### 📝 Step-by-step Vercel

#### 1. Prepara il repository
```bash
# Inizializza git se non l'hai già fatto
git init

# Aggiungi tutti i file
git add .

# Commit iniziale
git commit -m "Initial commit - Portale Aziendale v2.0"

# Crea repo su GitHub e pusha
# Vai su github.com/new per creare un nuovo repository
# Poi:
git remote add origin https://github.com/TUO_USERNAME/portale-aziendale.git
git branch -M main
git push -u origin main
```

#### 2. Deploy su Vercel
1. Vai su [vercel.com](https://vercel.com) e registrati
2. Clicca "Add New..." → "Project"
3. Importa il tuo repository GitHub
4. Configura il progetto:
   - **Framework Preset**: Next.js (auto-rilevato)
   - **Root Directory**: `./` (lascia vuoto)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

#### 3. Aggiungi Environment Variables
Nel pannello Vercel, prima del deploy:
```
NEXT_PUBLIC_SUPABASE_URL=https://olaxxacwskjbvxjaeggt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

#### 4. Deploy!
Clicca "Deploy" e attendi 2-3 minuti.

### 🔧 Configurazione avanzata Vercel
```json
// vercel.json (opzionale)
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["fra1"], // Per hosting in Europa
  "functions": {
    "src/app/api/*": {
      "maxDuration": 10
    }
  }
}
```

---

## Opzione 2: Netlify

### 📝 Step-by-step Netlify

#### 1. Installa Netlify CLI (opzionale)
```bash
npm install -g netlify-cli
```

#### 2. Build configuration
Crea `netlify.toml` nella root:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_PUBLIC_SUPABASE_URL = "inserisci-qui"
  NEXT_PUBLIC_SUPABASE_ANON_KEY = "inserisci-qui"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3. Deploy
```bash
# Con CLI
netlify deploy --prod

# O tramite interfaccia web
# 1. Vai su app.netlify.com
# 2. Drag & drop della cartella del progetto
# 3. Configura variabili d'ambiente
```

---

## Opzione 3: Railway

### 📝 Railway - Hosting moderno

```bash
# Installa Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inizializza progetto
railway init

# Aggiungi variabili
railway variables set NEXT_PUBLIC_SUPABASE_URL=xxx
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Deploy
railway up
```

---

## Opzione 4: Self-Hosting (VPS)

### 📝 Deploy su VPS (DigitalOcean, Linode, etc.)

#### 1. Prepara il server
```bash
# Su Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm nginx certbot python3-certbot-nginx

# Installa PM2 per gestire il processo
npm install -g pm2
```

#### 2. Setup progetto
```bash
# Clona il progetto
git clone https://github.com/tuouser/portale-aziendale.git
cd portale-aziendale

# Installa dipendenze
npm install

# Build
npm run build

# Crea file .env.production
echo "NEXT_PUBLIC_SUPABASE_URL=xxx" > .env.production
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx" >> .env.production
```

#### 3. PM2 configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'portale-aziendale',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

#### 4. Nginx configuration
```nginx
# /etc/nginx/sites-available/portale
server {
    listen 80;
    server_name tuodominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5. SSL con Let's Encrypt
```bash
sudo certbot --nginx -d tuodominio.com
```

---

## Configurazione Dominio

### 🌐 Collegare un dominio personalizzato

#### Per Vercel:
1. Settings → Domains
2. Aggiungi `portale.tuaazienda.it`
3. Configura DNS:
   ```
   Type: CNAME
   Name: portale
   Value: cname.vercel-dns.com
   ```

#### Per Netlify:
1. Site settings → Domain management
2. Add custom domain
3. Configura DNS:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   ```

---

## Post-Deployment

### 🔍 1. Verifica funzionamento
- [ ] Login/Logout funziona
- [ ] Creazione richieste
- [ ] Upload documenti
- [ ] Notifiche
- [ ] Dark mode
- [ ] Mobile responsive

### 🔒 2. Sicurezza
```bash
# Aggiungi headers di sicurezza (next.config.js)
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
]
```

### 📊 3. Monitoring (opzionale)
- **Vercel Analytics**: Integrato nel dashboard
- **Google Analytics**: Aggiungi script in `app/layout.tsx`
- **Sentry**: Per error tracking

### 🔄 4. CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test # se hai test
```

---

## 💰 Costi stimati

### Vercel
- **Hobby (Free)**: 
  - 100GB bandwidth/mese
  - Perfetto per piccole aziende
- **Pro ($20/mese)**: 
  - 1TB bandwidth
  - Team collaboration
  - Analytics avanzati

### Supabase
- **Free tier**:
  - 500MB database
  - 2GB bandwidth
  - 50,000 richieste/mese
- **Pro ($25/mese)**:
  - 8GB database
  - 50GB bandwidth
  - 5 milioni richieste/mese

### Dominio
- **.it**: ~€10-15/anno
- **.com**: ~€12-20/anno

---

## 🆘 Troubleshooting comune

### Build fallisce
```bash
# Verifica errori TypeScript
npm run type-check

# Pulisci cache
rm -rf .next node_modules
npm install
npm run build
```

### Variabili d'ambiente non funzionano
- Verifica che inizino con `NEXT_PUBLIC_` per essere accessibili lato client
- Riavvia il server dopo modifiche a .env

### 500 Internal Server Error
- Controlla i log su Vercel/Netlify
- Verifica connessione a Supabase
- Controlla che le RLS policies siano configurate

---

## 🎉 Conclusione

Con queste opzioni, il tuo portale sarà online in pochi minuti! 

**Consiglio**: Inizia con Vercel free tier + Supabase free tier. È più che sufficiente per iniziare e puoi sempre fare upgrade quando necessario.

Hai bisogno di aiuto con uno specifico passaggio del deployment?
