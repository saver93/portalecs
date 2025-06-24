#!/bin/bash
# Script di installazione automatica per Aruba VPS
# Salva questo file come install.sh e eseguilo sul server

echo "🚀 Installazione Portale Aziendale su Aruba VPS"
echo "============================================="

# 1. Aggiorna il sistema
echo "📦 Aggiornamento sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Installa Node.js 18.x
echo "📦 Installazione Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Installa PM2 per gestire l'app
echo "📦 Installazione PM2..."
sudo npm install -g pm2

# 4. Installa Nginx
echo "📦 Installazione Nginx..."
sudo apt install -y nginx

# 5. Installa Git
echo "📦 Installazione Git..."
sudo apt install -y git

# 6. Installa Certbot per SSL
echo "📦 Installazione Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# 7. Crea directory per l'app
echo "📁 Creazione directory..."
sudo mkdir -p /var/www/portale
sudo chown $USER:$USER /var/www/portale

# 8. Configura firewall
echo "🔥 Configurazione firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Installazione base completata!"
echo ""
echo "Prossimi passi:"
echo "1. Clona il tuo repository in /var/www/portale"
echo "2. Configura le variabili d'ambiente"
echo "3. Esegui npm install e npm run build"
echo "4. Configura Nginx e PM2"
