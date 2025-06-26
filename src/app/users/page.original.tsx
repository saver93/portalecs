'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, User, Location } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { Plus, Edit, Trash2, Shield, UserCheck, User as UserIcon } from 'lucide-react'

export default function UsersPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'staff',
    location_id: '',
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchUsers()
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

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          location:locations(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLocations() {
    const { data } = await supabase.from('locations').select('*')
    setLocations(data || [])
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    
    try {
      // 1. Prima creiamo l'utente in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
          }
        }
      })

      if (authError) {
        // Gestisci errori specifici
        if (authError.message.includes('already registered')) {
          throw new Error('Questa email è già registrata nel sistema')
        }
        throw authError
      }

      // 2. Se l'utente è stato creato con successo, aggiungiamo il profilo
      if (authData.user) {
        // Chiamiamo la funzione SQL per inserire il profilo utente
        const { data: profileData, error: profileError } = await supabase
          .rpc('insert_user_profile', {
            new_user_id: authData.user.id,
            user_email: formData.email,
            user_full_name: formData.full_name,
            user_role: formData.role,
            user_location_id: formData.location_id || null
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          // Se c'è un errore nel creare il profilo, proviamo comunque a inserirlo direttamente
          // Questo potrebbe funzionare se la funzione non esiste ancora
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: formData.email,
              full_name: formData.full_name,
              role: formData.role,
              location_id: formData.location_id || null
            })
          
          if (insertError) {
            throw new Error('Errore nella creazione del profilo utente. Esegui lo script SQL fornito.')
          }
        }
      }
      
      alert('Utente creato con successo!')
      setShowAddModal(false)
      setFormData({ email: '', password: '', full_name: '', role: 'staff', location_id: '' })
      fetchUsers()
    } catch (error: any) {
      console.error('Error creating user:', error)
      // Messaggi di errore più chiari
      let errorMessage = error.message || 'Errore durante la creazione dell\'utente'
      
      if (errorMessage.includes('row-level security')) {
        errorMessage = 'Errore di permessi. Esegui lo script SQL fornito nel file FIX_USER_CREATION_ERROR.md'
      } else if (errorMessage.includes('already registered')) {
        errorMessage = 'Questa email è già registrata nel sistema'
      }
      
      alert(errorMessage)
    }
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault()
    
    if (!editingUser) return

    try {
      // Aggiorna i dati dell'utente nella tabella users
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          location_id: formData.location_id || null
        })
        .eq('id', editingUser.id)

      if (error) throw error

      alert('Utente aggiornato con successo!')
      setShowEditModal(false)
      setEditingUser(null)
      setFormData({ email: '', password: '', full_name: '', role: 'staff', location_id: '' })
      fetchUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      alert(error.message || 'Errore durante l\'aggiornamento dell\'utente')
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error
      
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Errore durante l\'eliminazione dell\'utente')
    }
  }

  function openEditModal(user: any) {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '', // Non utilizzato nella modifica
      full_name: user.full_name,
      role: user.role,
      location_id: user.location_id || ''
    })
    setShowEditModal(true)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-500" />
      case 'manager':
        return <UserCheck className="w-5 h-5 text-blue-500" />
      default:
        return <UserIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Amministratore'
      case 'manager':
        return 'Manager'
      default:
        return 'Staff'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Caricamento utenti...</h1>
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
            <h1 className="text-3xl font-bold text-gray-900">Gestione Utenti</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crea Utente
            </button>
          </div>

          {/* Users Table */}
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Punto Vendita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getRoleText(user.role)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.location?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Crea Nuovo Utente</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="input-field mt-1"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  minLength={8}
                  className="input-field mt-1"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimo 8 caratteri"
                />
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="full_name"
                  required
                  className="input-field mt-1"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Ruolo
                </label>
                <select
                  id="role"
                  className="input-field mt-1"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Amministratore</option>
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Punto Vendita
                </label>
                <select
                  id="location"
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

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setFormData({ email: '', password: '', full_name: '', role: 'staff', location_id: '' })
                  }}
                  className="btn-secondary"
                >
                  Annulla
                </button>
                <button type="submit" className="btn-primary">
                  Crea Utente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Modifica Utente</h3>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email (non modificabile)
                </label>
                <input
                  type="email"
                  disabled
                  className="input-field mt-1 bg-gray-100"
                  value={formData.email}
                />
              </div>

              {editingUser.id !== currentUser.id && (
                <div className="p-4 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Per motivi di sicurezza, gli utenti devono cambiare la propria password dal loro profilo personale.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="edit-full_name" className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="edit-full_name"
                  required
                  className="input-field mt-1"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">
                  Ruolo
                </label>
                <select
                  id="edit-role"
                  className="input-field mt-1"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={editingUser.id === currentUser.id}
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Amministratore</option>
                </select>
                {editingUser.id === currentUser.id && (
                  <p className="text-sm text-gray-500 mt-1">Non puoi modificare il tuo ruolo</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-location" className="block text-sm font-medium text-gray-700">
                  Punto Vendita
                </label>
                <select
                  id="edit-location"
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

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingUser(null)
                    setFormData({ email: '', password: '', full_name: '', role: 'staff', location_id: '' })
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
