# 🚀 Guida Completa: Deploy su Aruba VPS

## 📋 Prerequisiti
- Aruba Cloud VPS (consigliato: Medium da €8.99/mese)
- Dominio (opzionale, puoi usare l'IP del VPS)
- Client SSH (PuTTY su Windows, Terminal su Mac/Linux)

## 1️⃣ Acquista e Configura VPS Aruba

### A. Acquisto VPS
1. Vai su [cloud.aruba.it](https://www.cloud.aruba.it)
2. Scegli "Cloud VPS"
3. Seleziona:
   - **Sistema Operativo**: Ubuntu 22.04 LTS
   - **Tipo**: VPS Medium (2GB RAM minimo)
   - **Datacenter**: IT1 (Arezzo) per latenza minore

### B. Primo Accesso
```bash
# Da Windows usa PuTTY, da Mac/Linux:
ssh root@TUO_IP_VPS

# Cambia password root
passwd

# Crea utente non-root
adduser portale
usermod -aG sudo portale
```

## 2️⃣ Installazione Ambiente

### A. Esegui lo script automatico
```bash
# Accedi come utente portale
su - portale

# Scarica e esegui lo script di installazione
wget https://raw.githubusercontent.com/tuouser/portale/main/aruba-vps-install.sh
chmod +x aruba-vps-install.sh
./aruba-vps-install.sh
```

### B. Oppure installa manualmente
```bash
# Aggiorna sistema
sudo apt update && sudo apt upgrade -y

# Installa Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installa PM2 (process manager)
sudo npm install -g pm2

# Installa Nginx
sudo apt install -y nginx

# Installa Git
sudo apt install -y git
```

## 3️⃣ Deploy dell'Applicazione

### A. Clona il progetto
```bash
# Crea directory
sudo mkdir -p /var/www/portale
sudo chown portale:portale /var/www/portale

# Clona repository
cd /var/www
git clone https://github.com/tuouser/portale-aziendale.git portale
cd portale
```

### B. Configura variabili d'ambiente
```bash
# Crea file .env.production.local
nano .env.production.local

# Inserisci:
NEXT_PUBLIC_SUPABASE_URL=https://olaxxacwskjbvxjaeggt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Salva con Ctrl+X, Y, Enter
```

### C. Build e avvia l'app
```bash
# Installa dipendenze
npm install

# Build per produzione
npm run build

# Test manuale
npm run start
# Verifica che funzioni su http://TUO_IP_VPS:3000
# Poi Ctrl+C per fermare
```

## 4️⃣ Configurazione PM2

### A. Crea configurazione PM2
```bash
# Crea file ecosystem.config.js
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'portale-aziendale',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/portale',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/portale-error.log',
    out_file: '/var/log/pm2/portale-out.log',
    log_file: '/var/log/pm2/portale-combined.log',
    time: true
  }]
}
```

### B. Avvia con PM2
```bash
# Crea directory logs
sudo mkdir -p /var/log/pm2
sudo chown portale:portale /var/log/pm2

# Avvia applicazione
pm2 start ecosystem.config.js

# Salva configurazione PM2
pm2 save

# Configura avvio automatico
pm2 startup
# Esegui il comando che ti viene mostrato

# Verifica stato
pm2 status
pm2 logs
```

## 5️⃣ Configurazione Nginx

### A. Crea configurazione sito
```bash
sudo nano /etc/nginx/sites-available/portale
```

```nginx
server {
    listen 80;
    server_name TUO_DOMINIO.it www.TUO_DOMINIO.it;
    # O usa l'IP se non hai dominio:
    # server_name TUO_IP_VPS;

    # Dimensione massima upload (per documenti veicoli)
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache per assets statici
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### B. Attiva il sito
```bash
# Crea link simbolico
sudo ln -s /etc/nginx/sites-available/portale /etc/nginx/sites-enabled/

# Rimuovi default
sudo rm /etc/nginx/sites-enabled/default

# Test configurazione
sudo nginx -t

# Riavvia Nginx
sudo systemctl restart nginx
```

## 6️⃣ Configurazione SSL (HTTPS)

### A. Con dominio
```bash
# Installa Certbot
sudo apt install -y certbot python3-certbot-nginx

# Ottieni certificato SSL
sudo certbot --nginx -d TUO_DOMINIO.it -d www.TUO_DOMINIO.it

# Segui le istruzioni, scegli redirect automatico HTTP->HTTPS
```

### B. Senza dominio (self-signed)
```bash
# Genera certificato self-signed
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt

# Modifica nginx config per usare SSL
```

## 7️⃣ Configurazione Firewall

```bash
# Configura UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verifica stato
sudo ufw status
```

## 8️⃣ Configurazione Dominio Aruba

Se hai comprato dominio su Aruba:

1. Vai su [admin.aruba.it](https://admin.aruba.it)
2. Gestione DNS/Domini
3. Modifica record DNS:
   ```
   Tipo: A
   Nome: @ (o vuoto)
   Valore: TUO_IP_VPS
   TTL: 3600
   
   Tipo: A  
   Nome: www
   Valore: TUO_IP_VPS
   TTL: 3600
   ```
4. Attendi 1-24 ore per propagazione DNS

## 9️⃣ Aggiornamenti e Manutenzione

### A. Script di aggiornamento
```bash
# Crea script update.sh
nano /var/www/portale/update.sh
```

```bash
#!/bin/bash
cd /var/www/portale
git pull origin main
npm install
npm run build
pm2 restart portale-aziendale
```

```bash
# Rendi eseguibile
chmod +x update.sh

# Per aggiornare:
./update.sh
```

### B. Backup automatico
```bash
# Crea script backup
sudo nano /usr/local/bin/backup-portale.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/portale"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cd /var/www/portale

# Backup files
tar -czf $BACKUP_DIR/portale_$DATE.tar.gz . \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git

# Mantieni solo ultimi 7 backup
find $BACKUP_DIR -name "portale_*.tar.gz" -mtime +7 -delete
```

```bash
# Cron per backup giornaliero
sudo crontab -e
# Aggiungi:
0 2 * * * /usr/local/bin/backup-portale.sh
```

## 🔍 Troubleshooting

### App non raggiungibile
```bash
# Verifica PM2
pm2 status
pm2 logs

# Verifica Nginx
sudo nginx -t
sudo systemctl status nginx

# Verifica porta 3000
sudo netstat -tlnp | grep 3000
```

### Errori 502 Bad Gateway
```bash
# Riavvia app
pm2 restart portale-aziendale

# Controlla logs
pm2 logs --lines 100
```

### Problemi SSL
```bash
# Rinnova certificato
sudo certbot renew --dry-run
```

## 💰 Costi Totali Aruba

- **VPS Medium**: €8.99/mese (€107.88/anno)
- **Dominio .it**: €7.99/anno (primo anno)
- **Certificato SSL**: Gratis con Let's Encrypt
- **Backup Space**: €1/mese per 100GB (opzionale)

**Totale**: ~€10-15/mese

## 🎯 Comandi Utili

```bash
# Stato servizi
pm2 status
sudo systemctl status nginx

# Logs
pm2 logs
sudo tail -f /var/log/nginx/error.log

# Riavvio servizi
pm2 restart portale-aziendale
sudo systemctl restart nginx

# Monitoraggio risorse
htop
df -h
free -m
```

## ✅ Checklist Finale

- [ ] VPS accessibile via SSH
- [ ] App raggiungibile su http://IP:3000
- [ ] Nginx proxy funzionante su porta 80
- [ ] SSL configurato (se con dominio)
- [ ] PM2 configurato per riavvio automatico
- [ ] Firewall configurato
- [ ] Backup configurato
- [ ] Supabase configurato con nuovo URL

Hai bisogno di aiuto con qualche passaggio specifico?
