'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Settings as SettingsIcon, Bell, Mail, Shield, Database, Palette, Globe, Check, AlertCircle, Loader2 } from 'lucide-react'

// Tipo per le impostazioni
interface AppSettings {
  notifications: {
    emailEnabled: boolean
    pushEnabled: boolean
  }
  email: {
    notificationEmail: string
    digestFrequency: 'immediate' | 'daily' | 'weekly' | 'never'
  }
  security: {
    sessionTimeout: number
    twoFactorEnabled: boolean
  }
  database: {
    autoBackupEnabled: boolean
  }
  appearance: {
    primaryColor: string
    fontSize: 'small' | 'normal' | 'large'
  }
}

// Impostazioni di default
const defaultSettings: AppSettings = {
  notifications: {
    emailEnabled: true,
    pushEnabled: false
  },
  email: {
    notificationEmail: '',
    digestFrequency: 'immediate'
  },
  security: {
    sessionTimeout: 30,
    twoFactorEnabled: false
  },
  database: {
    autoBackupEnabled: true
  },
  appearance: {
    primaryColor: 'blue',
    fontSize: 'normal'
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  // Stati per le impostazioni
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [originalSettings, setOriginalSettings] = useState<AppSettings>(defaultSettings)

  // Carica le impostazioni salvate
  useEffect(() => {
    loadSettings()
  }, [])

  // Monitora i cambiamenti
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(originalSettings))
  }, [settings, originalSettings])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // Ottieni l'utente corrente
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        
        // Carica le impostazioni dal database
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Errore nel caricamento delle impostazioni:', error)
          throw error
        }
        
        if (data) {
          // Converti i dati del database nel formato delle impostazioni
          const loadedSettings: AppSettings = {
            notifications: {
              emailEnabled: data.email_notifications_enabled ?? true,
              pushEnabled: data.push_notifications_enabled ?? false
            },
            email: {
              notificationEmail: data.notification_email || user.email || '',
              digestFrequency: data.digest_frequency || 'immediate'
            },
            security: {
              sessionTimeout: data.session_timeout || 30,
              twoFactorEnabled: data.two_factor_enabled || false
            },
            database: {
              autoBackupEnabled: data.auto_backup_enabled ?? true
            },
            appearance: {
              primaryColor: data.primary_color || 'blue',
              fontSize: data.font_size || 'normal'
            }
          }
          
          setSettings(loadedSettings)
          setOriginalSettings(loadedSettings)
          
          // Applica le impostazioni di aspetto salvate
          applyAppearanceSettings(loadedSettings.appearance)
        } else {
          // Se non ci sono impostazioni salvate, usa quelle di default con l'email dell'utente
          const defaultWithEmail = {
            ...defaultSettings,
            email: {
              ...defaultSettings.email,
              notificationEmail: user.email || ''
            }
          }
          setSettings(defaultWithEmail)
          setOriginalSettings(defaultWithEmail)
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento delle impostazioni:', error)
      setMessage({ type: 'error', text: 'Errore nel caricamento delle impostazioni' })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!userId) {
      setMessage({ type: 'error', text: 'Utente non autenticato' })
      return
    }
    
    setSaving(true)
    setMessage(null)
    
    try {
      // Se le notifiche push sono abilitate, richiedi il permesso
      if (settings.notifications.pushEnabled && 'Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setSettings(prev => ({
            ...prev,
            notifications: {
              ...prev.notifications,
              pushEnabled: false
            }
          }))
          setMessage({ type: 'error', text: 'Permesso notifiche push negato' })
          setSaving(false)
          return
        }
      }

      // Prepara i dati per il database
      const dataToSave = {
        user_id: userId,
        email_notifications_enabled: settings.notifications.emailEnabled,
        push_notifications_enabled: settings.notifications.pushEnabled,
        notification_email: settings.email.notificationEmail,
        digest_frequency: settings.email.digestFrequency,
        session_timeout: settings.security.sessionTimeout,
        two_factor_enabled: settings.security.twoFactorEnabled,
        auto_backup_enabled: settings.database.autoBackupEnabled,
        primary_color: settings.appearance.primaryColor,
        font_size: settings.appearance.fontSize
      }

      // Salva nel database usando upsert (insert o update)
      const { error } = await supabase
        .from('user_settings')
        .upsert(dataToSave, {
          onConflict: 'user_id'
        })

      if (error) throw error

      // Applica le impostazioni di aspetto
      applyAppearanceSettings(settings.appearance)
      
      // Salva anche in localStorage come backup
      localStorage.setItem('portalSettings', JSON.stringify(settings))
      
      setOriginalSettings(settings)
      setMessage({ type: 'success', text: 'Impostazioni salvate con successo!' })
      
      // Nascondi il messaggio dopo 3 secondi
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      console.error('Errore nel salvataggio:', error)
      setMessage({ type: 'error', text: error.message || 'Errore nel salvataggio delle impostazioni' })
    } finally {
      setSaving(false)
    }
  }

  const applyAppearanceSettings = (appearance: AppSettings['appearance']) => {
    // Applica il colore primario
    const root = document.documentElement
    const colors = {
      blue: { h: 217, s: 91, l: 60 },
      purple: { h: 262, s: 83, l: 58 },
      green: { h: 142, s: 71, l: 45 },
      red: { h: 0, s: 84, l: 60 },
      yellow: { h: 45, s: 93, l: 47 }
    }
    
    if (colors[appearance.primaryColor as keyof typeof colors]) {
      const color = colors[appearance.primaryColor as keyof typeof colors]
      // Qui potresti aggiornare le variabili CSS per il colore primario
      // Per ora lo salviamo solo
    }
    
    // Applica la dimensione del font
    switch (appearance.fontSize) {
      case 'small':
        root.style.fontSize = '14px'
        break
      case 'large':
        root.style.fontSize = '18px'
        break
      default:
        root.style.fontSize = '16px'
    }
  }

  const resetSettings = () => {
    if (confirm('Sei sicuro di voler ripristinare le impostazioni predefinite?')) {
      setSettings(defaultSettings)
      setMessage({ type: 'success', text: 'Impostazioni ripristinate' })
    }
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('Hai modifiche non salvate. Vuoi davvero uscire?')) {
        router.back()
      }
    } else {
      router.back()
    }
  }

  const runManualBackup = async () => {
    setSaving(true)
    try {
      // In produzione, qui chiameresti una edge function per il backup
      // Per ora simuliamo l'operazione
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Potresti anche salvare un log nel database
      await supabase
        .from('email_logs') // Usiamo la tabella logs esistente come esempio
        .insert({
          to_email: settings.email.notificationEmail || 'system',
          template: 'backup',
          subject: 'Backup manuale eseguito',
          status: 'completed',
          metadata: { type: 'manual_backup', timestamp: new Date().toISOString() }
        })
      
      setMessage({ type: 'success', text: 'Backup completato con successo!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Errore durante il backup' })
    } finally {
      setSaving(false)
    }
  }

  const cleanOldLogs = async () => {
    if (!confirm('Questa operazione eliminerà tutti i log più vecchi di 90 giorni. Continuare?')) return
    
    setSaving(true)
    try {
      // Calcola la data di 90 giorni fa
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      
      // Elimina i vecchi log
      const { error, count } = await supabase
        .from('email_logs')
        .delete()
        .lt('sent_at', ninetyDaysAgo.toISOString())
        .select('count')
      
      if (error) throw error
      
      setMessage({ type: 'success', text: `Log puliti con successo! ${count || 0} record eliminati.` })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Errore nella pulizia dei log' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container-responsive py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="container-responsive py-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Impostazioni</h1>
          <p className="text-text-secondary">Configura le preferenze del portale aziendale</p>
        </div>

        {/* Messaggio di feedback */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 animate-slideInUp ${
            message.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifiche */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifiche</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gestisci come ricevere le notifiche</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Notifiche Email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ricevi notifiche via email per eventi importanti</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailEnabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      emailEnabled: e.target.checked
                    }
                  }))}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Notifiche Push</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ricevi notifiche push nel browser</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.pushEnabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      pushEnabled: e.target.checked
                    }
                  }))}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configurazione email per le notifiche</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email di notifica
                </label>
                <input
                  type="email"
                  value={settings.email.notificationEmail}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    email: {
                      ...prev.email,
                      notificationEmail: e.target.value
                    }
                  }))}
                  className="input-field"
                  placeholder="esempio@azienda.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequenza digest
                </label>
                <select 
                  value={settings.email.digestFrequency}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    email: {
                      ...prev.email,
                      digestFrequency: e.target.value as AppSettings['email']['digestFrequency']
                    }
                  }))}
                  className="input-field"
                >
                  <option value="immediate">Immediato</option>
                  <option value="daily">Giornaliero</option>
                  <option value="weekly">Settimanale</option>
                  <option value="never">Mai</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sicurezza */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sicurezza</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Opzioni di sicurezza e privacy</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeout sessione (minuti)
                </label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: {
                      ...prev.security,
                      sessionTimeout: parseInt(e.target.value) || 30
                    }
                  }))}
                  className="input-field"
                  min="5"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Autenticazione a due fattori
                </label>
                <button 
                  className="btn-secondary"
                  onClick={() => alert('Funzionalità 2FA in arrivo!')}
                >
                  {settings.security.twoFactorEnabled ? 'Gestisci 2FA' : 'Configura 2FA'}
                </button>
              </div>
            </div>
          </div>

          {/* Database */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Database</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Backup e manutenzione database</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Backup automatico</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Esegui backup giornaliero alle 3:00</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.database.autoBackupEnabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    database: {
                      ...prev.database,
                      autoBackupEnabled: e.target.checked
                    }
                  }))}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>

              <div className="pt-4 space-y-2">
                <button 
                  onClick={runManualBackup}
                  disabled={saving}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Backup in corso...
                    </>
                  ) : (
                    'Esegui backup manuale'
                  )}
                </button>
                <button 
                  onClick={cleanOldLogs}
                  disabled={saving}
                  className="btn-danger w-full"
                >
                  Pulisci log vecchi
                </button>
              </div>
            </div>
          </div>

          {/* Aspetto */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Aspetto</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Personalizza l'interfaccia</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Colore primario
                </label>
                <div className="flex gap-2">
                  {['blue', 'purple', 'green', 'red', 'yellow'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        appearance: {
                          ...prev.appearance,
                          primaryColor: color
                        }
                      }))}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        settings.appearance.primaryColor === color 
                          ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: `var(--color-${color}-600, ${color})` }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dimensione font
                </label>
                <select 
                  value={settings.appearance.fontSize}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    appearance: {
                      ...prev.appearance,
                      fontSize: e.target.value as AppSettings['appearance']['fontSize']
                    }
                  }))}
                  className="input-field"
                >
                  <option value="small">Piccolo</option>
                  <option value="normal">Normale</option>
                  <option value="large">Grande</option>
                </select>
              </div>
            </div>
          </div>

          {/* Azioni */}
          <div className="flex justify-between items-center pt-6">
            <button
              onClick={resetSettings}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Ripristina predefinite
            </button>
            
            <div className="flex gap-4">
              <button 
                onClick={handleCancel}
                className="btn-secondary"
              >
                Annulla
              </button>
              <button 
                onClick={saveSettings}
                disabled={saving || !hasChanges}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Salva modifiche
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
