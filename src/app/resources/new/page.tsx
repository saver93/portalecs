'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Location } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewResourceRequestPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    location_id: '',
    resource_type: 'material',
    quantity: 1,
    urgency: 'medium',
    notes: '',
  })

  useEffect(() => {
    checkUser()
    fetchLocations()
  }, [])

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
    
    // Pre-fill location if user has one assigned
    if (userData?.location_id) {
      setFormData(prev => ({ ...prev, location_id: userData.location_id }))
    }
  }

  async function fetchLocations() {
    const { data } = await supabase.from('locations').select('*')
    setLocations(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('resource_requests')
        .insert({
          ...formData,
          requested_by: user.id,
          status: 'pending',
        })

      if (error) throw error

      router.push('/resources')
    } catch (error: any) {
      setError(error.message || 'Errore durante la creazione della richiesta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={user?.role} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <Link href="/resources" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Torna alle Richieste
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Nuova Richiesta Risorse</h1>
          </div>

          <div className="card max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Punto Vendita
                </label>
                <select
                  id="location"
                  required
                  className="input-field mt-1"
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  disabled={user?.role === 'staff' && user?.location_id}
                >
                  <option value="">Seleziona punto vendita</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Tipo di Risorsa
                </label>
                <select
                  id="type"
                  required
                  className="input-field mt-1"
                  value={formData.resource_type}
                  onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                >
                  <option value="material">Materiale</option>
                  <option value="personnel">Personale</option>
                  <option value="other">Altro</option>
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantità
                </label>
                <input
                  type="number"
                  id="quantity"
                  required
                  min="1"
                  className="input-field mt-1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">
                  Urgenza
                </label>
                <select
                  id="urgency"
                  required
                  className="input-field mt-1"
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                >
                  <option value="low">Bassa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Note Aggiuntive
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  className="input-field mt-1"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Inserisci dettagli aggiuntivi sulla richiesta..."
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Link href="/resources" className="btn-secondary">
                  Annulla
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creazione...' : 'Crea Richiesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
