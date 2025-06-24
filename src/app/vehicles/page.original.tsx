'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Vehicle, Location } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Plus, Car, AlertTriangle, CheckCircle, Wrench, FileText, Calendar } from 'lucide-react'
import { format, isAfter, addDays } from 'date-fns'
import { it } from 'date-fns/locale'

export default function VehiclesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    location: 'all',
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchVehicles()
      fetchLocations()
    }
  }, [user, filters])

  async function checkUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/auth/login')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    setUser(userData)
  }

  async function fetchVehicles() {
    try {
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          location:locations(name),
          assigned_user:users(full_name)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters.location !== 'all') {
        query = query.eq('location_id', filters.location)
      }

      const { data, error } = await query

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLocations() {
    const { data } = await supabase.from('locations').select('*')
    setLocations(data || [])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in_use':
        return <Car className="w-5 h-5 text-blue-500" />
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-orange-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponibile'
      case 'in_use':
        return 'In Uso'
      case 'maintenance':
        return 'In Manutenzione'
      default:
        return status
    }
  }

  const checkExpiry = (date: string) => {
    const expiryDate = new Date(date)
    const warningDate = addDays(new Date(), 30) // Alert 30 days before
    
    if (isAfter(new Date(), expiryDate)) {
      return { status: 'expired', class: 'text-red-600 font-bold' }
    } else if (isAfter(warningDate, expiryDate)) {
      return { status: 'warning', class: 'text-orange-600 font-medium' }
    }
    return { status: 'ok', class: 'text-gray-600' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Caricamento veicoli...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={user?.role} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Parco Auto</h1>
            {user?.role === 'admin' && (
              <Link href="/vehicles/new" className="btn-primary flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Nuovo Veicolo
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                <select
                  className="input-field"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">Tutti</option>
                  <option value="available">Disponibili</option>
                  <option value="in_use">In Uso</option>
                  <option value="maintenance">In Manutenzione</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Punto Vendita</label>
                <select
                  className="input-field"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                >
                  <option value="all">Tutti</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => {
              const insuranceExpiry = checkExpiry(vehicle.insurance_expiry)
              const taxExpiry = checkExpiry(vehicle.tax_expiry)
              const inspectionExpiry = checkExpiry(vehicle.inspection_expiry)
              
              const hasWarning = [insuranceExpiry, taxExpiry, inspectionExpiry].some(
                exp => exp.status === 'expired' || exp.status === 'warning'
              )

              return (
                <div key={vehicle.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <p className="text-2xl font-bold text-primary-600">{vehicle.license_plate}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasWarning && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                      {getStatusIcon(vehicle.status)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Anno:</span>
                      <span className="text-sm font-medium">{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Stato:</span>
                      <span className="text-sm font-medium">{getStatusText(vehicle.status)}</span>
                    </div>
                    {vehicle.location && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Sede:</span>
                        <span className="text-sm font-medium">{vehicle.location.name}</span>
                      </div>
                    )}
                    {vehicle.assigned_user && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Assegnato a:</span>
                        <span className="text-sm font-medium">{vehicle.assigned_user.full_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        Assicurazione:
                      </span>
                      <span className={`text-sm ${insuranceExpiry.class}`}>
                        {format(new Date(vehicle.insurance_expiry), 'dd/MM/yyyy', { locale: it })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Bollo:
                      </span>
                      <span className={`text-sm ${taxExpiry.class}`}>
                        {format(new Date(vehicle.tax_expiry), 'dd/MM/yyyy', { locale: it })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Wrench className="w-4 h-4 mr-1" />
                        Revisione:
                      </span>
                      <span className={`text-sm ${inspectionExpiry.class}`}>
                        {format(new Date(vehicle.inspection_expiry), 'dd/MM/yyyy', { locale: it })}
                      </span>
                    </div>
                  </div>

                  {user?.role === 'admin' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                      <Link
                        href={`/vehicles/${vehicle.id}/edit`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Modifica
                      </Link>
                      <Link
                        href={`/vehicles/${vehicle.id}/documents`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Documenti
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
