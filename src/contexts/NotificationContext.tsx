'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Tipo di notifica
export interface Notification {
  id: number
  type: 'request' | 'approval' | 'rejection' | 'vehicle' | 'warning' | 'info'
  title: string
  message: string
  time: Date
  read: boolean
  location?: string
  priority?: 'low' | 'medium' | 'high'
}

// Tipo del context
interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void
  markAsRead: (id: number) => void
  markAllAsRead: () => void
  deleteNotification: (id: number) => void
  clearAllNotifications: () => void
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
  // Inizializza le notifiche dal localStorage o con dati di default
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notifications')
      if (saved) {
        return JSON.parse(saved, (key, value) => {
          // Converte le stringhe di date in oggetti Date
          if (key === 'time' && typeof value === 'string') {
            return new Date(value)
          }
          return value
        })
      }
    }
    
    // Dati di default se non ci sono notifiche salvate
    return [
      {
        id: 1,
        type: 'request',
        title: 'Nuova richiesta materiali',
        message: 'Richiesta di 50 unità di materiale da Milano Centro',
        time: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        location: 'Milano Centro',
        priority: 'high'
      },
      {
        id: 2,
        type: 'approval',
        title: 'Richiesta approvata',
        message: 'La tua richiesta di personale è stata approvata dal manager',
        time: new Date(Date.now() - 60 * 60 * 1000),
        read: false,
        priority: 'medium'
      },
      {
        id: 3,
        type: 'vehicle',
        title: 'Scadenza revisione',
        message: 'Il veicolo AA123BB deve essere revisionato entro 7 giorni',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        priority: 'high'
      }
    ]
  })

  // Salva le notifiche nel localStorage quando cambiano
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(notifications))
    }
  }, [notifications])

  // Conta notifiche non lette
  const unreadCount = notifications.filter(n => !n.read).length

  // Aggiungi una nuova notifica
  const addNotification = (notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      time: new Date(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  // Segna come letta
  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  // Segna tutte come lette
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  // Elimina notifica
  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  // Elimina tutte le notifiche
  const clearAllNotifications = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
