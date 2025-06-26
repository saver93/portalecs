# 🚀 Guida Deployment - Portale Aziendale v2.0

Questa guida descrive come deployare il portale aziendale su diversi servizi di hosting.

## 📋 Pre-requisiti

Prima di deployare, assicurati di:

1. ✅ Aver testato l'applicazione in locale
2. ✅ Aver configurato correttamente Supabase
3. ✅ Aver eseguito `npm run build` senza errori
4. ✅ Aver verificato che tutte le funzionalità funzionino

## 🎯 Vercel (Consigliato)

Vercel è la piattaforma ottimale per Next.js con deploy automatici e ottimizzazioni built-in.

### Passaggi:

1. **Crea account Vercel**
   - Vai su [vercel.com](https://vercel.com)
   - Registrati con GitHub/GitLab/Bitbucket

2. **Importa progetto**
   ```bash
   # Installa Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Configura variabili d'ambiente**
   - Dashboard Vercel → Settings → Environment Variables
   - Aggiungi:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://tuoprogetto.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-anon-key
     ```

4. **Domini personalizzati**
   - Settings → Domains
   - Aggiungi il tuo dominio (es: portale.tuaazienda.it)

### Ottimizzazioni Vercel:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["fra1"], // Milano datacenter
  "functions": {
    "src/app/api/*": {
      "maxDuration": 10
    }
  }
}
```

## 🌐 Netlify

### Passaggi:

1. **Build settings**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"

   [build.environment]
     NEXT_PUBLIC_SUPABASE_URL = "your-url"
     NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-key"
   ```

2. **Deploy**
   ```bash
   # Installa Netlify CLI
   npm i -g netlify-cli
   
   # Deploy
   netlify deploy --prod
   ```

## 🚂 Railway

### Passaggi:

1. **Crea progetto Railway**
   - [railway.app](https://railway.app)
   - New Project → Deploy from GitHub

2. **Configura**
   ```json
   // railway.json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "numReplicas": 1,
       "startCommand": "npm start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

3. **Variabili d'ambiente**
   - Aggiungi tramite dashboard Railway

## 🐳 Docker

### Dockerfile ottimizzato:

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build e run:

```bash
# Build
docker build -t portale-aziendale .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  portale-aziendale
```

## ⚡ Ottimizzazioni Performance

### 1. **Next.js Config**

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

### 2. **Headers di sicurezza**

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        }
      ]
    }
  ]
}
```

### 3. **Caching**

```javascript
// Cache static assets
async headers() {
  return [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ]
}
```

## 📊 Monitoraggio

### 1. **Vercel Analytics**

```bash
npm i @vercel/analytics

# In app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

<Analytics />
```

### 2. **Sentry per errori**

```bash
npm i @sentry/nextjs

# sentry.client.config.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## 🔒 Checklist Sicurezza

Prima del deploy in produzione:

- [ ] Variabili d'ambiente configurate correttamente
- [ ] HTTPS abilitato
- [ ] Rate limiting configurato in Supabase
- [ ] Backup database configurato
- [ ] Monitoring attivo
- [ ] Test di carico eseguiti
- [ ] Policy CORS configurate
- [ ] Headers di sicurezza implementati

## 🚨 Troubleshooting

### Build fallisce

```bash
# Pulisci cache
rm -rf .next node_modules
npm install
npm run build
```

### Errori Supabase in produzione

1. Verifica le variabili d'ambiente
2. Controlla i domini autorizzati in Supabase
3. Verifica le policy RLS

### Performance lenta

1. Abilita ISR (Incremental Static Regeneration)
2. Implementa caching edge
3. Ottimizza immagini con next/image
4. Usa dynamic imports per code splitting

## 📈 Scaling

### Configurazione per alto traffico:

1. **CDN**: CloudFlare o Fastly
2. **Database**: Supabase Pro con read replicas
3. **Caching**: Redis per sessioni
4. **Load Balancing**: Multi-region deployment

## 🎯 Best Practices

1. **Environment stages**
   - Development: `.env.local`
   - Staging: `.env.staging`
   - Production: `.env.production`

2. **CI/CD Pipeline**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy
   on:
     push:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm ci
         - run: npm run build
         - run: npm run test
         - uses: vercel/action@v28
   ```

3. **Monitoring**
   - Uptime: UptimeRobot o Pingdom
   - Performance: Google PageSpeed Insights
   - Errors: Sentry
   - Analytics: Vercel Analytics o Google Analytics

---

Per supporto deployment: [documentazione@tuaazienda.com]