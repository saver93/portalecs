'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Vehicle, Location } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { 
  EmptyState, 
  Badge, 
  LoadingSpinner,
  ProgressBar
} from '@/components/UIComponents'
import { 
  Plus, Car, AlertTriangle, CheckCircle, Wrench, FileText, Calendar,
  Filter, Search, MapPin, User, Clock, Shield, Receipt, Settings
} from 'lucide-react'
import { format, isAfter, addDays, differenceInDays } from 'date-fns'
import { it } from 'date-fns/locale'

export default function VehiclesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
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
  }, [user, filters, searchTerm])

  async function checkUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/auth/login')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*, locations(name)')
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

      // Apply search
      if (searchTerm) {
        query = query.or(`license_plate.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`)
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

  const getStatusBadge = (status: string) => {
    const variants = {
      available: 'success',
      in_use: 'info',
      maintenance: 'warning'
    } as const

    const labels = {
      available: 'Disponibile',
      in_use: 'In Uso',
      maintenance: 'In Manutenzione'
    }

    const icons = {
      available: CheckCircle,
      in_use: Car,
      maintenance: Wrench
    }

    const Icon = icons[status as keyof typeof icons]

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const checkExpiry = (date: string) => {
    const expiryDate = new Date(date)
    const today = new Date()
    const daysUntilExpiry = differenceInDays(expiryDate, today)
    
    if (daysUntilExpiry < 0) {
      return { 
        status: 'expired', 
        class: 'text-red-600 dark:text-red-400 font-bold',
        badge: 'danger',
        text: 'Scaduto'
      }
    } else if (daysUntilExpiry <= 30) {
      return { 
        status: 'warning', 
        class: 'text-orange-600 dark:text-orange-400 font-medium',
        badge: 'warning',
        text: `${daysUntilExpiry}gg`
      }
    }
    return { 
      status: 'ok', 
      class: 'text-text-secondary',
      badge: 'default',
      text: format(expiryDate, 'dd/MM/yyyy', { locale: it })
    }
  }

  const getExpiryProgress = (date: string) => {
    const daysUntilExpiry = differenceInDays(new Date(date), new Date())
    const totalDays = 365 // Assume annual renewal
    const daysElapsed = totalDays - daysUntilExpiry
    const percentage = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100))
    
    let color: 'success' | 'warning' | 'danger' = 'success'
    if (percentage > 90) color = 'danger'
    else if (percentage > 75) color = 'warning'
    
    return { percentage, color }
  }

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    inUse: vehicles.filter(v => v.status === 'in_use').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    expiringSoon: vehicles.filter(v => {
      const insuranceExpiry = checkExpiry(v.insurance_expiry)
      const taxExpiry = checkExpiry(v.tax_expiry)
      const inspectionExpiry = checkExpiry(v.inspection_expiry)
      return [insuranceExpiry, taxExpiry, inspectionExpiry].some(
        exp => exp.status === 'expired' || exp.status === 'warning'
      )
    }).length
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-text-secondary">Caricamento veicoli...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Navbar userRole={user?.role} userName={user?.full_name} />
      
      <main className="container-responsive py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0 animate-fadeIn">
            <h1 className="text-3xl font-bold text-text-primary">Parco Auto</h1>
            <p className="text-text-secondary mt-1">
              Gestisci e monitora i veicoli aziendali
            </p>
          </div>
          {user?.role === 'admin' && (
            <Link href="/vehicles/new" className="btn-primary flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Nuovo Veicolo
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="card p-4 animate-slideInUp">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Totale</p>
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              </div>
              <Car className="w-8 h-8 text-primary-500" />
            </div>
          </div>
          
          <div className="card p-4 animate-slideInUp" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Disponibili</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="card p-4 animate-slideInUp" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">In Uso</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inUse}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="card p-4 animate-slideInUp" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Manutenzione</p>
                <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
              </div>
              <Wrench className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="card p-4 animate-slideInUp" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Scadenze</p>
                <p className="text-2xl font-bold text-red-600">{stats.expiringSoon}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-bg-primary rounded-xl shadow-sm border border-border-primary p-4 mb-6 animate-slideInUp">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                type="text"
                placeholder="Cerca per targa, marca o modello..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                className="input-field"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">Tutti gli stati</option>
                <option value="available">Disponibili</option>
                <option value="in_use">In Uso</option>
                <option value="maintenance">In Manutenzione</option>
              </select>

              <select
                className="input-field"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="all">Tutte le sedi</option>
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
        {vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title="Nessun veicolo trovato"
            description={searchTerm ? "Prova a modificare i criteri di ricerca" : "Non ci sono veicoli nel sistema"}
            action={
              user?.role === 'admin' && !searchTerm ? {
                label: "Aggiungi primo veicolo",
                onClick: () => router.push('/vehicles/new')
              } : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle, index) => {
              const insuranceExpiry = checkExpiry(vehicle.insurance_expiry)
              const taxExpiry = checkExpiry(vehicle.tax_expiry)
              const inspectionExpiry = checkExpiry(vehicle.inspection_expiry)
              
              const hasWarning = [insuranceExpiry, taxExpiry, inspectionExpiry].some(
                exp => exp.status === 'expired' || exp.status === 'warning'
              )

              const insuranceProgress = getExpiryProgress(vehicle.insurance_expiry)
              const taxProgress = getExpiryProgress(vehicle.tax_expiry)
              const inspectionProgress = getExpiryProgress(vehicle.inspection_expiry)

              return (
                <div 
                  key={vehicle.id} 
                  className="card hover:shadow-xl transition-all duration-300 animate-scaleIn"
                  style={{ animationDelay: `${Math.min(index * 100, 600)}ms` }}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <p className="text-2xl font-bold gradient-text">{vehicle.license_plate}</p>
                      <p className="text-sm text-text-tertiary">Anno: {vehicle.year}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {hasWarning && (
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                      {getStatusBadge(vehicle.status)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-3 mb-4">
                    {vehicle.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-text-tertiary" />
                        <span className="text-text-secondary">Sede:</span>
                        <span className="ml-auto font-medium text-text-primary">{vehicle.location.name}</span>
                      </div>
                    )}
                    {vehicle.assigned_user && (
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 text-text-tertiary" />
                        <span className="text-text-secondary">Assegnato a:</span>
                        <span className="ml-auto font-medium text-text-primary">{vehicle.assigned_user.full_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Expiry Info */}
                  <div className="pt-4 border-t border-border-primary space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-text-secondary">
                          <Shield className="w-4 h-4 mr-1" />
                          Assicurazione
                        </span>
                        <Badge variant={insuranceExpiry.badge as any} size="sm">
                          {insuranceExpiry.text}
                        </Badge>
                      </div>
                      <ProgressBar 
                        value={insuranceProgress.percentage} 
                        color={insuranceProgress.color}
                        className="h-1"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-text-secondary">
                          <Receipt className="w-4 h-4 mr-1" />
                          Bollo
                        </span>
                        <Badge variant={taxExpiry.badge as any} size="sm">
                          {taxExpiry.text}
                        </Badge>
                      </div>
                      <ProgressBar 
                        value={taxProgress.percentage} 
                        color={taxProgress.color}
                        className="h-1"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-text-secondary">
                          <Settings className="w-4 h-4 mr-1" />
                          Revisione
                        </span>
                        <Badge variant={inspectionExpiry.badge as any} size="sm">
                          {inspectionExpiry.text}
                        </Badge>
                      </div>
                      <ProgressBar 
                        value={inspectionProgress.percentage} 
                        color={inspectionProgress.color}
                        className="h-1"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  {user?.role === 'admin' && (
                    <div className="mt-4 pt-4 border-t border-border-primary flex justify-between">
                      <Link
                        href={`/vehicles/${vehicle.id}/documents`}
                        className="btn-ghost text-sm flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Documenti
                      </Link>
                      <Link
                        href={`/vehicles/${vehicle.id}/edit`}
                        className="btn-primary btn-sm"
                      >
                        Modifica
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}