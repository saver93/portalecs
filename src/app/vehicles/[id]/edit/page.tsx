'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Vehicle, Location } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { useNotificationActions } from '@/hooks/useNotificationActions'
import { useToast } from '@/components/Toast'

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = params.id as string
  const [user, setUser] = useState<any>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { notifyVehicleAssignment } = useNotificationActions()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    license_plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    location_id: '',
    assigned_to: '',
    insurance_expiry: '',
    tax_expiry: '',
    inspection_expiry: '',
    status: 'available'
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && vehicleId) {
      fetchData()
    }
  }, [user, vehicleId])

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
      router.push('/vehicles')
      return
    }

    setUser(userData)
  }

  async function fetchData() {
    try {
      const [vehicleRes, locationsRes, usersRes] = await Promise.all([
        supabase.from('vehicles').select('*').eq('id', vehicleId).single(),
        supabase.from('locations').select('*').order('name'),
        supabase.from('users').select('*').order('full_name')
      ])

      if (vehicleRes.error) throw vehicleRes.error

      setVehicle(vehicleRes.data)
      setLocations(locationsRes.data || [])
      setUsers(usersRes.data || [])

      // Popola il form con i dati del veicolo
      setFormData({
        license_plate: vehicleRes.data.license_plate,
        brand: vehicleRes.data.brand,
        model: vehicleRes.data.model,
        year: vehicleRes.data.year,
        location_id: vehicleRes.data.location_id || '',
        assigned_to: vehicleRes.data.assigned_to || '',
        insurance_expiry: vehicleRes.data.insurance_expiry,
        tax_expiry: vehicleRes.data.tax_expiry,
        inspection_expiry: vehicleRes.data.inspection_expiry,
        status: vehicleRes.data.status
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Errore nel caricamento dei dati del veicolo')
      router.push('/vehicles')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      // Controlla se c'è stato un cambio di assegnazione
      const isNewAssignment = formData.assigned_to && formData.assigned_to !== vehicle?.assigned_to

      const { error } = await supabase
        .from('vehicles')
        .update({
          ...formData,
          location_id: formData.location_id || null,
          assigned_to: formData.assigned_to || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId)

      if (error) throw error

      // Se il veicolo è stato assegnato a qualcuno, invia notifica
      if (isNewAssignment && formData.assigned_to) {
        await notifyVehicleAssignment(vehicleId, formData.assigned_to, {
          license_plate: formData.license_plate,
          brand: formData.brand,
          model: formData.model
        })
      }

      showToast({
        type: 'success',
        title: 'Veicolo aggiornato',
        message: isNewAssignment ? 'Il veicolo è stato aggiornato e l\'utente è stato notificato' : 'Veicolo aggiornato con successo'
      })

      router.push('/vehicles')
    } catch (error: any) {
      console.error('Error updating vehicle:', error)
      showToast({
        type: 'error',
        title: 'Errore',
        message: error.message || 'Impossibile aggiornare il veicolo'
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Sei sicuro di voler eliminare questo veicolo? Questa azione non può essere annullata.')) {
      return
    }

    setDeleting(true)

    try {
      // Prima elimina i documenti associati
      await supabase
        .from('vehicle_documents')
        .delete()
        .eq('vehicle_id', vehicleId)

      // Poi elimina il veicolo
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)

      if (error) throw error

      showToast({
        type: 'success',
        title: 'Veicolo eliminato',
        message: 'Il veicolo è stato eliminato con successo'
      })

      router.push('/vehicles')
    } catch (error: any) {
      console.error('Error deleting vehicle:', error)
      showToast({
        type: 'error',
        title: 'Errore',
        message: error.message || 'Impossibile eliminare il veicolo'
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Caricamento...</h1>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Veicolo non trovato</h1>
          <Link href="/vehicles" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            Torna ai veicoli
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={user?.role} />
      
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link
                href="/vehicles"
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Modifica Veicolo</h1>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Eliminazione...' : 'Elimina'}
            </button>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informazioni Base */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Informazioni Veicolo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700">
                      Targa *
                    </label>
                    <input
                      type="text"
                      id="license_plate"
                      required
                      className="input-field mt-1"
                      value={formData.license_plate}
                      onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                      placeholder="ES: AB123CD"
                    />
                  </div>

                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                      Marca *
                    </label>
                    <input
                      type="text"
                      id="brand"
                      required
                      className="input-field mt-1"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="ES: Fiat"
                    />
                  </div>

                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                      Modello *
                    </label>
                    <input
                      type="text"
                      id="model"
                      required
                      className="input-field mt-1"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="ES: Panda"
                    />
                  </div>

                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                      Anno *
                    </label>
                    <input
                      type="number"
                      id="year"
                      required
                      min={1900}
                      max={new Date().getFullYear() + 1}
                      className="input-field mt-1"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Assegnazione */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Assegnazione</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location_id" className="block text-sm font-medium text-gray-700">
                      Punto Vendita
                    </label>
                    <select
                      id="location_id"
                      className="input-field mt-1"
                      value={formData.location_id}
                      onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                    >
                      <option value="">Nessuno</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                      Assegnato a
                    </label>
                    <select
                      id="assigned_to"
                      className="input-field mt-1"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    >
                      <option value="">Nessuno</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Scadenze */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Scadenze</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="insurance_expiry" className="block text-sm font-medium text-gray-700">
                      Scadenza Assicurazione *
                    </label>
                    <input
                      type="date"
                      id="insurance_expiry"
                      required
                      className="input-field mt-1"
                      value={formData.insurance_expiry}
                      onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="tax_expiry" className="block text-sm font-medium text-gray-700">
                      Scadenza Bollo *
                    </label>
                    <input
                      type="date"
                      id="tax_expiry"
                      required
                      className="input-field mt-1"
                      value={formData.tax_expiry}
                      onChange={(e) => setFormData({ ...formData, tax_expiry: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="inspection_expiry" className="block text-sm font-medium text-gray-700">
                      Scadenza Revisione *
                    </label>
                    <input
                      type="date"
                      id="inspection_expiry"
                      required
                      className="input-field mt-1"
                      value={formData.inspection_expiry}
                      onChange={(e) => setFormData({ ...formData, inspection_expiry: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Stato */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Stato
                </label>
                <select
                  id="status"
                  className="input-field mt-1"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="available">Disponibile</option>
                  <option value="in_use">In Uso</option>
                  <option value="maintenance">In Manutenzione</option>
                </select>
              </div>

              {/* Azioni */}
              <div className="flex justify-end space-x-4">
                <Link href="/vehicles" className="btn-secondary">
                  Annulla
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
