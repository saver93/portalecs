import { useToast } from '@/components/Toast'
import { createEventNotification } from '@/utils/notifications'
import { supabase } from '@/lib/supabase'

export function useNotificationActions() {
  const { showToast } = useToast()

  // Notifica quando una richiesta viene approvata/rifiutata
  const notifyRequestStatusChange = async (
    requestId: string, 
    newStatus: 'approved' | 'rejected',
    requestData: any
  ) => {
    try {
      // Ottieni i dati della richiesta se non forniti
      if (!requestData) {
        const { data } = await supabase
          .from('resource_requests')
          .select('*, location:locations(name), requested_by')
          .eq('id', requestId)
          .single()
        
        if (!data) return
        requestData = data
      }

      // Crea notifica per l'utente che ha fatto la richiesta
      await createEventNotification(
        newStatus === 'approved' ? 'request_approved' : 'request_rejected',
        requestData.requested_by,
        {
          request_id: requestId,
          resource_type: requestData.resource_type,
          location: requestData.location?.name
        }
      )

      showToast({
        type: 'success',
        title: 'Notifica inviata',
        message: `L'utente è stato notificato del ${newStatus === 'approved' ? 'approvazione' : 'rifiuto'}`
      })
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  // Notifica quando viene creata una nuova richiesta
  const notifyNewRequest = async (requestData: any) => {
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
          request_id: requestData.id,
          resource_type: requestData.resource_type,
          location: requestData.location?.name || 'Non specificata',
          urgency: requestData.urgency
        })
      }
    } catch (error) {
      console.error('Error notifying managers:', error)
    }
  }

  // Notifica assegnazione veicolo
  const notifyVehicleAssignment = async (
    vehicleId: string,
    assignedToId: string,
    vehicleData: any
  ) => {
    try {
      await createEventNotification('vehicle_assigned', assignedToId, {
        vehicle_id: vehicleId,
        license_plate: vehicleData.license_plate,
        brand: vehicleData.brand,
        model: vehicleData.model
      })

      showToast({
        type: 'success',
        title: 'Notifica inviata',
        message: 'L\'utente è stato notificato dell\'assegnazione del veicolo'
      })
    } catch (error) {
      console.error('Error sending vehicle assignment notification:', error)
    }
  }

  // Notifica cambio ruolo utente
  const notifyUserRoleChange = async (
    userId: string,
    newRole: string,
    oldRole: string
  ) => {
    try {
      await createEventNotification('user_role_changed', userId, {
        new_role: newRole,
        old_role: oldRole
      })
    } catch (error) {
      console.error('Error sending role change notification:', error)
    }
  }

  // Controlla e notifica scadenze veicoli
  const checkAndNotifyVehicleExpiries = async () => {
    try {
      const today = new Date()
      const warningDate = new Date()
      warningDate.setDate(today.getDate() + 7) // Avvisa 7 giorni prima

      // Ottieni veicoli con scadenze imminenti
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*, assigned_to')
        .or(`insurance_expiry.lte.${warningDate.toISOString()},tax_expiry.lte.${warningDate.toISOString()},inspection_expiry.lte.${warningDate.toISOString()}`)
        .not('assigned_to', 'is', null)

      if (!vehicles) return

      for (const vehicle of vehicles) {
        const expiries = [
          { type: 'assicurazione', date: new Date(vehicle.insurance_expiry) },
          { type: 'bollo', date: new Date(vehicle.tax_expiry) },
          { type: 'revisione', date: new Date(vehicle.inspection_expiry) }
        ]

        for (const expiry of expiries) {
          const daysUntilExpiry = Math.floor((expiry.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          // Controlla se non esiste già una notifica recente per questa scadenza
          const { data: existingNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', vehicle.assigned_to)
            .eq('metadata->>vehicle_id', vehicle.id)
            .eq('metadata->>expiry_type', expiry.type)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .single()

          if (!existingNotification) {
            if (daysUntilExpiry <= 0) {
              // Scaduto
              await createEventNotification('vehicle_expired', vehicle.assigned_to, {
                vehicle_id: vehicle.id,
                license_plate: vehicle.license_plate,
                expiry_type: expiry.type
              })
            } else if (daysUntilExpiry <= 7) {
              // In scadenza
              await createEventNotification('vehicle_expiry_warning', vehicle.assigned_to, {
                vehicle_id: vehicle.id,
                license_plate: vehicle.license_plate,
                expiry_type: expiry.type,
                days: daysUntilExpiry
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking vehicle expiries:', error)
    }
  }

  return {
    notifyRequestStatusChange,
    notifyNewRequest,
    notifyVehicleAssignment,
    notifyUserRoleChange,
    checkAndNotifyVehicleExpiries
  }
}