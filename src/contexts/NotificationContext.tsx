'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

// Tipo di notifica
export interface Notification {
  id: string
  user_id: string
  type: 'request' | 'approval' | 'rejection' | 'vehicle' | 'warning' | 'info' | 'system'
  title: string
  message: string
  created_at: string
  read: boolean
  metadata?: any // Dati aggiuntivi (es. request_id, vehicle_id, etc.)
  action_url?: string // URL per navigare all'elemento correlato
}

// Tipo per creare una notifica
export interface CreateNotification {
  user_id: string
  type: Notification['type']
  title: string
  message: string
  metadata?: any
  action_url?: string
}

// Tipo del context
interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  addNotification: (notification: CreateNotification) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  clearAllNotifications: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

// Crea il context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Hook per usare il context
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Provider del context
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null)

  // Ottieni l'utente corrente
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()

    // Ascolta i cambiamenti di autenticazione
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  // Carica le notifiche dal database
  const fetchNotifications = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle notifiche')
    } finally {
      setLoading(false)
    }
  }

  // Setup real-time subscription
  useEffect(() => {
    if (!userId) return

    // Carica notifiche iniziali
    fetchNotifications()

    // Configura real-time subscription
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received:', payload)
          const newNotification = payload.new as Notification
          
          // Aggiungi la nuova notifica all'inizio dell'array
          setNotifications(prev => [newNotification, ...prev])
          
          // Mostra una toast notification
          showToastNotification(newNotification)
          
          // Se supportato, mostra una notifica del browser
          showBrowserNotification(newNotification)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          setNotifications(prev =>
            prev.map(notif =>
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const deletedId = payload.old.id
          setNotifications(prev => prev.filter(notif => notif.id !== deletedId))
        }
      )
      .subscribe()

    setRealtimeChannel(channel)

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userId])

  // Conta notifiche non lette
  const unreadCount = notifications.filter(n => !n.read).length

  // Aggiungi una nuova notifica
  const addNotification = async (notification: CreateNotification) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([notification])

      if (error) throw error
    } catch (err) {
      console.error('Error adding notification:', err)
      throw err
    }
  }

  // Segna come letta
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error
      
      // Aggiorna immediatamente lo stato locale
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
      setError(err instanceof Error ? err.message : 'Errore nel segnare la notifica come letta')
      throw err
    }
  }

  // Segna tutte come lette
  const markAllAsRead = async () => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) throw error
      
      // Aggiorna immediatamente lo stato locale
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      )
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      setError(err instanceof Error ? err.message : 'Errore nel segnare tutte le notifiche come lette')
      throw err
    }
  }

  // Elimina notifica
  const deleteNotification = async (id: string) => {
    try {
      console.log('Attempting to delete notification:', id)
      
      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .select()

      if (error) {
        console.error('Supabase delete error:', error)
        throw error
      }
      
      console.log('Notification deleted from database:', data)
      
      // Aggiorna immediatamente lo stato locale
      setNotifications(prev => prev.filter(notif => notif.id !== id))
    } catch (err) {
      console.error('Error deleting notification:', err)
      setError(err instanceof Error ? err.message : 'Errore nella cancellazione della notifica')
      // Non rilanciare l'errore per non bloccare l'UI
      // throw err
    }
  }

  // Elimina tutte le notifiche
  const clearAllNotifications = async () => {
    if (!userId) {
      console.error('clearAllNotifications: No userId available')
      return
    }

    try {
      console.log('Attempting to clear all notifications for user:', userId)
      
      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .select()

      if (error) {
        console.error('Supabase delete error:', error)
        throw error
      }
      
      console.log('Notifications deleted from database:', data)
      
      // Aggiorna immediatamente lo stato locale
      setNotifications([])
    } catch (err) {
      console.error('Error clearing notifications:', err)
      setError(err instanceof Error ? err.message : 'Errore nella cancellazione delle notifiche')
      // Non rilanciare l'errore per non bloccare l'UI
      // throw err
    }
  }

  // Refresh notifiche
  const refreshNotifications = async () => {
    await fetchNotifications()
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// Funzione helper per mostrare toast notification
function showToastNotification(notification: Notification) {
  // Questa funzione verrà implementata con il componente Toast
  if (typeof window !== 'undefined' && window.showToast) {
    window.showToast({
      type: notification.type === 'approval' ? 'success' : 
            notification.type === 'rejection' ? 'error' : 
            notification.type === 'warning' ? 'warning' : 'info',
      title: notification.title,
      message: notification.message,
      duration: 5000
    })
  }
}

// Funzione helper per mostrare notifica del browser
async function showBrowserNotification(notification: Notification) {
  if (typeof window === 'undefined' || !('Notification' in window)) return

  // Richiedi permesso se non già concesso
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }

  // Mostra notifica se permesso concesso
  if (Notification.permission === 'granted') {
    const browserNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: notification.id,
      requireInteraction: notification.type === 'warning' || notification.type === 'rejection'
    })

    // Gestisci click sulla notifica
    browserNotif.onclick = () => {
      window.focus()
      if (notification.action_url) {
        window.location.href = notification.action_url
      }
      browserNotif.close()
    }
  }
}

// Esporta funzione helper per creare notifiche da altri componenti
export async function createNotification(notification: CreateNotification) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([notification])

    if (error) throw error
    return { success: true }
  } catch (err) {
    console.error('Error creating notification:', err)
    return { success: false, error: err }
  }
}