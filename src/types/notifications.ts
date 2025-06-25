// Estendi l'interfaccia Window per includere showToast
declare global {
  interface Window {
    showToast: (toast: {
      type: 'success' | 'error' | 'warning' | 'info'
      title: string
      message?: string
      duration?: number
    }) => void
  }
}

// Tipi per le notifiche
export interface DatabaseNotification {
  id: string
  user_id: string
  type: 'request' | 'approval' | 'rejection' | 'vehicle' | 'warning' | 'info' | 'system'
  title: string
  message: string
  created_at: string
  read: boolean
  metadata?: Record<string, any>
  action_url?: string
}

export interface CreateNotificationInput {
  user_id: string
  type: DatabaseNotification['type']
  title: string
  message: string
  metadata?: Record<string, any>
  action_url?: string
}

export type NotificationEvent = 
  | 'request_created'
  | 'request_approved' 
  | 'request_rejected'
  | 'vehicle_expiry_warning'
  | 'vehicle_expired'
  | 'vehicle_assigned'
  | 'user_created'
  | 'user_role_changed'

export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose?: (id: string) => void
}

export interface EmailLog {
  id: string
  to_email: string
  template: string
  subject: string
  sent_at: string
  status: 'sent' | 'failed' | 'pending'
  resend_id?: string
  error?: string
  metadata?: Record<string, any>
}

export interface NotificationTemplate {
  title: string
  message: string
}

export interface NotificationConfig {
  TOAST_DURATION: Record<string, number>
  EXPIRY_WARNING_DAYS: number
  DUPLICATE_NOTIFICATION_INTERVAL: number
  MAX_NOTIFICATIONS_DISPLAY: number
  EMAIL_FROM: string
  EMAIL_REPLY_TO: string
  EMAIL_NOTIFICATION_TYPES: string[]
  NOTIFICATION_PRIORITY: Record<string, string>
  NOTIFICATION_ICONS: Record<string, string>
  NOTIFICATION_COLORS: Record<string, string>
}