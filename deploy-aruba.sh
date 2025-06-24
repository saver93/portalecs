#!/bin/bash
# deploy-aruba.sh - Script automatico di deployment per Aruba VPS
# Esegui con: bash deploy-aruba.sh

set -e  # Esci in caso di errore

echo "🚀 Deploy Automatico Portale Aziendale su Aruba VPS"
echo "=================================================="
echo ""

# Variabili configurabili
APP_DIR="/var/www/portale"
REPO_URL="https://github.com/tuouser/portale-aziendale.git"  # CAMBIA CON IL TUO REPO
NODE_VERSION="18"

# Colori per output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funzione per stampare successo
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Funzione per stampare errore
error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# 1. Verifica se eseguito come root o sudo
if [[ $EUID -eq 0 ]]; then
   echo "⚠️  Non eseguire questo script come root. Usa un utente normale con sudo."
   exit 1
fi

# 2. Aggiornamento sistema
echo "📦 Aggiornamento sistema..."
sudo apt update && sudo apt upgrade -y || error "Impossibile aggiornare il sistema"
success "Sistema aggiornato"

# 3. Installazione Node.js
echo "📦 Installazione Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs || error "Impossibile installare Node.js"
    success "Node.js installato ($(node -v))"
else
    success "Node.js già installato ($(node -v))"
fi

# 4. Installazione dipendenze globali
echo "📦 Installazione PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2 || error "Impossibile installare PM2"
    success "PM2 installato"
else
    success "PM2 già installato"
fi

# 5. Installazione Nginx
echo "📦 Installazione Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx || error "Impossibile installare Nginx"
    success "Nginx installato"
else
    success "Nginx già installato"
fi

# 6. Installazione Git
echo "📦 Installazione Git..."
if ! command -v git &> /dev/null; then
    sudo apt install -y git || error "Impossibile installare Git"
    success "Git installato"
else
    success "Git già installato"
fi

# 7. Creazione directory app
echo "📁 Preparazione directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
success "Directory creata: $APP_DIR"

# 8. Clone o update repository
echo "📥 Download codice sorgente..."
if [ -d "$APP_DIR/.git" ]; then
    echo "Repository già esistente, aggiornamento..."
    cd $APP_DIR
    git pull origin main || error "Impossibile aggiornare repository"
    success "Repository aggiornato"
else
    echo "Clonazione repository..."
    git clone $REPO_URL $APP_DIR || error "Impossibile clonare repository"
    success "Repository clonato"
fi

# 9. Setup variabili ambiente
cd $APP_DIR
if [ ! -f ".env.production.local" ]; then
    echo ""
    echo "⚠️  File .env.production.local non trovato!"
    echo "Creazione guidata del file di configurazione..."
    echo ""
    
    read -p "Inserisci NEXT_PUBLIC_SUPABASE_URL: " SUPABASE_URL
    read -p "Inserisci NEXT_PUBLIC_SUPABASE_ANON_KEY: " SUPABASE_KEY
    
    cat > .env.production.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY
EOF
    
    success "File .env.production.local creato"
else
    success "File .env.production.local già presente"
fi

# 10. Installazione dipendenze
echo "📦 Installazione dipendenze npm..."
npm install --production || error "Impossibile installare dipendenze"
success "Dipendenze installate"

# 11. Build applicazione
echo "🔨 Build applicazione..."
npm run build || error "Build fallito"
success "Build completato"

# 12. Setup PM2
echo "⚙️  Configurazione PM2..."
pm2 stop portale-aziendale 2>/dev/null || true
pm2 delete portale-aziendale 2>/dev/null || true

if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js || error "Impossibile avviare app con PM2"
else
    pm2 start npm --name "portale-aziendale" -- start || error "Impossibile avviare app con PM2"
fi

pm2 save
pm2 startup systemd -u $USER --hp $HOME | grep sudo | bash
success "PM2 configurato"

# 13. Configurazione Nginx
echo "🌐 Configurazione Nginx..."
if [ -f "nginx-portale.conf" ]; then
    sudo cp nginx-portale.conf /etc/nginx/sites-available/portale
    sudo ln -sf /etc/nginx/sites-available/portale /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test configurazione
    sudo nginx -t || error "Configurazione Nginx non valida"
    sudo systemctl restart nginx
    success "Nginx configurato"
else
    echo "⚠️  File nginx-portale.conf non trovato, configurazione manuale necessaria"
fi

# 14. Configurazione firewall
echo "🔥 Configurazione firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
success "Firewall configurato"

# 15. Informazioni finali
echo ""
echo "=================================================="
echo -e "${GREEN}✅ DEPLOYMENT COMPLETATO!${NC}"
echo "=================================================="
echo ""
echo "📌 Informazioni importanti:"
echo "   - App in esecuzione su: http://$(hostname -I | awk '{print $1}'):3000"
echo "   - Nginx proxy su: http://$(hostname -I | awk '{print $1}')"
echo ""
echo "📝 Prossimi passi:"
echo "   1. Configura il dominio puntando all'IP: $(hostname -I | awk '{print $1}')"
echo "   2. Abilita SSL con: sudo certbot --nginx -d tuodominio.it"
echo "   3. Aggiorna Supabase con il nuovo URL"
echo ""
echo "🔧 Comandi utili:"
echo "   - Logs app: pm2 logs"
echo "   - Stato app: pm2 status"
echo "   - Riavvia app: pm2 restart portale-aziendale"
echo "   - Logs Nginx: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "💡 Per aggiornamenti futuri, esegui di nuovo questo script!"
