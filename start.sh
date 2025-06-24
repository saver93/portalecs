#!/bin/bash

# Script di avvio rapido per il portale aziendale

echo "🚀 Avvio Portale Aziendale v2.0"
echo "================================"

# Controlla se node_modules esiste
if [ ! -d "node_modules" ]; then
    echo "📦 Installazione dipendenze..."
    npm install
fi

# Controlla se .env.local esiste
if [ ! -f ".env.local" ]; then
    echo "⚠️  File .env.local non trovato!"
    echo "📝 Creazione template .env.local..."
    
    cat > .env.local << EOL
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Enable debug mode
# NEXT_PUBLIC_DEBUG=true
EOL
    
    echo "✅ Template creato. Configura le variabili in .env.local"
    exit 1
fi

# Controlla se le variabili sono configurate
source .env.local
if [[ "$NEXT_PUBLIC_SUPABASE_URL" == "your-project-url" ]]; then
    echo "❌ Configura le variabili Supabase in .env.local"
    exit 1
fi

# Avvia il server di sviluppo
echo "✅ Configurazione completata"
echo "🌐 Avvio server di sviluppo..."
echo "================================"

npm run dev