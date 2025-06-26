'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { 
  Package, Car, AlertCircle, CheckCircle, Clock, 
  TrendingUp, TrendingDown, Activity, Calendar,
  Plus, ArrowRight, BarChart3, Users
} from 'lucide-react'

interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  totalVehicles: number
  availableVehicles: number
  inUseVehicles: number
  maintenanceVehicles: number
}

interface QuickStat {
  label: string
  value: number
  icon: any
  color: string
  bgColor: string
  trend?: number
  trendLabel?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalVehicles: 0,
    availableVehicles: 0,
    inUseVehicles: 0,
    maintenanceVehicles: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
      fetchRecentActivities()
    }
  }, [user])

  async function checkUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/auth/login')
      return
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('*, locations(name)')
      .eq('id', authUser.id)
      .single()

    if (error || !userData) {
      console.error('User not found in users table')
      setLoading(false)
      return
    }

    setUser(userData)
    setLoading(false)
  }

  async function fetchDashboardStats() {
    try {
      // Fetch all statistics in parallel
      const [
        totalReq,
        pendingReq,
        approvedReq,
        rejectedReq,
        totalVeh,
        availableVeh,
        inUseVeh,
        maintenanceVeh
      ] = await Promise.all([
        supabase.from('resource_requests').select('*', { count: 'exact', head: true }),
        supabase.from('resource_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('resource_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('resource_requests').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'in_use'),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'maintenance'),
      ])

      setStats({
        totalRequests: totalReq.count || 0,
        pendingRequests: pendingReq.count || 0,
        approvedRequests: approvedReq.count || 0,
        rejectedRequests: rejectedReq.count || 0,
        totalVehicles: totalVeh.count || 0,
        availableVehicles: availableVeh.count || 0,
        inUseVehicles: inUseVeh.count || 0,
        maintenanceVehicles: maintenanceVeh.count || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  async function fetchRecentActivities() {
    // Simula attività recenti - in produzione queste verrebbero da un log delle attività
    setRecentActivities([
      { id: 1, type: 'request', action: 'Nuova richiesta materiali', time: '2 ore fa', icon: Package },
      { id: 2, type: 'vehicle', action: 'Veicolo assegnato', time: '3 ore fa', icon: Car },
      { id: 3, type: 'approval', action: 'Richiesta approvata', time: '5 ore fa', icon: CheckCircle },
    ])
  }

  const quickStats: QuickStat[] = [
    {
      label: 'Richieste Totali',
      value: stats.totalRequests,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      trend: 12,
      trendLabel: 'vs mese scorso'
    },
    {
      label: 'In Attesa',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Veicoli Disponibili',
      value: stats.availableVehicles,
      icon: Car,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      trend: -5,
      trendLabel: 'vs settimana scorsa'
    },
    {
      label: 'In Manutenzione',
      value: stats.maintenanceVehicles,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 mb-4"></div>
          <h1 className="text-xl font-semibold text-text-secondary">Caricamento dashboard...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Navbar userRole={user?.role} userName={user?.full_name} />
      
      <main className="container-responsive py-8">
        {/* Header con saluto */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Buongiorno, {user?.full_name?.split(' ')[0] || 'Utente'}! 👋
          </h1>
          <p className="text-text-secondary">
            {new Date().toLocaleDateString('it-IT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          {user?.locations?.name && (
            <p className="text-sm text-text-tertiary mt-1">
              Punto vendita: <span className="font-medium text-text-secondary">{user.locations.name}</span>
            </p>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div 
              key={stat.label}
              className="card hover:shadow-xl animate-slideInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
                  <p className="text-3xl font-bold text-text-primary mt-2">{stat.value}</p>
                  {stat.trend && (
                    <div className="flex items-center mt-2">
                      {stat.trend > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${
                        stat.trend > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(stat.trend)}%
                      </span>
                      <span className="text-xs text-text-tertiary ml-1">{stat.trendLabel}</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Azioni Rapide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/resources/new')}
                className="card-interactive group animate-scaleIn"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-text-primary mb-1">
                      Nuova Richiesta
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Richiedi materiali o personale
                    </p>
                  </div>
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-800/30 transition-colors">
                    <Plus className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/vehicles')}
                className="card-interactive group animate-scaleIn"
                style={{ animationDelay: '100ms' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-text-primary mb-1">
                      Gestione Veicoli
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Visualizza il parco auto
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800/30 transition-colors">
                    <Car className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/resources')}
                className="card-interactive group animate-scaleIn"
                style={{ animationDelay: '200ms' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-text-primary mb-1">
                      Le Mie Richieste
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Monitora lo stato
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/30 transition-colors">
                    <Activity className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={() => router.push('/users')}
                  className="card-interactive group animate-scaleIn"
                  style={{ animationDelay: '300ms' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-text-primary mb-1">
                        Gestione Utenti
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Amministra il personale
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800/30 transition-colors">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="animate-slideInUp" style={{ animationDelay: '400ms' }}>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Attività Recenti</h2>
            <div className="card">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'request' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      activity.type === 'vehicle' ? 'bg-green-100 dark:bg-green-900/30' :
                      'bg-yellow-100 dark:bg-yellow-900/30'
                    }`}>
                      <activity.icon className={`w-4 h-4 ${
                        activity.type === 'request' ? 'text-blue-600' :
                        activity.type === 'vehicle' ? 'text-green-600' :
                        'text-yellow-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">{activity.action}</p>
                      <p className="text-xs text-text-tertiary">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => router.push('/resources')}
                className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center transition-colors"
              >
                Vedi tutte le attività
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Grafici se admin */}
        {user?.role === 'admin' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card animate-fadeIn" style={{ animationDelay: '500ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Richieste per Stato</h3>
                <BarChart3 className="w-5 h-5 text-text-tertiary" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Approvate</span>
                    <span className="font-medium">{stats.approvedRequests}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(stats.approvedRequests / stats.totalRequests) * 100 || 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">In Attesa</span>
                    <span className="font-medium">{stats.pendingRequests}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(stats.pendingRequests / stats.totalRequests) * 100 || 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Rifiutate</span>
                    <span className="font-medium">{stats.rejectedRequests}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(stats.rejectedRequests / stats.totalRequests) * 100 || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card animate-fadeIn" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Stato Veicoli</h3>
                <Car className="w-5 h-5 text-text-tertiary" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Disponibili</span>
                    <span className="font-medium">{stats.availableVehicles}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(stats.availableVehicles / stats.totalVehicles) * 100 || 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">In Uso</span>
                    <span className="font-medium">{stats.inUseVehicles}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(stats.inUseVehicles / stats.totalVehicles) * 100 || 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">In Manutenzione</span>
                    <span className="font-medium">{stats.maintenanceVehicles}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(stats.maintenanceVehicles / stats.totalVehicles) * 100 || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}