'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Vehicle, VehicleDocument } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { ArrowLeft, Upload, FileText, Download, Trash2, Eye } from 'lucide-react'

export default function VehicleDocumentsPage() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = params.id as string
  const [user, setUser] = useState<any>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [documents, setDocuments] = useState<VehicleDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({
    document_type: '',
    file: null as File | null
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
      // Fetch vehicle info
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single()

      if (vehicleError) throw vehicleError
      setVehicle(vehicleData)

      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from('vehicle_documents')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('uploaded_at', { ascending: false })

      if (docsError) throw docsError
      setDocuments(docsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Errore nel caricamento dei dati')
      router.push('/vehicles')
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(e: React.FormEvent) {
    e.preventDefault()
    
    if (!uploadData.file || !uploadData.document_type) {
      alert('Seleziona un file e specifica il tipo di documento')
      return
    }

    setUploading(true)

    try {
      // Upload file to Supabase Storage
      const fileExt = uploadData.file.name.split('.').pop()
      const fileName = `${vehicleId}/${Date.now()}.${fileExt}`
      
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from('vehicle-documents')
        .upload(fileName, uploadData.file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-documents')
        .getPublicUrl(fileName)

      // Save document record in database
      const { error: dbError } = await supabase
        .from('vehicle_documents')
        .insert({
          vehicle_id: vehicleId,
          document_type: uploadData.document_type,
          file_url: publicUrl,
          file_name: uploadData.file.name
        })

      if (dbError) throw dbError

      alert('Documento caricato con successo!')
      setShowUploadModal(false)
      setUploadData({ document_type: '', file: null })
      fetchData() // Refresh documents list
    } catch (error: any) {
      console.error('Error uploading document:', error)
      alert(error.message || 'Errore durante il caricamento del documento')
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteDocument(doc: VehicleDocument) {
    if (!confirm(`Sei sicuro di voler eliminare il documento "${doc.document_type}"?`)) {
      return
    }

    try {
      // Extract file path from URL
      const urlParts = doc.file_url.split('/')
      const filePath = `${vehicleId}/${urlParts[urlParts.length - 1]}`

      // Delete from storage
      await supabase.storage
        .from('vehicle-documents')
        .remove([filePath])

      // Delete from database
      const { error } = await supabase
        .from('vehicle_documents')
        .delete()
        .eq('id', doc.id)

      if (error) throw error

      alert('Documento eliminato con successo!')
      fetchData()
    } catch (error: any) {
      console.error('Error deleting document:', error)
      alert(error.message || 'Errore durante l\'eliminazione del documento')
    }
  }

  const documentTypes = [
    'Libretto di Circolazione',
    'Assicurazione',
    'Bollo',
    'Revisione',
    'Contratto Acquisto',
    'Contratto Leasing',
    'Fattura',
    'Altro'
  ]

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
      
      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link
                href="/vehicles"
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Documenti Veicolo</h1>
                <p className="text-gray-600 mt-1">
                  {vehicle.brand} {vehicle.model} - {vehicle.license_plate}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Carica Documento
            </button>
          </div>

          {/* Documents List */}
          {documents.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nessun documento caricato</p>
              <p className="text-gray-400 mt-2">
                Clicca su "Carica Documento" per aggiungere documenti
              </p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Caricamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {doc.document_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.file_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.uploaded_at).toLocaleDateString('it-IT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                            title="Visualizza"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                          <a
                            href={doc.file_url}
                            download={doc.file_name}
                            className="text-green-600 hover:text-green-900"
                            title="Scarica"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            className="text-red-600 hover:text-red-900"
                            title="Elimina"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Carica Nuovo Documento</h3>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label htmlFor="document_type" className="block text-sm font-medium text-gray-700">
                  Tipo Documento *
                </label>
                <select
                  id="document_type"
                  required
                  className="input-field mt-1"
                  value={uploadData.document_type}
                  onChange={(e) => setUploadData({ ...uploadData, document_type: e.target.value })}
                >
                  <option value="">Seleziona tipo...</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                  File *
                </label>
                <input
                  type="file"
                  id="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Formati supportati: PDF, JPG, PNG, DOC, DOCX
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadData({ document_type: '', file: null })
                  }}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Caricamento...' : 'Carica'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
