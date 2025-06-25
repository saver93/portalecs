import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  try {
    console.log('🔄 Avvio controllo scadenze veicoli...')
    
    // 1. Chiama la funzione SQL per controllare le scadenze
    const { error: checkError } = await supabase.rpc('check_vehicle_expiries')
    
    if (checkError) {
      console.error('Errore nel controllo scadenze:', checkError)
      
      // Fallback: controlla manualmente
      await checkVehicleExpiriesManually()
    }
    
    // 2. Pulisci notifiche vecchie (opzionale)
    await cleanupOldNotifications()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Controllo scadenze completato',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Errore durante il controllo scadenze:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function checkVehicleExpiriesManually() {
  const today = new Date()
  const warningDate = new Date()
  warningDate.setDate(today.getDate() + 7) // Avvisa 7 giorni prima
  
  // Ottieni veicoli con scadenze imminenti
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*, assigned_to')
    .or(`insurance_expiry.lte.${warningDate.toISOString().split('T')[0]},tax_expiry.lte.${warningDate.toISOString().split('T')[0]},inspection_expiry.lte.${warningDate.toISOString().split('T')[0]}`)
    .not('assigned_to', 'is', null)
  
  if (error) {
    console.error('Errore nel recupero veicoli:', error)
    return
  }
  
  console.log(`Trovati ${vehicles?.length || 0} veicoli con scadenze imminenti`)
  
  for (const vehicle of vehicles || []) {
    const expiries = [
      { type: 'assicurazione', date: new Date(vehicle.insurance_expiry), field: 'insurance_expiry' },
      { type: 'bollo', date: new Date(vehicle.tax_expiry), field: 'tax_expiry' },
      { type: 'revisione', date: new Date(vehicle.inspection_expiry), field: 'inspection_expiry' }
    ]
    
    for (const expiry of expiries) {
      const daysUntilExpiry = Math.floor((expiry.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry <= 7 && daysUntilExpiry >= -7) { // Avvisa da 7 giorni prima a 7 giorni dopo
        // Controlla se non esiste già una notifica recente
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', vehicle.assigned_to)
          .eq('metadata->>vehicle_id', vehicle.id)
          .eq('metadata->>expiry_type', expiry.type)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .single()
        
        if (!existingNotification) {
          const notificationType = daysUntilExpiry <= 0 ? 'warning' : 'warning'
          const title = daysUntilExpiry <= 0 
            ? `Scadenza ${expiry.type} superata!` 
            : `Scadenza ${expiry.type} imminente`
          
          const message = daysUntilExpiry <= 0
            ? `Il veicolo ${vehicle.license_plate} ha superato la scadenza ${expiry.type}`
            : `Il veicolo ${vehicle.license_plate} ha la scadenza ${expiry.type} tra ${daysUntilExpiry} giorni`
          
          // Crea notifica
          await supabase
            .from('notifications')
            .insert({
              user_id: vehicle.assigned_to,
              type: notificationType,
              title,
              message,
              metadata: {
                vehicle_id: vehicle.id,
                license_plate: vehicle.license_plate,
                expiry_type: expiry.type,
                days_until_expiry: daysUntilExpiry
              },
              action_url: `/vehicles/${vehicle.id}`
            })
          
          console.log(`📧 Notifica inviata per veicolo ${vehicle.license_plate} - ${expiry.type}`)
        }
      }
    }
  }
}

async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())
      .eq('read', true)
      .select('id')
    
    if (error) throw error
    
    console.log(`🗑️ Eliminate ${data?.length || 0} notifiche vecchie`)
  } catch (error) {
    console.error('Errore nella pulizia notifiche:', error)
  }
}