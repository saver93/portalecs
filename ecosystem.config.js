# ecosystem.config.js - Configurazione PM2 per Aruba VPS
module.exports = {
  apps: [{
    name: 'portale-aziendale',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/portale',
    instances: 1,
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/portale-error.log',
    out_file: '/var/log/pm2/portale-out.log',
    log_file: '/var/log/pm2/portale-combined.log',
    time: true,
    // Riavvio automatico
    autorestart: true,
    max_restarts: 10,
    min_uptime: "10s",
    // Gestione memoria
    kill_timeout: 5000,
    // Monitoring
    instance_var: 'INSTANCE_ID',
    merge_logs: true
  }]
}
