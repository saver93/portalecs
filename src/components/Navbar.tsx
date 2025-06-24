'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Home, Package, Car, Users, LogOut, Menu, X, Store, User, Bell, CheckCircle, Trash2, AlertTriangle, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import ThemeSwitcher from './ThemeSwitcher'
import { useNotifications } from '@/contexts/NotificationContext'

interface NavbarProps {
  userRole?: string
  userName?: string
}

export default function Navbar({ userRole, userName }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  // Usa il context delle notifiche
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications()

  // Gestisce lo scroll per l'effetto glass
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Chiude il menu mobile quando si cambia pagina
  useEffect(() => {
    setMobileMenuOpen(false)
    setShowNotifications(false)
  }, [pathname])

  // Chiude il dropdown notifiche quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest('.notifications-dropdown') && !target.closest('.notifications-button')) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
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
    return `${diffInDays} giorn${diffInDays === 1 ? 'o' : 'i'} fa`
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request':
        return <Package className="w-4 h-4" />
      case 'approval':
        return <CheckCircle className="w-4 h-4" />
      case 'rejection':
        return <X className="w-4 h-4" />
      case 'vehicle':
        return <Car className="w-4 h-4" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />
      case 'info':
        return <Info className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Richieste Risorse', href: '/resources', icon: Package },
    { name: 'Parco Auto', href: '/vehicles', icon: Car },
  ]

  if (userRole === 'admin') {
    navigation.push({ name: 'Gestione Utenti', href: '/users', icon: Users })
    navigation.push({ name: 'Punti Vendita', href: '/locations', icon: Store })
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass shadow-lg' : 'bg-bg-primary'
    }`}>
      <div className="container-responsive">
        <div className="flex justify-between h-16">
          {/* Logo e navigazione desktop */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold gradient-text">Portale Aziendale</h1>
            </div>
            
            {/* Navigazione desktop */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Azioni desktop */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {/* Notifiche */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn-icon relative group notifications-button"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Dropdown Notifiche */}
              {showNotifications && (
                <div className="notifications-dropdown absolute right-0 mt-2 w-80 bg-bg-primary rounded-xl shadow-xl border border-border-primary z-50 animate-scaleIn">
                  <div className="p-4 border-b border-border-primary flex items-center justify-between">
                    <h3 className="font-semibold text-text-primary">Notifiche</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Segna tutte come lette
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={() => {
                            clearAllNotifications()
                            setShowNotifications(false)
                          }}
                          className="btn-icon p-1"
                          title="Cancella tutte"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-text-tertiary">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Nessuna notifica</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                          className={`p-4 border-b border-border-primary hover:bg-bg-tertiary transition-colors cursor-pointer ${
                            !notification.read ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              notification.type === 'request' ? 'bg-blue-100 dark:bg-blue-900/30' :
                              notification.type === 'approval' ? 'bg-green-100 dark:bg-green-900/30' :
                              notification.type === 'rejection' ? 'bg-red-100 dark:bg-red-900/30' :
                              notification.type === 'vehicle' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                              notification.type === 'warning' ? 'bg-orange-100 dark:bg-orange-900/30' :
                              'bg-purple-100 dark:bg-purple-900/30'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary">
                                {notification.title}
                              </p>
                              <p className="text-sm text-text-secondary mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-text-tertiary mt-1">
                                {formatTime(notification.time)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-3 text-center border-t border-border-primary">
                      <Link
                        href="/notifications"
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Vedi tutte le notifiche
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Profilo dropdown */}
            <Link href="/profile" className="relative">
              <button className="flex items-center space-x-3 btn-ghost">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {userName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden lg:block text-sm font-medium">
                  {userName || 'Utente'}
                </span>
              </button>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="btn-danger flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>

          {/* Menu mobile */}
          <div className="flex items-center md:hidden">
            <ThemeSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-2 btn-icon"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="bg-bg-primary border-t border-border-primary">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Info utente mobile */}
            <div className="flex items-center px-3 py-2 mb-2 border-b border-border-primary">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium">{userName || 'Utente'}</p>
                <p className="text-xs text-text-tertiary capitalize">{userRole || 'staff'}</p>
              </div>
            </div>

            {/* Link navigazione mobile */}
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}

            {/* Profilo link mobile */}
            <Link
              href="/profile"
              className="flex items-center px-3 py-2 text-base font-medium rounded-lg text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
            >
              <User className="w-5 h-5 mr-3" />
              Profilo
            </Link>

            {/* Notifiche mobile */}
            <Link
              href="/notifications"
              className="flex items-center w-full px-3 py-2 text-base font-medium rounded-lg text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
            >
              <Bell className="w-5 h-5 mr-3" />
              Notifiche
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Logout mobile */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-base font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
