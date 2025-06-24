# Deploy su Vercel - Guida Rapida

## 1. Preparazione

Prima di effettuare il deploy, assicurati di aver:
- ✅ Configurato Supabase con tutte le tabelle
- ✅ Creato almeno un utente admin
- ✅ Testato l'applicazione in locale

## 2. Deploy con Vercel (Metodo più semplice)

### Opzione A: Deploy tramite GitHub

1. **Carica il progetto su GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tuousername/portale-aziendale.git
   git push -u origin main
   ```

2. **Vai su [Vercel](https://vercel.com)**
   - Clicca su "New Project"
   - Importa il repository da GitHub
   - Vercel rileverà automaticamente che è un progetto Next.js

3. **Configura le variabili d'ambiente**
   - Clicca su "Environment Variables"
   - Aggiungi:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://tuoprogetto.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-anon-key
     ```

4. **Clicca su "Deploy"**

### Opzione B: Deploy tramite CLI

1. **Installa Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Esegui il deploy**
   ```bash
   vercel
   ```

3. **Segui le istruzioni**
   - Scegli il nome del progetto
   - Conferma le impostazioni
   - Aggiungi le variabili d'ambiente quando richiesto

## 3. Post-Deploy

### Dominio Personalizzato
1. Vai su Settings → Domains
2. Aggiungi il tuo dominio (es. portale.tuaazienda.it)
3. Configura i DNS come indicato

### SSL
- Vercel fornisce automaticamente certificati SSL gratuiti

### Variabili d'Ambiente di Produzione
Se hai bisogno di variabili diverse per produzione:
1. Vai su Settings → Environment Variables
2. Seleziona "Production" come ambiente
3. Aggiungi/modifica le variabili

## 4. Aggiornamenti

### Automatici (con GitHub)
Ogni push su `main` triggerà automaticamente un nuovo deploy

### Manuali (con CLI)
```bash
vercel --prod
```

## 5. Monitoraggio

### Analytics
Vercel fornisce analytics di base gratuiti:
- Vai su Analytics nel dashboard
- Monitora performance e visite

### Logs
- Vai su Functions → Logs per vedere i log in tempo reale

## 6. Troubleshooting

### Build Failed
- Controlla i log di build in Vercel
- Verifica che tutte le dipendenze siano in `package.json`
- Assicurati che le variabili d'ambiente siano configurate

### 500 Errors
- Controlla che le variabili d'ambiente siano corrette
- Verifica la connessione a Supabase
- Controlla i log delle funzioni

### Performance Issues
- Abilita ISR (Incremental Static Regeneration) per pagine statiche
- Ottimizza le immagini con `next/image`
- Usa la cache di Vercel Edge

## 7. Costi

### Piano Free
- 100GB di bandwidth al mese
- Builds illimitati
- SSL automatico
- Perfetto per iniziare

### Piano Pro ($20/mese)
- Bandwidth illimitato
- Team collaboration
- Support prioritario
- Analytics avanzati

## 8. Alternative a Vercel

### Netlify
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Railway
- Deploy diretto da GitHub
- Database PostgreSQL incluso
- Scaling automatico

### Render
- Similar pricing a Vercel
- Good per full-stack apps
- PostgreSQL disponibile

## Link Utili

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
