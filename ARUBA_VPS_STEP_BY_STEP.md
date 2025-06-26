# 📝 ISTRUZIONI PASSO-PASSO ARUBA VPS

## 🔑 Step 3: Primo Accesso al VPS

### Da Windows (usando PuTTY):

1. **Scarica PuTTY** da: https://www.putty.org/
   - Scarica il file .exe (64-bit x86)

2. **Ricevi email da Aruba** con:
   - IP del server (es: 89.40.123.456)
   - Password root

3. **Apri PuTTY**:
   - Host Name: inserisci l'IP del VPS
   - Port: 22
   - Connection type: SSH
   - Clicca "Open"

4. **Login**:
   - login as: `root`
   - password: (quella dell'email Aruba)

### Da Mac/Linux:
```bash
ssh root@89.40.123.456
# Inserisci password quando richiesto
```

---

## 🛠️ Step 4: Setup Iniziale (Copia e Incolla)

Una volta connesso, esegui QUESTI COMANDI IN ORDINE:

### 1. Scarica lo script di setup rapido:
```bash
wget https://raw.githubusercontent.com/tuouser/portale/main/quick-setup.sh
chmod +x quick-setup.sh
./quick-setup.sh
```

### 2. Quando finisce, cambia utente:
```bash
su - portale
# Password: TuaPassword123! (o quella che hai scelto)
```

### 3. Clona il tuo progetto:
```bash
cd /home/portale
git clone https://github.com/TUO_USERNAME/portale-aziendale.git portale
cd portale
```

⚠️ **IMPORTANTE**: Sostituisci `TUO_USERNAME` con il tuo username GitHub!

### 4. Crea il file delle variabili d'ambiente:
```bash
nano .env.production.local
```

Incolla questo contenuto:
```
NEXT_PUBLIC_SUPABASE_URL=https://olaxxacwskjbvxjaeggt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYXh4YWN3c2tqYnZ4amFlZ2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2Nzg4MDQsImV4cCI6MjA2NjI1NDgwNH0.ucvxRVFwB_LUdXA0lFveOcgrneQjTBhwIJEMirRbdtk
```

Salva con: `Ctrl+X`, poi `Y`, poi `Enter`

### 5. Esegui il deploy automatico:
```bash
chmod +x deploy-aruba.sh
./deploy-aruba.sh
```

⏱️ **Questo richiederà circa 5-10 minuti**

---

## ✅ Step 5: Verifica Funzionamento

### 1. Controlla che l'app sia online:
```bash
pm2 status
# Deve mostrare: portale-aziendale │ online
```

### 2. Apri nel browser:
```
http://IP_DEL_TUO_VPS
```

Dovresti vedere la pagina di login!

---

## 🌐 Step 6: Configura il Dominio (Opzionale)

### Se hai un dominio Aruba:

1. Vai su [admin.aruba.it](https://admin.aruba.it)
2. Pannello di Controllo → Gestione DNS
3. Aggiungi record:
   ```
   Tipo: A
   Host: @ 
   Valore: IP_DEL_TUO_VPS
   TTL: 3600
   
   Tipo: A
   Host: www
   Valore: IP_DEL_TUO_VPS
   TTL: 3600
   ```
4. Salva e attendi 1-24 ore

### Poi abilita HTTPS:
```bash
sudo certbot --nginx -d tuodominio.it -d www.tuodominio.it
```

---

## 🔧 Step 7: Configura Supabase

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Project Settings → Authentication → URL Configuration
3. Aggiungi:
   - Site URL: `http://IP_VPS` (o `https://tuodominio.it`)
   - Redirect URLs: `http://IP_VPS/*` (o `https://tuodominio.it/*`)

---

## 📊 Comandi Utili Post-Installazione

### Visualizza logs:
```bash
pm2 logs
```

### Riavvia app:
```bash
pm2 restart portale-aziendale
```

### Aggiorna app:
```bash
cd /home/portale/portale
git pull
npm install
npm run build
pm2 restart portale-aziendale
```

### Controlla uso risorse:
```bash
htop  # Premi 'q' per uscire
df -h  # Spazio disco
```

---

## ⚠️ TROUBLESHOOTING

### "Errore 502 Bad Gateway"
```bash
pm2 restart portale-aziendale
sudo systemctl restart nginx
```

### "Errore npm install"
```bash
# Pulisci cache
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### "Sito non raggiungibile"
```bash
# Controlla firewall
sudo ufw status
# Controlla nginx
sudo systemctl status nginx
# Controlla app
pm2 status
```

---

## 💡 SUGGERIMENTI

1. **Salva l'IP del VPS** nel file hosts per accesso facile:
   - Windows: `C:\Windows\System32\drivers\etc\hosts`
   - Aggiungi: `89.40.123.456 portale.local`

2. **Backup regolare**:
   ```bash
   # Ogni settimana
   tar -czf backup-$(date +%Y%m%d).tar.gz /home/portale/portale
   ```

3. **Monitoraggio uptime gratuito**:
   - Usa [UptimeRobot](https://uptimerobot.com) 
   - Monitora http://TUO_IP_VPS

---

## 📞 SUPPORTO

- **Problemi VPS**: Supporto Aruba (solo infrastr.)
- **Problemi App**: Scrivi qui i messaggi di errore
- **Community**: GitHub Issues del progetto

CONSERVA QUESTE ISTRUZIONI!
