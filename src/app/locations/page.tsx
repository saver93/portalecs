'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Location } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { 
  Alert, 
  EmptyState, 
  Badge, 
  Modal, 
  LoadingSpinner
} from '@/components/UIComponents'
import { 
  Plus, Edit2, Trash2, Store, MapPin, Users, Car,
  Search, Building2, Navigation, Hash
} from 'lucide-react'

export default function LocationsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [locationStats, setLocationStats] = useState<any>({})
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchLocations()
    }
  }, [currentUser])

  useEffect(() => {
    filterLocations()
  }, [locations, searchTerm])

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

    if (userData?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    setCurrentUser(userData)
  }

  async function fetchLocations() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setLocations(data || [])
      
      // Fetch stats for each location
      if (data) {
        const stats: any = {}
        for (const location of data) {
          const [usersCount, vehiclesCount] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact' }).eq('location_id', location.id),
            supabase.from('vehicles').select('id', { count: 'exact' }).eq('location_id', location.id)
          ])
          
          stats[location.id] = {
            users: usersCount.count || 0,
            vehicles: vehiclesCount.count || 0
          }
        }
        setLocationStats(stats)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterLocations() {
    if (!searchTerm) {
      setFilteredLocations(locations)
      return
    }

    const filtered = locations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredLocations(filtered)
  }

  async function handleAddLocation(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('locations')
        .insert({
          name: formData.name,
          address: formData.address || null
        })

      if (error) throw error
      
      setAlertMessage('Punto vendita creato con successo!')
      setAlertType('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      
      setShowAddModal(false)
      setFormData({ name: '', address: '' })
      fetchLocations()
    } catch (error: any) {
      setAlertMessage(error.message || 'Errore durante la creazione del punto vendita')
      setAlertType('error')
      setShowAlert(true)
    }
  }

  async function handleEditLocation(e: React.FormEvent) {
    e.preventDefault()
    
    if (!editingLocation) return

    try {
      const { error } = await supabase
        .from('locations')
        .update({
          name: formData.name,
          address: formData.address || null
        })
        .eq('id', editingLocation.id)

      if (error) throw error
      
      setAlertMessage('Punto vendita aggiornato con successo!')
      setAlertType('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      
      setShowEditModal(false)
      setEditingLocation(null)
      setFormData({ name: '', address: '' })
      fetchLocations()
    } catch (error: any) {
      setAlertMessage(error.message || 'Errore durante l\'aggiornamento del punto vendita')
      setAlertType('error')
      setShowAlert(true)
    }
  }

  async function handleDeleteLocation(locationId: string, locationName: string) {
    if (!confirm(`Sei sicuro di voler eliminare il punto vendita "${locationName}"?`)) return

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId)

      if (error) throw error
      
      setAlertMessage('Punto vendita eliminato con successo')
      setAlertType('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      
      fetchLocations()
    } catch (error) {
      setAlertMessage('Errore durante l\'eliminazione. Il punto vendita potrebbe essere utilizzato da utenti o veicoli.')
      setAlertType('error')
      setShowAlert(true)
    }
  }

  function openEditModal(location: Location) {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      address: location.address || ''
    })
    setShowEditModal(true)
  }

  const totalStats = {
    locations: locations.length,
    users: Object.values(locationStats).reduce((sum: number, stat: any) => sum + stat.users, 0),
    vehicles: Object.values(locationStats).reduce((sum: number, stat: any) => sum + stat.vehicles, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-text-secondary">Caricamento punti vendita...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Navbar userRole={currentUser?.role} userName={currentUser?.full_name} />
      
      <main className="container-responsive py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0 animate-fadeIn">
            <h1 className="text-3xl font-bold text-text-primary">Gestione Punti Vendita</h1>
            <p className="text-text-secondary mt-1">
              Amministra le sedi aziendali
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuovo Punto Vendita
          </button>
        </div>

        {/* Alert */}
        {showAlert && (
          <div className="mb-6">
            <Alert 
              type={alertType} 
              onClose={() => setShowAlert(false)}
            >
              {alertMessage}
            </Alert>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-4 animate-slideInUp">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Punti Vendita</p>
                <p className="text-2xl font-bold text-text-primary">{totalStats.locations}</p>
              </div>
              <Store className="w-8 h-8 text-primary-500" />
            </div>
          </div>
          
          <div className="card p-4 animate-slideInUp" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Utenti Totali</p>
                <p className="text-2xl font-bold text-blue-600">{totalStats.users}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="card p-4 animate-slideInUp" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Veicoli Assegnati</p>
                <p className="text-2xl font-bold text-green-600">{totalStats.vehicles}</p>
              </div>
              <Car className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-bg-primary rounded-xl shadow-sm border border-border-primary p-4 mb-6 animate-slideInUp">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Cerca per nome o indirizzo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Locations Grid */}
        {filteredLocations.length === 0 ? (
          <EmptyState
            icon={Store}
            title="Nessun punto vendita trovato"
            description={searchTerm ? "Prova a modificare la ricerca" : "Inizia aggiungendo il primo punto vendita"}
            action={{
              label: "Aggiungi Punto Vendita",
              onClick: () => setShowAddModal(true)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location, index) => {
              const stats = locationStats[location.id] || { users: 0, vehicles: 0 }
              
              return (
                <div 
                  key={location.id} 
                  className="card hover:shadow-xl transition-all duration-300 animate-scaleIn"
                  style={{ animationDelay: `${Math.min(index * 100, 600)}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-3">
                        <Building2 className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">{location.name}</h3>
                        {location.address && (
                          <div className="flex items-start mt-1">
                            <Navigation className="w-4 h-4 text-text-tertiary mr-1 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-text-secondary">{location.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-bg-tertiary rounded-lg">
                      <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-text-primary">{stats.users}</p>
                      <p className="text-xs text-text-tertiary">Utenti</p>
                    </div>
                    <div className="text-center p-3 bg-bg-tertiary rounded-lg">
                      <Car className="w-5 h-5 text-green-500 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-text-primary">{stats.vehicles}</p>
                      <p className="text-xs text-text-tertiary">Veicoli</p>
                    </div>
                  </div>

                  {/* ID Badge */}
                  <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                    <Badge variant="default" size="sm">
                      <Hash className="w-3 h-3 mr-1" />
                      {location.id.slice(0, 8)}
                    </Badge>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(location)}
                        className="btn-icon text-blue-600 hover:text-blue-700"
                        title="Modifica"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id, location.name)}
                        className="btn-icon text-red-600 hover:text-red-700"
                        title="Elimina"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add Location Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setFormData({ name: '', address: '' })
          }}
          title="Nuovo Punto Vendita"
        >
          <form onSubmit={handleAddLocation} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                Nome Punto Vendita *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="text"
                  id="name"
                  required
                  className="input-field pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="es. Milano Centro"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-text-primary mb-1">
                Indirizzo (opzionale)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                <textarea
                  id="address"
                  rows={3}
                  className="input-field pl-10 resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Via Roma 1, 20100 Milano"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  setFormData({ name: '', address: '' })
                }}
                className="btn-secondary"
              >
                Annulla
              </button>
              <button type="submit" className="btn-primary">
                Crea Punto Vendita
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Location Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingLocation(null)
            setFormData({ name: '', address: '' })
          }}
          title="Modifica Punto Vendita"
        >
          <form onSubmit={handleEditLocation} className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-text-primary mb-1">
                Nome Punto Vendita *
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="text"
                  id="edit-name"
                  required
                  className="input-field pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-address" className="block text-sm font-medium text-text-primary mb-1">
                Indirizzo (opzionale)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                <textarea
                  id="edit-address"
                  rows={3}
                  className="input-field pl-10 resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Via Roma 1, 20100 Milano"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingLocation(null)
                  setFormData({ name: '', address: '' })
                }}
                className="btn-secondary"
              >
                Annulla
              </button>
              <button type="submit" className="btn-primary">
                Salva Modifiche
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  )
}