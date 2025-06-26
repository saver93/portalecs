'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Package, Car, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  totalVehicles: number
  availableVehicles: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    totalVehicles: 0,
    availableVehicles: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user])

  async function checkUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/auth/login')
      return
    }

    // Fetch user details from our users table
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
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
      // Fetch resource requests stats
      const { count: totalRequests } = await supabase
        .from('resource_requests')
        .select('*', { count: 'exact' })

      const { count: pendingRequests } = await supabase
        .from('resource_requests')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')

      // Fetch vehicles stats
      const { count: totalVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact' })

      const { count: availableVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact' })
        .eq('status', 'available')

      setStats({
        totalRequests: totalRequests || 0,
        pendingRequests: pendingRequests || 0,
        totalVehicles: totalVehicles || 0,
        availableVehicles: availableVehicles || 0,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Caricamento dashboard...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={user?.role} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Benvenuto, {user?.full_name || user?.email}!
          </h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Richieste Totali</h3>
                  <p className="text-3xl font-bold text-gray-700">{stats.totalRequests}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">In Attesa</h3>
                  <p className="text-3xl font-bold text-gray-700">{stats.pendingRequests}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Veicoli Totali</h3>
                  <p className="text-3xl font-bold text-gray-700">{stats.totalVehicles}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Disponibili</h3>
                  <p className="text-3xl font-bold text-gray-700">{stats.availableVehicles}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/resources/new')}>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nuova Richiesta Risorse</h3>
              <p className="text-gray-600">Crea una nuova richiesta di materiali o personale per il tuo punto vendita.</p>
            </div>

            <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/vehicles')}>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Gestione Veicoli</h3>
              <p className="text-gray-600">Visualizza e gestisci il parco auto aziendale.</p>
            </div>

            {user?.role === 'admin' && (
              <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/users')}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Gestione Utenti</h3>
                <p className="text-gray-600">Aggiungi o modifica gli utenti del sistema.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
