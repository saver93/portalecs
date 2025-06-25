'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useNotifications } from '@/contexts/NotificationContext'

export default function NotificationBadge() {
  const { unreadCount } = useNotifications()

  return (
    <Link 
      href="/notifications" 
      className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
      title="Notifiche"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}