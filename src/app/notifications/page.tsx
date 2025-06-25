'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Bell, Check, Trash2, AlertTriangle, Package, Car, CheckCircle, X, Info, Calendar, Clock, Filter } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, refreshNotifications } = useNotifications()
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshNotifications().finally(() => setLoading(false))
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    return notification.type === filter
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request':
        return <Package className="w-5 h-5" />
      case 'approval':
        return <CheckCircle className="w-5 h-5" />
      case 'rejection':
        return <X className="w-5 h-5" />
      case 'vehicle':
        return <Car className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Adesso'
    if (diffInMinutes < 60) return `${diffInMinutes} minut${diffInMinutes === 1 ? 'o' : 'i'} fa`
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} or${hours === 1 ? 'a' : 'e'} fa`
    }
    
    // Format as date
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  return (
    <div className="container-responsive py-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Notifiche</h1>
        <p className="text-text-secondary">Gestisci tutte le tue notifiche in un unico posto</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tutte
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Non lette
            </button>
            <button
              onClick={() => setFilter('request')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'request' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Richieste
            </button>
            <button
              onClick={() => setFilter('vehicle')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'vehicle' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Veicoli
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'warning' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Avvisi
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {filteredNotifications.some(n => !n.read) && (
              <button
                onClick={markAllAsRead}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Segna come lette
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Sei sicuro di voler eliminare tutte le notifiche?')) {
                    clearAllNotifications()
                  }
                }}
                className="btn-danger text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Elimina tutte
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {filter === 'all' ? 'Nessuna notifica' : `Nessuna notifica ${filter === 'unread' ? 'non letta' : 'di questo tipo'}`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'all' 
              ? 'Quando riceverai notifiche, appariranno qui' 
              : 'Prova a cambiare filtro per vedere altre notifiche'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-all duration-200 ${
                !notification.read 
                  ? 'border-blue-500 hover:shadow-md' 
                  : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
              } ${notification.action_url ? 'cursor-pointer' : ''}`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg flex-shrink-0 ${
                    notification.type === 'request' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                    notification.type === 'approval' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                    notification.type === 'rejection' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                    notification.type === 'vehicle' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                    notification.type === 'warning' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                    'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2"></span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(notification.created_at)}
                      </span>
                      {notification.action_url && (
                        <span className="text-blue-600 dark:text-blue-400">
                          Clicca per visualizzare →
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        title="Segna come letta"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Elimina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
