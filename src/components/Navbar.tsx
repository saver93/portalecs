'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Home, Package, Car, Users, LogOut, Menu, X, Store, User, Bell, CheckCircle, Trash2, AlertTriangle, Info, ChevronDown, Settings, HelpCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import ThemeSwitcher from './ThemeSwitcher'
import { useNotifications } from '@/contexts/NotificationContext'
import NotificationBadge from '@/components/NotificationBadge'

interface NavbarProps {
  userRole?: string
  userName?: string
}

export default function Navbar({ userRole, userName }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
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
    setShowProfileMenu(false)
  }, [pathname])

  // Chiude i dropdown quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      
      if (!target.closest('.notifications-dropdown') && !target.closest('.notifications-button')) {
        setShowNotifications(false)
      }
      
      if (!target.closest('.profile-dropdown') && !target.closest('.profile-button')) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // Formatta tempo
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    
    // Verifica che la data sia valida
    if (isNaN(date.getTime())) {
      return 'Data non valida'
    }
    
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return 'Adesso'
    }
    
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

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'manager':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500'
      default:
        return 'bg-gradient-to-r from-green-500 to-emerald-500'
    }
  }

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Amministratore'
      case 'manager':
        return 'Manager'
      default:
        return 'Staff'
    }
  }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50' 
        : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo e navigazione desktop */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="relative">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Portale Aziendale
                </h1>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
              </div>
            </div>
            
            {/* Navigazione desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 mr-2 transition-transform duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                    <span>{item.name}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Azioni desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Theme Switcher */}
            <div className="relative">
              <ThemeSwitcher />
            </div>

            {/* Notifiche */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="notifications-button relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              >
                <Bell className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse shadow-lg">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Dropdown Notifiche */}
              {showNotifications && (
                <div className="notifications-dropdown absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-slideDown">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Notifiche</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors"
                          >
                            Segna tutte come lette
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={async () => {
                              try {
                                await clearAllNotifications()
                                // Solo chiudi il dropdown se l'operazione ha successo
                                // setShowNotifications(false)
                              } catch (error) {
                                console.error('Failed to clear notifications:', error)
                                alert('Errore nella cancellazione delle notifiche. Controlla la console per dettagli.')
                              }
                            }}
                            className="p-1 hover:bg-white/20 rounded-md transition-colors"
                            title="Cancella tutte"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Nessuna notifica</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Qui appariranno le tue notifiche</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              notification.type === 'request' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                              notification.type === 'approval' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                              notification.type === 'rejection' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                              notification.type === 'vehicle' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                              notification.type === 'warning' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                              'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                {formatTime(notification.created_at)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <Link
                      href="/notifications"
                      className="block text-center py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-blue-600 dark:text-blue-400"
                    >
                      Vedi tutte le notifiche →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Profilo dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="profile-button flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
              >
                <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden transition-transform duration-300 group-hover:scale-110 ${getRoleColor(userRole)}`}>
                  <span className="relative z-10">{userName?.charAt(0).toUpperCase() || 'U'}</span>
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userName || 'Utente'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getRoleBadge(userRole)}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="profile-dropdown absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-slideDown">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getRoleColor(userRole)}`}>
                        {userName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {userName || 'Utente'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getRoleBadge(userRole)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profilo
                    </Link>
                    
                    {userRole === 'admin' && (
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Impostazioni
                      </Link>
                    )}
                    
                    <Link
                      href="/help"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Aiuto
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Esci
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu mobile */}
          <div className="flex items-center md:hidden space-x-2">
            <ThemeSwitcher />
            
            {/* Notifiche mobile */}
            <button
              onClick={() => router.push('/notifications')}
              className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
        className={`md:hidden transition-all duration-300 ${
          mobileMenuOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {/* Info utente mobile */}
            <div className="flex items-center px-3 py-4 mb-2 border-b border-gray-200 dark:border-gray-700">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-3 ${getRoleColor(userRole)}`}>
                {userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{userName || 'Utente'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{getRoleBadge(userRole)}</p>
              </div>
            </div>

            {/* Link navigazione mobile */}
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
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
              className="flex items-center px-3 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <User className="w-5 h-5 mr-3" />
              Profilo
            </Link>

            {/* Notifiche mobile */}
            <Link
              href="/notifications"
              className="flex items-center w-full px-3 py-3 text-base font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bell className="w-5 h-5 mr-3" />
              Notifiche
              {unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Logout mobile */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-3 text-base font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Esci
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
