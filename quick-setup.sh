#!/bin/bash
# quick-setup.sh - Setup rapido per Aruba VPS
# Da eseguire come primo comando dopo l'accesso SSH

echo "🚀 Setup Rapido Portale Aziendale"
echo "================================"

# Crea utente non-root
echo "Creazione utente 'portale'..."
adduser --disabled-password --gecos "" portale
echo "portale:TuaPassword123!" | chpasswd
usermod -aG sudo portale

# Abilita accesso SSH per l'utente
mkdir -p /home/portale/.ssh
cp ~/.ssh/authorized_keys /home/portale/.ssh/ 2>/dev/null || true
chown -R portale:portale /home/portale/.ssh
chmod 700 /home/portale/.ssh
chmod 600 /home/portale/.ssh/authorized_keys 2>/dev/null || true

# Installa pacchetti base
apt update && apt upgrade -y
apt install -y curl git wget nano sudo ufw

# Setup firewall base
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

echo ""
echo "✅ Setup base completato!"
echo ""
echo "Ora esegui questi comandi:"
echo "1. su - portale"
echo "2. cd ~"
echo "3. wget https://raw.githubusercontent.com/tuouser/portale/main/deploy-aruba.sh"
echo "4. chmod +x deploy-aruba.sh"
echo "5. ./deploy-aruba.sh"
