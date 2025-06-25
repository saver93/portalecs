'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, ResourceRequest, Location } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { 
  Alert, 
  EmptyState, 
  Badge, 
  Modal, 
  LoadingSpinner,
  Tabs 
} from '@/components/UIComponents'
import { 
  Plus, Package, Clock, CheckCircle, XCircle, 
  Filter, Search, Download, Printer, Eye, Trash2,
  FileText, Calendar
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { useNotificationActions } from '@/hooks/useNotificationActions'
import { useToast } from '@/components/Toast'

export default function ResourcesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const { notifyRequestStatusChange } = useNotificationActions()
  const { showToast } = useToast()
  const [requests, setRequests] = useState<any[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [isPrintingSingle, setIsPrintingSingle] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
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
  }, [user, activeTab, filters, searchTerm])

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

      // Apply tab filter
      if (activeTab !== 'all') {
        query = query.eq('status', activeTab)
      }

      // Apply other filters
      if (filters.urgency !== 'all') {
        query = query.eq('urgency', filters.urgency)
      }
      if (filters.location !== 'all') {
        query = query.eq('location_id', filters.location)
      }

      // Apply search
      if (searchTerm) {
        query = query.or(`notes.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%`)
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
      // Prima ottieni i dati della richiesta per le notifiche
      const request = requests.find(r => r.id === requestId)
      
      const { error } = await supabase
        .from('resource_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId)

      if (error) throw error
      
      // Invia notifica all'utente che ha fatto la richiesta
      if (request) {
        await notifyRequestStatusChange(requestId, newStatus as 'approved' | 'rejected', request)
      }
      
      // Mostra toast di conferma
      showToast({
        type: newStatus === 'approved' ? 'success' : 'warning',
        title: `Richiesta ${newStatus === 'approved' ? 'approvata' : 'rifiutata'}`,
        message: 'L\'utente è stato notificato del cambio di stato'
      })
      
      // Refresh the list
      fetchRequests()
    } catch (error) {
      console.error('Error updating request:', error)
      showToast({
        type: 'error',
        title: 'Errore',
        message: 'Impossibile aggiornare lo stato della richiesta'
      })
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
      
      showToast({
        type: 'success',
        title: 'Richiesta eliminata',
        message: 'La richiesta è stata eliminata con successo'
      })
      
      fetchRequests()
    } catch (error: any) {
      console.error('Error deleting request:', error)
      showToast({
        type: 'error',
        title: 'Errore',
        message: error.message || 'Impossibile eliminare la richiesta'
      })
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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    } as const

    const labels = {
      pending: 'In Attesa',
      approved: 'Approvata',
      rejected: 'Rifiutata'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getUrgencyBadge = (urgency: string) => {
    const variants = {
      low: 'default',
      medium: 'warning',
      high: 'danger'
    } as const

    const labels = {
      low: 'Bassa',
      medium: 'Media',
      high: 'Alta'
    }

    return (
      <Badge variant={variants[urgency as keyof typeof variants]} size="sm">
        {labels[urgency as keyof typeof labels]}
      </Badge>
    )
  }

  const getResourceTypeLabel = (type: string) => {
    const labels = {
      material: 'Materiale',
      personnel: 'Personale',
      other: 'Altro'
    }
    return labels[type as keyof typeof labels] || type
  }

  const tabs = [
    { id: 'all', label: 'Tutte', icon: Package },
    { id: 'pending', label: 'In Attesa', icon: Clock },
    { id: 'approved', label: 'Approvate', icon: CheckCircle },
    { id: 'rejected', label: 'Rifiutate', icon: XCircle },
  ]

  const requestCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  function exportToCSV() {
    try {
      const headers = ['ID', 'Tipo Risorsa', 'Quantità', 'Urgenza', 'Stato', 'Punto Vendita', 'Richiedente', 'Data Richiesta', 'Note']
      
      const csvData = requests.map(request => [
        request.id,
        getResourceTypeLabel(request.resource_type),
        request.quantity,
        request.urgency === 'low' ? 'Bassa' : request.urgency === 'medium' ? 'Media' : 'Alta',
        request.status === 'pending' ? 'In Attesa' : request.status === 'approved' ? 'Approvata' : 'Rifiutata',
        request.location?.name || '',
        request.requester?.full_name || '',
        format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: it }),
        request.notes || ''
      ])
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `richieste_risorse_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`
      link.click()
      URL.revokeObjectURL(url)
      
      // Mostra messaggio di successo
      showToast({
        type: 'success',
        title: 'Export completato',
        message: 'File CSV esportato con successo'
      })
    } catch (error) {
      console.error('Errore durante l\'esportazione:', error)
      showToast({
        type: 'error',
        title: 'Errore',
        message: 'Impossibile esportare il file CSV'
      })
    }
  }

  // Enhance tabs with counts
  const enhancedTabs = tabs.map(tab => ({
    ...tab,
    label: `${tab.label} (${requestCounts[tab.id as keyof typeof requestCounts]})`
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-text-secondary">Caricamento richieste...</h1>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`min-h-screen bg-bg-secondary ${isPrintingSingle ? 'print-hide-all' : ''}`}>
        <Navbar userRole={user?.role} userName={user?.full_name} />
      
        <main className="container-responsive py-8 print:py-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 print:hidden">
            <div className="mb-4 sm:mb-0 animate-fadeIn">
              <h1 className="text-3xl font-bold text-text-primary">Richieste Risorse</h1>
              <p className="text-text-secondary mt-1">
                Gestisci le richieste di materiali e personale
              </p>
            </div>
            <div className="flex space-x-3">
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



          {/* Filters and Search */}
          <div className="bg-bg-primary rounded-xl shadow-sm border border-border-primary p-4 mb-6 print:hidden animate-slideInUp">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Cerca nelle richieste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <select
                  className="input-field"
                  value={filters.urgency}
                  onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                >
                  <option value="all">Tutte le urgenze</option>
                  <option value="low">Bassa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>

                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <select
                    className="input-field"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  >
                    <option value="all">Tutti i punti vendita</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                )}

                <button 
                  onClick={exportToCSV}
                  className="btn-secondary flex items-center"
                  disabled={requests.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Esporta CSV
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs 
            tabs={enhancedTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="mb-6 print:hidden"
          />

          {/* Print Header - visible only when printing */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Richieste Risorse</h1>
            <p className="text-sm text-gray-600 text-center">
              Stampato il {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: it })}
            </p>
          </div>

          {/* Requests List */}
          {requests.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nessuna richiesta trovata"
              description={searchTerm ? "Prova a modificare i criteri di ricerca" : "Non ci sono richieste in questa categoria"}
              action={
                activeTab === 'all' && !searchTerm ? {
                  label: "Crea nuova richiesta",
                  onClick: () => router.push('/resources/new')
                } : undefined
              }
            />
          ) : (
            <div className="bg-bg-primary rounded-xl shadow-sm border border-border-primary overflow-hidden print:shadow-none print:border-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-primary">
                  <thead className="bg-bg-tertiary print:bg-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider print:px-2 print:text-black">
                        Stato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider print:px-2 print:text-black">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider print:px-2 print:text-black">
                        Quantità
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider print:px-2 print:text-black">
                        Urgenza
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider print:px-2 print:text-black">
                        Punto Vendita
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider print:px-2 print:text-black">
                        Richiedente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider print:px-2 print:text-black">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider print:hidden">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-bg-primary divide-y divide-border-primary">
                    {requests.map((request, index) => (
                      <tr 
                        key={request.id} 
                        className="hover:bg-bg-tertiary transition-colors cursor-pointer print:hover:bg-white animate-fadeIn"
                        style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowDetailModal(true)
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap print:px-2">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary print:px-2">
                          <div className="flex items-center">
                            <span>
                              {getResourceTypeLabel(request.resource_type)}
                            </span>
                            {request.notes && (
                              <div className="ml-2 group relative print:hidden">
                                <FileText className="w-4 h-4 text-text-tertiary cursor-help" />
                                <div className="tooltip-content">
                                  {request.notes}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary print:px-2">
                          {request.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap print:px-2">
                          {getUrgencyBadge(request.urgency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary print:px-2">
                          {request.location?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary print:px-2">
                          {request.requester?.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary print:px-2">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 print:hidden" />
                            {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: it })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium print:hidden">
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handlePrintRequest(request)}
                              className="btn-icon"
                              title="Stampa"
                            >
                              <Printer className="w-5 h-5" />
                            </button>
                            {(user?.role === 'admin' || user?.role === 'manager') && request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(request.id, 'approved')}
                                  className="btn-icon text-green-600 hover:text-green-700"
                                  title="Approva"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(request.id, 'rejected')}
                                  className="btn-icon text-red-600 hover:text-red-700"
                                  title="Rifiuta"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => handleDeleteRequest(request.id)}
                                className="btn-icon text-red-600 hover:text-red-700"
                                title="Elimina"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedRequest(request)
                                setShowDetailModal(true)
                              }}
                              className="btn-icon"
                              title="Dettagli"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detail Modal */}
          <Modal
            isOpen={showDetailModal && !showPrintModal}
            onClose={() => setShowDetailModal(false)}
            title="Dettagli Richiesta"
            size="lg"
          >
            {selectedRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-tertiary">Tipo Risorsa</p>
                    <p className="font-medium text-text-primary">{getResourceTypeLabel(selectedRequest.resource_type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-tertiary">Quantità</p>
                    <p className="font-medium text-text-primary">{selectedRequest.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-tertiary">Urgenza</p>
                    <div className="mt-1">{getUrgencyBadge(selectedRequest.urgency)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-text-tertiary">Stato</p>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>

                {selectedRequest.notes && (
                  <div>
                    <p className="text-sm text-text-tertiary mb-1">Note</p>
                    <p className="text-text-primary bg-bg-tertiary p-3 rounded-lg">{selectedRequest.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-border-primary">
                  <p className="text-sm text-text-tertiary mb-2">Informazioni Richiesta</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Punto Vendita:</span>
                      <span className="font-medium text-text-primary">{selectedRequest.location?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Richiedente:</span>
                      <span className="font-medium text-text-primary">{selectedRequest.requester?.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Data Richiesta:</span>
                      <span className="font-medium text-text-primary">
                        {format(new Date(selectedRequest.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                      </span>
                    </div>
                    {selectedRequest.updated_at !== selectedRequest.created_at && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Ultimo Aggiornamento:</span>
                        <span className="font-medium text-text-primary">
                          {format(new Date(selectedRequest.updated_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => handlePrintRequest(selectedRequest)}
                    className="btn-secondary flex items-center"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Stampa
                  </button>
                  {(user?.role === 'admin' || user?.role === 'manager') && selectedRequest.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusChange(selectedRequest.id, 'approved')
                          setShowDetailModal(false)
                        }}
                        className="btn-primary flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approva
                      </button>
                      <button
                        onClick={() => {
                          handleStatusChange(selectedRequest.id, 'rejected')
                          setShowDetailModal(false)
                        }}
                        className="btn-danger flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rifiuta
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </Modal>
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
                      <dd className="font-medium">{getResourceTypeLabel(selectedRequest.resource_type)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Quantità:</dt>
                      <dd className="font-medium">{selectedRequest.quantity}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Urgenza:</dt>
                      <dd className="font-medium">
                        {selectedRequest.urgency === 'low' ? 'Bassa' : 
                         selectedRequest.urgency === 'medium' ? 'Media' : 'Alta'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Stato:</dt>
                      <dd className="font-medium">
                        {selectedRequest.status === 'pending' ? 'In Attesa' :
                         selectedRequest.status === 'approved' ? 'Approvata' : 'Rifiutata'}
                      </dd>
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