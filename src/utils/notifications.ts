import { supabase } from '@/lib/supabase'
import { CreateNotification } from '@/contexts/NotificationContext'

// Tipi di eventi che generano notifiche
export type NotificationEvent = 
  | 'request_created'
  | 'request_approved' 
  | 'request_rejected'
  | 'vehicle_expiry_warning'
  | 'vehicle_expired'
  | 'vehicle_assigned'
  | 'user_created'
  | 'user_role_changed'

// Template per i messaggi di notifica
const notificationTemplates = {
  request_created: {
    title: 'Nuova richiesta di risorse',
    message: 'È stata creata una nuova richiesta di {resource_type} da {location}'
  },
  request_approved: {
    title: 'Richiesta approvata',
    message: 'La tua richiesta di {resource_type} è stata approvata'
  },
  request_rejected: {
    title: 'Richiesta rifiutata', 
    message: 'La tua richiesta di {resource_type} è stata rifiutata'
  },
  vehicle_expiry_warning: {
    title: 'Scadenza imminente',
    message: 'Il veicolo {license_plate} ha una scadenza {expiry_type} tra {days} giorni'
  },
  vehicle_expired: {
    title: 'Scadenza superata',
    message: 'Il veicolo {license_plate} ha superato la scadenza {expiry_type}'
  },
  vehicle_assigned: {
    title: 'Veicolo assegnato',
    message: 'Ti è stato assegnato il veicolo {license_plate}'
  },
  user_created: {
    title: 'Benvenuto nel portale',
    message: 'Il tuo account è stato creato con successo'
  },
  user_role_changed: {
    title: 'Ruolo modificato',
    message: 'Il tuo ruolo è stato cambiato in {new_role}'
  }
}

// Funzione per creare notifiche basate su eventi
export async function createEventNotification(
  event: NotificationEvent,
  userId: string,
  data: Record<string, any>
) {
  const template = notificationTemplates[event]
  if (!template) return

  // Sostituisci i placeholder nel messaggio
  let message = template.message
  Object.keys(data).forEach(key => {
    message = message.replace(`{${key}}`, data[key])
  })

  const notification: CreateNotification = {
    user_id: userId,
    type: getNotificationType(event),
    title: template.title,
    message,
    metadata: data,
    action_url: getActionUrl(event, data)
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .insert([notification])

    if (error) throw error
    
    // Se è una notifica importante, invia anche email
    if (shouldSendEmail(event)) {
      await sendEmailNotification(userId, notification)
    }

    return { success: true }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error }
  }
}

// Determina il tipo di notifica basato sull'evento
function getNotificationType(event: NotificationEvent): CreateNotification['type'] {
  const typeMap: Record<NotificationEvent, CreateNotification['type']> = {
    request_created: 'request',
    request_approved: 'approval',
    request_rejected: 'rejection',
    vehicle_expiry_warning: 'warning',
    vehicle_expired: 'warning',
    vehicle_assigned: 'vehicle',
    user_created: 'system',
    user_role_changed: 'info'
  }
  return typeMap[event]
}

// Genera URL per navigare all'elemento correlato
function getActionUrl(event: NotificationEvent, data: Record<string, any>): string | undefined {
  switch (event) {
    case 'request_created':
    case 'request_approved':
    case 'request_rejected':
      return data.request_id ? `/resources?id=${data.request_id}` : '/resources'
    case 'vehicle_expiry_warning':
    case 'vehicle_expired':
    case 'vehicle_assigned':
      return data.vehicle_id ? `/vehicles/${data.vehicle_id}` : '/vehicles'
    default:
      return undefined
  }
}

// Determina se inviare email per questo evento
function shouldSendEmail(event: NotificationEvent): boolean {
  const emailEvents: NotificationEvent[] = [
    'request_approved',
    'request_rejected',
    'vehicle_expired',
    'user_created'
  ]
  return emailEvents.includes(event)
}

// Funzione per inviare email (da implementare con Edge Functions)
async function sendEmailNotification(userId: string, notification: CreateNotification) {
  try {
    // Ottieni i dati dell'utente
    const { data: userData } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!userData) return

    // Chiama Edge Function per inviare email
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: userData.email,
        subject: notification.title,
        template: 'notification',
        data: {
          name: userData.full_name,
          title: notification.title,
          message: notification.message,
          action_url: notification.action_url
        }
      }
    })

    if (error) throw error
  } catch (error) {
    console.error('Error sending email notification:', error)
  }
}

// Funzione per controllare scadenze veicoli
export async function checkVehicleExpiries() {
  try {
    const today = new Date()
    const warningDate = new Date()
    warningDate.setDate(today.getDate() + 7) // Avvisa 7 giorni prima

    // Ottieni veicoli con scadenze imminenti
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('*, assigned_to')
      .or(`insurance_expiry.lte.${warningDate.toISOString()},tax_expiry.lte.${warningDate.toISOString()},inspection_expiry.lte.${warningDate.toISOString()}`)

    if (!vehicles) return

    for (const vehicle of vehicles) {
      const expiries = [
        { type: 'assicurazione', date: new Date(vehicle.insurance_expiry) },
        { type: 'bollo', date: new Date(vehicle.tax_expiry) },
        { type: 'revisione', date: new Date(vehicle.inspection_expiry) }
      ]

      for (const expiry of expiries) {
        const daysUntilExpiry = Math.floor((expiry.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilExpiry <= 0) {
          // Scaduto
          await createEventNotification('vehicle_expired', vehicle.assigned_to || '', {
            vehicle_id: vehicle.id,
            license_plate: vehicle.license_plate,
            expiry_type: expiry.type
          })
        } else if (daysUntilExpiry <= 7) {
          // In scadenza
          await createEventNotification('vehicle_expiry_warning', vehicle.assigned_to || '', {
            vehicle_id: vehicle.id,
            license_plate: vehicle.license_plate,
            expiry_type: expiry.type,
            days: daysUntilExpiry
          })
        }
      }
    }
  } catch (error) {
    console.error('Error checking vehicle expiries:', error)
  }
}

// Funzione per notificare manager/admin di nuove richieste
export async function notifyManagersOfNewRequest(request: any) {
  try {
    // Ottieni tutti i manager e admin
    const { data: managers } = await supabase
      .from('users')
      .select('id')
      .in('role', ['manager', 'admin'])

    if (!managers) return

    // Crea notifica per ogni manager/admin
    for (const manager of managers) {
      await createEventNotification('request_created', manager.id, {
        request_id: request.id,
        resource_type: request.resource_type,
        location: request.location?.name || 'Non specificata'
      })
    }
  } catch (error) {
    console.error('Error notifying managers:', error)
  }
}