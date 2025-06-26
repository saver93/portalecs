'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, Package, Car, AlertTriangle, Info, Trash2, Check, X, Calendar, Clock, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import Badge from '@/components/Badge'
import { useNotifications } from '@/contexts/NotificationContext'

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, addNotification } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([])

  // Funzione di test per aggiungere una notifica
  const addTestNotification = () => {
    const types = ['request', 'approval', 'rejection', 'vehicle', 'warning', 'info'] as const
    const randomType = types[Math.floor(Math.random() * types.length)]
    
    const titles = {
      request: 'Nuova richiesta materiali',
      approval: 'Richiesta approvata',
      rejection: 'Richiesta rifiutata',
      vehicle: 'Avviso veicolo',
      warning: 'Attenzione',
      info: 'Informazione'
    }
    
    const messages = {
      request: 'Richiesta di materiali dal punto vendita',
      approval: 'La tua richiesta è stata approvata',
      rejection: 'La tua richiesta è stata rifiutata',
      vehicle: 'Scadenza imminente per il veicolo',
      warning: 'Azione richiesta',
      info: 'Aggiornamento del sistema'
    }
    
    addNotification({
      type: randomType,
      title: titles[randomType],
      message: messages[randomType],
      priority: Math.random() > 0.5 ? 'high' : 'medium'
    })
  }

  // Filtra notifiche
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false
    if (filter === 'read' && !notification.read) return false
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false
    return true
  })

  // Ottieni icona per tipo di notifica
  const getNotificationIcon = (type: string) => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case 'request':
        return <Package className={iconClass} />
      case 'approval':
        return <CheckCircle className={iconClass} />
      case 'rejection':
        return <X className={iconClass} />
      case 'vehicle':
        return <Car className={iconClass} />
      case 'warning':
        return <AlertTriangle className={iconClass} />
      case 'info':
        return <Info className={iconClass} />
      default:
        return <Bell className={iconClass} />
    }
  }

  // Ottieni colore per tipo di notifica
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'request':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      case 'approval':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
      case 'rejection':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
      case 'vehicle':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
      case 'warning':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
      case 'info':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
    }
  }

  // Elimina selezionate
  const deleteSelected = () => {
    selectedNotifications.forEach(id => deleteNotification(id))
    setSelectedNotifications([])
  }

  // Toggle selezione
  const toggleSelection = (id: number) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    )
  }

  // Seleziona tutte
  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  // Formatta tempo
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minut${diffInMinutes === 1 ? 'o' : 'i'} fa`
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} or${diffInHours === 1 ? 'a' : 'e'} fa`
    }
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} giorn${diffInDays === 1 ? 'o' : 'i'} fa`
    }
    
    return format(date, 'dd MMM yyyy', { locale: it })
  }

  return (
    <div className="container-responsive py-8">
      {/* Header */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Notifiche</h1>
            <p className="text-text-secondary">
              Gestisci tutte le tue notifiche in un unico posto
            </p>
          </div>
          {/* Pulsante di test (nascosto in produzione) */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={addTestNotification}
              className="btn-secondary text-sm"
              title="Aggiungi notifica di test"
            >
              + Test Notifica
            </button>
          )}
        </div>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card animate-slideInUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-sm">Totali</p>
              <p className="text-2xl font-bold text-text-primary">{notifications.length}</p>
            </div>
            <div className="p-3 bg-bg-tertiary rounded-lg">
              <Bell className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="card animate-slideInUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-sm">Non lette</p>
              <p className="text-2xl font-bold text-text-primary">{unreadCount}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="card animate-slideInUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-tertiary text-sm">Questa settimana</p>
              <p className="text-2xl font-bold text-text-primary">
                {notifications.filter(n => {
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  return n.time > weekAgo
                }).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Azioni e filtri */}
      <div className="card mb-6 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Filtri */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Filtro stato */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-tertiary" />
              <div className="flex gap-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  Tutte
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                    filter === 'unread'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  Non lette ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                    filter === 'read'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-text-secondary hover:bg-bg-tertiary'
                  }`}
                >
                  Lette
                </button>
              </div>
            </div>

            {/* Filtro tipo */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field text-sm py-1"
            >
              <option value="all">Tutti i tipi</option>
              <option value="request">Richieste</option>
              <option value="approval">Approvazioni</option>
              <option value="rejection">Rifiuti</option>
              <option value="vehicle">Veicoli</option>
              <option value="warning">Avvisi</option>
              <option value="info">Informazioni</option>
            </select>
          </div>

          {/* Azioni */}
          <div className="flex items-center gap-2">
            {selectedNotifications.length > 0 && (
              <span className="text-sm text-text-tertiary mr-2">
                {selectedNotifications.length} selezionate
              </span>
            )}
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn-secondary text-sm"
              >
                <Check className="w-4 h-4 mr-1" />
                Segna tutte come lette
              </button>
            )}

            {selectedNotifications.length > 0 && (
              <button
                onClick={deleteSelected}
                className="btn-danger text-sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Elimina selezionate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista notifiche */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="card text-center py-12 animate-fadeIn">
            <Bell className="w-16 h-16 mx-auto mb-4 text-text-tertiary opacity-20" />
            <p className="text-text-tertiary">Nessuna notifica da mostrare</p>
          </div>
        ) : (
          <>
            {/* Seleziona tutte */}
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={selectAll}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-text-secondary">Seleziona tutte</span>
            </div>

            {/* Notifiche */}
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`card hover:shadow-md transition-all duration-200 animate-slideInUp ${
                  !notification.read ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800' : ''
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    className="w-4 h-4 mt-1 text-primary-600 rounded focus:ring-primary-500"
                  />

                  {/* Icona */}
                  <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Contenuto */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-text-primary">
                        {notification.title}
                      </h3>
                      <button
                        onClick={() => {
                          deleteNotification(notification.id)
                          setSelectedNotifications(prev => prev.filter(id => id !== notification.id))
                        }}
                        className="btn-icon p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Elimina notifica"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-text-secondary mb-2">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(notification.time)}
                      </span>
                      
                      {notification.location && (
                        <span>{notification.location}</span>
                      )}

                      {notification.priority && (
                        <Badge 
                          variant={
                            notification.priority === 'high' ? 'danger' :
                            notification.priority === 'medium' ? 'warning' :
                            'default'
                          }
                        >
                          {notification.priority === 'high' ? 'Alta' :
                           notification.priority === 'medium' ? 'Media' : 'Bassa'} priorità
                        </Badge>
                      )}

                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Segna come letta
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
