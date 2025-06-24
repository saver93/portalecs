'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Location } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Plus, Edit, Trash2, Store, MapPin } from 'lucide-react'

export default function LocationsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
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
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
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
      
      alert('Punto vendita creato con successo!')
      setShowAddModal(false)
      setFormData({ name: '', address: '' })
      fetchLocations()
    } catch (error: any) {
      alert(error.message || 'Errore durante la creazione del punto vendita')
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
      
      alert('Punto vendita aggiornato con successo!')
      setShowEditModal(false)
      setEditingLocation(null)
      setFormData({ name: '', address: '' })
      fetchLocations()
    } catch (error: any) {
      alert(error.message || 'Errore durante l\'aggiornamento del punto vendita')
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
      
      fetchLocations()
    } catch (error) {
      console.error('Error deleting location:', error)
      alert('Errore durante l\'eliminazione del punto vendita. Potrebbe essere utilizzato da utenti o veicoli.')
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Caricamento punti vendita...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={currentUser?.role} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestione Punti Vendita</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Aggiungi Punto Vendita
            </button>
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location) => (
              <div key={location.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Store className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                      {location.address && (
                        <div className="flex items-center mt-1">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                          <p className="text-sm text-gray-600">{location.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(location)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(location.id, location.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {locations.length === 0 && (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nessun punto vendita trovato.</p>
              <p className="text-gray-500">Clicca su "Aggiungi Punto Vendita" per iniziare.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Location Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Aggiungi Nuovo Punto Vendita</h3>
            <form onSubmit={handleAddLocation} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome Punto Vendita *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="input-field mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Indirizzo (opzionale)
                </label>
                <textarea
                  id="address"
                  rows={3}
                  className="input-field mt-1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Via, numero civico, CAP, città"
                />
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
                  Aggiungi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Modifica Punto Vendita</h3>
            <form onSubmit={handleEditLocation} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                  Nome Punto Vendita *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  required
                  className="input-field mt-1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700">
                  Indirizzo (opzionale)
                </label>
                <textarea
                  id="edit-address"
                  rows={3}
                  className="input-field mt-1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Via, numero civico, CAP, città"
                />
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
          </div>
        </div>
      )}
    </div>
  )
}
