// Scheduler per controlli periodici
// Questo file può essere eseguito come cronjob o integrato in un sistema di scheduling

import { supabase } from '@/lib/supabase'
import { checkAndNotifyVehicleExpiries } from '@/utils/notifications'

// Funzione principale per eseguire tutti i check periodici
export async function runScheduledChecks() {
  console.log('🔄 Avvio controlli schedulati...', new Date().toISOString())
  
  try {
    // 1. Controlla scadenze veicoli
    console.log('🚗 Controllo scadenze veicoli...')
    await checkVehicleExpiries()
    
    // 2. Pulizia notifiche vecchie (opzionale)
    console.log('🧹 Pulizia notifiche vecchie...')
    await cleanupOldNotifications()
    
    console.log('✅ Controlli completati con successo')
  } catch (error) {
    console.error('❌ Errore durante i controlli schedulati:', error)
  }
}

// Controlla scadenze veicoli e invia notifiche
async function checkVehicleExpiries() {
  try {
    // Chiama la funzione SQL che controlla le scadenze
    const { error } = await supabase.rpc('check_vehicle_expiries')
    
    if (error) {
      console.error('Errore nel controllo scadenze:', error)
      // Se la funzione SQL non esiste, usa il metodo TypeScript
      await checkAndNotifyVehicleExpiries()
    }
  } catch (error) {
    console.error('Errore nel controllo scadenze veicoli:', error)
  }
}

// Pulisce notifiche più vecchie di 30 giorni
async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())
      .eq('read', true) // Elimina solo quelle già lette
    
    if (error) throw error
    
    console.log(`🗑️ Eliminate ${data?.length || 0} notifiche vecchie`)
  } catch (error) {
    console.error('Errore nella pulizia notifiche:', error)
  }
}

// Se eseguito direttamente (non importato)
if (require.main === module) {
  runScheduledChecks()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}