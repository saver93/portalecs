// Configurazione del sistema di notifiche

export const NOTIFICATION_CONFIG = {
  // Durata dei toast in millisecondi
  TOAST_DURATION: {
    success: 4000,
    error: 6000,
    warning: 5000,
    info: 4000
  },

  // Giorni prima della scadenza per mostrare avvisi
  EXPIRY_WARNING_DAYS: 7,

  // Intervallo minimo tra notifiche duplicate (in ore)
  DUPLICATE_NOTIFICATION_INTERVAL: 24,

  // Numero massimo di notifiche da mostrare
  MAX_NOTIFICATIONS_DISPLAY: 100,

  // Email settings
  EMAIL_FROM: 'Portale Aziendale <noreply@tuodominio.com>',
  EMAIL_REPLY_TO: 'support@tuodominio.com',

  // Tipi di notifica che inviano email
  EMAIL_NOTIFICATION_TYPES: [
    'request_approved',
    'request_rejected',
    'vehicle_expired',
    'user_created'
  ],

  // Priorità delle notifiche
  NOTIFICATION_PRIORITY: {
    request_created: 'high',
    request_approved: 'medium',
    request_rejected: 'medium',
    vehicle_expiry_warning: 'high',
    vehicle_expired: 'high',
    vehicle_assigned: 'medium',
    user_created: 'low',
    user_role_changed: 'low'
  },

  // Icone per tipo di notifica
  NOTIFICATION_ICONS: {
    request: 'Package',
    approval: 'CheckCircle',
    rejection: 'XCircle',
    vehicle: 'Car',
    warning: 'AlertTriangle',
    info: 'Info',
    system: 'Settings'
  },

  // Colori per tipo di notifica
  NOTIFICATION_COLORS: {
    request: 'blue',
    approval: 'green',
    rejection: 'red',
    vehicle: 'yellow',
    warning: 'orange',
    info: 'purple',
    system: 'gray'
  }
}

// Template per i titoli delle notifiche
export const NOTIFICATION_TITLES = {
  request_created: 'Nuova richiesta di risorse',
  request_approved: 'Richiesta approvata',
  request_rejected: 'Richiesta rifiutata',
  vehicle_expiry_warning: 'Scadenza imminente',
  vehicle_expired: 'Scadenza superata',
  vehicle_assigned: 'Veicolo assegnato',
  user_created: 'Benvenuto nel portale',
  user_role_changed: 'Ruolo modificato'
}

// Template per i messaggi delle notifiche
export const NOTIFICATION_MESSAGES = {
  request_created: 'È stata creata una nuova richiesta di {resource_type} da {location}',
  request_approved: 'La tua richiesta di {resource_type} è stata approvata',
  request_rejected: 'La tua richiesta di {resource_type} è stata rifiutata',
  vehicle_expiry_warning: 'Il veicolo {license_plate} ha una scadenza {expiry_type} tra {days} giorni',
  vehicle_expired: 'Il veicolo {license_plate} ha superato la scadenza {expiry_type}',
  vehicle_assigned: 'Ti è stato assegnato il veicolo {license_plate}',
  user_created: 'Il tuo account è stato creato con successo',
  user_role_changed: 'Il tuo ruolo è stato cambiato in {new_role}'
}

// Configurazione per le notifiche browser
export const BROWSER_NOTIFICATION_CONFIG = {
  icon: '/icon-192x192.png',
  badge: '/badge-72x72.png',
  vibrate: [200, 100, 200],
  requireInteraction: false, // true per notifiche che richiedono azione
  tag: 'portale-notification', // per raggruppare notifiche simili
}

// Permessi richiesti per le notifiche
export const REQUIRED_PERMISSIONS = {
  notifications: true,
  // push: true, // per future implementazioni push
}

// Configurazione per la pulizia automatica
export const CLEANUP_CONFIG = {
  // Elimina notifiche più vecchie di X giorni
  DELETE_AFTER_DAYS: 30,
  // Mantieni massimo X notifiche per utente
  MAX_NOTIFICATIONS_PER_USER: 500,
  // Esegui pulizia ogni X ore
  CLEANUP_INTERVAL_HOURS: 24
}