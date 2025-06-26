'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, ResourceRequest, Location } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Plus, Filter, AlertCircle, Clock, CheckCircle, XCircle, Trash2, FileText, Printer } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export default function ResourcesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [isPrintingSingle, setIsPrintingSingle] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    urgency: 'all',
    location: 'all',
  })

  useEffect(() => {
    checkUser()
    
    // Cleanup: rimuovi classe dal body quando il componente viene smontato
    return () => {
      document.body.classList.remove('printing-single-request')
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchRequests()
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

  async function fetchRequests() {
    try {
      let query = supabase
        .from('resource_requests')
        .select(`
          *,
          location:locations(name),
          requester:users(full_name)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters.urgency !== 'all') {
        query = query.eq('urgency', filters.urgency)
      }
      if (filters.location !== 'all') {
        query = query.eq('location_id', filters.location)
      }

      // If not admin or manager, only show requests from user's location
      if (user?.role === 'staff') {
        query = query.eq('location_id', user.location_id)
      }

      const { data, error } = await query

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLocations() {
    const { data } = await supabase.from('locations').select('*')
    setLocations(data || [])
  }

  async function handleStatusChange(requestId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('resource_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId)

      if (error) throw error
      
      // Refresh the list
      fetchRequests()
    } catch (error) {
      console.error('Error updating request:', error)
    }
  }

  async function handleDeleteRequest(requestId: string) {
    if (!confirm('Sei sicuro di voler eliminare questa richiesta? Questa azione non può essere annullata.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('resource_requests')
        .delete()
        .eq('id', requestId)

      if (error) throw error
      
      alert('Richiesta eliminata con successo!')
      fetchRequests()
    } catch (error: any) {
      console.error('Error deleting request:', error)
      alert(error.message || 'Errore durante l\'eliminazione della richiesta')
    }
  }

  function handlePrintRequest(request: any) {
    setSelectedRequest(request)
    setShowPrintModal(true)
    setIsPrintingSingle(true)
    
    // Aggiungi classe al body per il controllo CSS
    document.body.classList.add('printing-single-request')
    
    // Aspetta che il modal sia renderizzato, poi stampa
    setTimeout(() => {
      window.print()
      
      // Resetta lo stato dopo la stampa
      setTimeout(() => {
        setShowPrintModal(false)
        setSelectedRequest(null)
        setIsPrintingSingle(false)
        document.body.classList.remove('printing-single-request')
      }, 1000)
    }, 100)
  }

  function handlePrintAll() {
    setShowPrintModal(false)
    window.print()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In Attesa'
      case 'approved':
        return 'Approvata'
      case 'rejected':
        return 'Rifiutata'
      default:
        return status
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    const classes = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes[urgency as keyof typeof classes]}`}>
        {urgency === 'low' ? 'Bassa' : urgency === 'medium' ? 'Media' : 'Alta'}
      </span>
    )
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'Bassa'
      case 'medium':
        return 'Media'
      case 'high':
        return 'Alta'
      default:
        return urgency
    }
  }

  const getResourceTypeText = (type: string) => {
    switch (type) {
      case 'material':
        return 'Materiale'
      case 'personnel':
        return 'Personale'
      case 'other':
        return 'Altro'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Caricamento richieste...</h1>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`min-h-screen bg-gray-50 ${isPrintingSingle ? 'print-hide-all' : ''}`}>
        <Navbar userRole={user?.role} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print:py-0">
        <div className="px-4 py-6 sm:px-0 print:px-0 print:py-0">
          <div className="flex justify-between items-center mb-8 print:hidden">
            <h1 className="text-3xl font-bold text-gray-900">Richieste Risorse</h1>
            <div className="flex space-x-4">
              <button
                onClick={handlePrintAll}
                className="btn-secondary flex items-center"
              >
                <Printer className="w-5 h-5 mr-2" />
                Stampa Lista
              </button>
              <Link href="/resources/new" className="btn-primary flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Nuova Richiesta
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-6 print:hidden">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
                <select
                  className="input-field"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">Tutti</option>
                  <option value="pending">In Attesa</option>
                  <option value="approved">Approvate</option>
                  <option value="rejected">Rifiutate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgenza</label>
                <select
                  className="input-field"
                  value={filters.urgency}
                  onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                >
                  <option value="all">Tutte</option>
                  <option value="low">Bassa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              {(user?.role === 'admin' || user?.role === 'manager') && (
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
              )}
            </div>
          </div>

          {/* Print Header - visible only when printing */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Richieste Risorse</h1>
            <p className="text-sm text-gray-600 text-center">
              Stampato il {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it })}
            </p>
          </div>

          {/* Requests Table */}
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg print:shadow-none print:ring-0">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50 print:bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:text-black">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:text-black">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:text-black">
                    Quantità
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:text-black">
                    Urgenza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:text-black">
                    Punto Vendita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:text-black">
                    Richiedente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:px-2 print:text-black">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print:hidden">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 print:hover:bg-white">
                    <td className="px-6 py-4 whitespace-nowrap print:px-2">
                      <div className="flex items-center">
                        <span className="print:hidden">{getStatusIcon(request.status)}</span>
                        <span className="ml-2 text-sm text-gray-900 print:ml-0">
                          {getStatusText(request.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:px-2">
                      <div className="flex items-center">
                        <span>
                          {getResourceTypeText(request.resource_type)}
                        </span>
                        {request.notes && (
                          <div className="ml-2 group relative print:hidden">
                            <FileText className="w-4 h-4 text-gray-400 cursor-help" />
                            <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm rounded p-2 mt-1 max-w-xs">
                              {request.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:px-2">
                      {request.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap print:px-2">
                      <span className="print:hidden">{getUrgencyBadge(request.urgency)}</span>
                      <span className="hidden print:inline text-sm">{getUrgencyText(request.urgency)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:px-2">
                      {request.location?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 print:px-2">
                      {request.requester?.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 print:px-2">
                      {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: it })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium print:hidden">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handlePrintRequest(request)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Stampa"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        {(user?.role === 'admin' || user?.role === 'manager') && request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(request.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                              title="Approva"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(request.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                              title="Rifiuta"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="text-gray-600 hover:text-red-600"
                            title="Elimina"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      </div>

      {/* Print Modal - for single request */}
      {showPrintModal && selectedRequest && (
        <div className={`print-single-request fixed inset-0 bg-white z-50 p-8 overflow-auto ${isPrintingSingle ? 'print-show' : 'print-hide'}`}>
          <div className="max-w-2xl mx-auto">
            <div className="print:hidden mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Dettaglio Richiesta</h2>
              <button
                onClick={() => {
                  setShowPrintModal(false)
                  setSelectedRequest(null)
                  setIsPrintingSingle(false)
                  document.body.classList.remove('printing-single-request')
                }}
                className="btn-secondary"
              >
                Chiudi
              </button>
            </div>

            <div className="bg-white print:bg-transparent">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Richiesta Risorse</h1>
                <p className="text-gray-600">ID: {selectedRequest.id.slice(0, 8)}</p>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Informazioni Richiesta</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Tipo Risorsa:</dt>
                      <dd className="font-medium">{getResourceTypeText(selectedRequest.resource_type)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Quantità:</dt>
                      <dd className="font-medium">{selectedRequest.quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Urgenza:</dt>
                      <dd className="font-medium">{getUrgencyText(selectedRequest.urgency)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Stato:</dt>
                      <dd className="font-medium">{getStatusText(selectedRequest.status)}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Informazioni Richiedente</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-gray-500">Richiedente:</dt>
                      <dd className="font-medium">{selectedRequest.requester?.full_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Punto Vendita:</dt>
                      <dd className="font-medium">{selectedRequest.location?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Data Richiesta:</dt>
                      <dd className="font-medium">
                        {format(new Date(selectedRequest.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                      </dd>
                    </div>
                    {selectedRequest.updated_at !== selectedRequest.created_at && (
                      <div>
                        <dt className="text-sm text-gray-500">Ultimo Aggiornamento:</dt>
                        <dd className="font-medium">
                          {format(new Date(selectedRequest.updated_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Notes */}
              {selectedRequest.notes && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-700 mb-2">Note</h3>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded">{selectedRequest.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 pt-8 border-t text-center text-sm text-gray-500">
                <p>Stampato il {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it })}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
