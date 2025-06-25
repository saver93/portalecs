'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, User, Location } from '@/lib/supabase'
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
  Plus, Edit2, Trash2, Shield, UserCheck, User as UserIcon,
  Search, Filter, Mail, MapPin, Calendar, Lock, Eye,
  EyeOff, Users, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { useNotificationActions } from '@/hooks/useNotificationActions'
import { useToast } from '@/components/Toast'
import { createEventNotification } from '@/utils/notifications'

export default function UsersPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const { notifyUserRoleChange } = useNotificationActions()
  const { showToast } = useToast()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [showPassword, setShowPassword] = useState(false)
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

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, locationFilter])

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

  function filterUsers() {
    let filtered = [...users]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(user => user.location_id === locationFilter)
    }

    setFilteredUsers(filtered)
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
        if (authError.message.includes('already registered')) {
          throw new Error('Questa email è già registrata nel sistema')
        }
        throw authError
      }

      // 2. Se l'utente è stato creato con successo, aggiungiamo il profilo
      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .rpc('insert_user_profile', {
            new_user_id: authData.user.id,
            user_email: formData.email,
            user_full_name: formData.full_name,
            user_role: formData.role,
            user_location_id: formData.location_id || null
          })

        if (profileError) {
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
        
        // Invia notifica di benvenuto al nuovo utente
        if (authData.user) {
          await createEventNotification('user_created', authData.user.id, {
            email: formData.email,
            role: formData.role
          })
        }
      }
      
      showToast({
        type: 'success',
        title: 'Utente creato',
        message: 'L\'utente è stato creato con successo e ha ricevuto una notifica di benvenuto'
      })
      
      setShowAddModal(false)
      setFormData({ email: '', password: '', full_name: '', role: 'staff', location_id: '' })
      fetchUsers()
    } catch (error: any) {
      let errorMessage = error.message || 'Errore durante la creazione dell\'utente'
      
      if (errorMessage.includes('row-level security')) {
        errorMessage = 'Errore di permessi. Esegui lo script SQL fornito nel file FIX_USER_CREATION_ERROR.md'
      }
      
      showToast({
        type: 'error',
        title: 'Errore',
        message: errorMessage
      })
    }
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault()
    
    if (!editingUser) return

    try {
      // Controlla se il ruolo è cambiato
      const oldRole = editingUser.role
      const newRole = formData.role
      const roleChanged = oldRole !== newRole

      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          location_id: formData.location_id || null
        })
        .eq('id', editingUser.id)

      if (error) throw error

      // Se il ruolo è cambiato, invia notifica
      if (roleChanged) {
        await notifyUserRoleChange(editingUser.id, newRole, oldRole)
      }

      showToast({
        type: 'success',
        title: 'Utente aggiornato',
        message: roleChanged ? 'L\'utente è stato aggiornato e notificato del cambio ruolo' : 'Utente aggiornato con successo'
      })
      
      setShowEditModal(false)
      setEditingUser(null)
      setFormData({ email: '', password: '', full_name: '', role: 'staff', location_id: '' })
      fetchUsers()
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Errore',
        message: error.message || 'Impossibile aggiornare l\'utente'
      })
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
      
      showToast({
        type: 'success',
        title: 'Utente eliminato',
        message: 'L\'utente è stato eliminato con successo'
      })
      
      fetchUsers()
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Errore',
        message: 'Impossibile eliminare l\'utente'
      })
    }
  }

  function openEditModal(user: any) {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      full_name: user.full_name,
      role: user.role,
      location_id: user.location_id || ''
    })
    setShowEditModal(true)
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'danger',
      manager: 'info',
      staff: 'default'
    } as const

    const labels = {
      admin: 'Amministratore',
      manager: 'Manager',
      staff: 'Staff'
    }

    const icons = {
      admin: Shield,
      manager: UserCheck,
      staff: UserIcon
    }

    const Icon = icons[role as keyof typeof icons] || UserIcon

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'default'}>
        <Icon className="w-3 h-3 mr-1" />
        {labels[role as keyof typeof labels] || role}
      </Badge>
    )
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    staff: users.filter(u => u.role === 'staff').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-text-secondary">Caricamento utenti...</h1>
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
            <h1 className="text-3xl font-bold text-text-primary">Gestione Utenti</h1>
            <p className="text-text-secondary mt-1">
              Amministra gli utenti del sistema
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuovo Utente
          </button>
        </div>



        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 animate-slideInUp">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Totale Utenti</p>
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary-500" />
            </div>
          </div>
          
          <div className="card p-4 animate-slideInUp" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Amministratori</p>
                <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="card p-4 animate-slideInUp" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Manager</p>
                <p className="text-2xl font-bold text-blue-600">{stats.managers}</p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="card p-4 animate-slideInUp" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Staff</p>
                <p className="text-2xl font-bold text-gray-600">{stats.staff}</p>
              </div>
              <UserIcon className="w-8 h-8 text-gray-500" />
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
                placeholder="Cerca per nome o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                className="input-field"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Tutti i ruoli</option>
                <option value="admin">Amministratori</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>

              <select
                className="input-field"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
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

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nessun utente trovato"
            description={searchTerm || roleFilter !== 'all' || locationFilter !== 'all' 
              ? "Prova a modificare i criteri di ricerca" 
              : "Non ci sono utenti nel sistema"}
            action={{
              label: "Aggiungi primo utente",
              onClick: () => setShowAddModal(true)
            }}
          />
        ) : (
          <div className="bg-bg-primary rounded-xl shadow-sm border border-border-primary overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-primary">
                <thead className="bg-bg-tertiary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Utente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Ruolo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Punto Vendita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Data Creazione
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-bg-primary divide-y divide-border-primary">
                  {filteredUsers.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-bg-tertiary transition-colors animate-fadeIn"
                      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                            {user.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-text-primary">
                              {user.full_name}
                            </div>
                            {user.id === currentUser.id && (
                              <span className="text-xs text-primary-600">Tu</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-text-secondary">
                          <Mail className="w-4 h-4 mr-2" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                        {user.location?.name ? (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-text-tertiary" />
                            {user.location.name}
                          </div>
                        ) : (
                          <span className="text-text-tertiary">Non assegnato</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: it })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="btn-icon text-blue-600 hover:text-blue-700"
                            title="Modifica"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          {user.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="btn-icon text-red-600 hover:text-red-700"
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
        )}

        {/* Add User Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false)
            setFormData({ email: '', password: '', full_name: '', role: 'staff', location_id: '' })
          }}
          title="Crea Nuovo Utente"
        >
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="email"
                  id="email"
                  required
                  className="input-field pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="utente@esempio.it"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  minLength={8}
                  className="input-field pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimo 8 caratteri"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-text-tertiary" />
                  ) : (
                    <Eye className="w-5 h-5 text-text-tertiary" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-text-primary mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="text"
                  id="full_name"
                  required
                  className="input-field pl-10"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nome e Cognome"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-1">
                  Ruolo
                </label>
                <select
                  id="role"
                  className="input-field"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Amministratore</option>
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-text-primary mb-1">
                  Punto Vendita
                </label>
                <select
                  id="location"
                  className="input-field"
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                >
                  <option value="">Non assegnato</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
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
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingUser(null)
            setFormData({ email: '', password: '', full_name: '', role: 'staff', location_id: '' })
          }}
          title="Modifica Utente"
        >
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="email"
                  disabled
                  className="input-field pl-10 opacity-60 cursor-not-allowed"
                  value={formData.email}
                />
              </div>
              <p className="text-xs text-text-tertiary mt-1">L'email non può essere modificata</p>
            </div>

            {editingUser?.id !== currentUser.id && (
              <Alert type="info">
                <AlertCircle className="w-4 h-4 mr-2" />
                Per motivi di sicurezza, gli utenti devono cambiare la propria password dal loro profilo personale.
              </Alert>
            )}

            <div>
              <label htmlFor="edit-full_name" className="block text-sm font-medium text-text-primary mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <input
                  type="text"
                  id="edit-full_name"
                  required
                  className="input-field pl-10"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-text-primary mb-1">
                  Ruolo
                </label>
                <select
                  id="edit-role"
                  className="input-field"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={editingUser?.id === currentUser.id}
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Amministratore</option>
                </select>
                {editingUser?.id === currentUser.id && (
                  <p className="text-xs text-text-tertiary mt-1">Non puoi modificare il tuo ruolo</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-location" className="block text-sm font-medium text-text-primary mb-1">
                  Punto Vendita
                </label>
                <select
                  id="edit-location"
                  className="input-field"
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                >
                  <option value="">Non assegnato</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
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
        </Modal>
      </main>
    </div>
  )
}