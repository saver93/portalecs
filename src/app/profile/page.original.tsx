'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { User, Lock, Mail, Briefcase, Store, Save } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [profileData, setProfileData] = useState({
    full_name: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/auth/login')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select(`
        *,
        location:locations(name)
      `)
      .eq('id', authUser.id)
      .single()

    if (userData) {
      setCurrentUser(userData)
      setProfileData({
        full_name: userData.full_name
      })
    }
    setLoading(false)
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name
        })
        .eq('id', currentUser.id)

      if (error) throw error

      alert('Profilo aggiornato con successo!')
      checkUser() // Ricarica i dati
    } catch (error: any) {
      alert(error.message || 'Errore durante l\'aggiornamento del profilo')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Le password non corrispondono')
      return
    }

    if (passwordData.newPassword.length < 8) {
      alert('La password deve essere di almeno 8 caratteri')
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      alert('Password aggiornata con successo!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      alert(error.message || 'Errore durante il cambio password')
    } finally {
      setSaving(false)
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600'
      case 'manager':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-700">Caricamento profilo...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={currentUser?.role} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Il mio profilo</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Info Utente */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Informazioni Account</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{currentUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Ruolo</p>
                    <p className={`font-medium ${getRoleColor(currentUser.role)}`}>
                      {getRoleText(currentUser.role)}
                    </p>
                  </div>
                </div>

                {currentUser.location && (
                  <div className="flex items-center">
                    <Store className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Punto Vendita</p>
                      <p className="font-medium">{currentUser.location.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Modifica Nome */}
              <form onSubmit={handleUpdateProfile} className="mt-6 pt-6 border-t">
                <h3 className="text-md font-medium text-gray-900 mb-4">Modifica Profilo</h3>
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    required
                    className="input-field mt-1"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary mt-4 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
              </form>
            </div>

            {/* Cambio Password */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Cambia Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                    Nuova Password
                  </label>
                  <input
                    type="password"
                    id="new_password"
                    required
                    minLength={8}
                    className="input-field mt-1"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Minimo 8 caratteri"
                  />
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                    Conferma Nuova Password
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    required
                    minLength={8}
                    className="input-field mt-1"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Ripeti la nuova password"
                  />
                </div>

                {passwordData.newPassword && passwordData.confirmPassword && 
                 passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-sm text-red-600">Le password non corrispondono</p>
                )}

                <button
                  type="submit"
                  disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="btn-primary w-full"
                >
                  {saving ? 'Aggiornamento...' : 'Cambia Password'}
                </button>
              </form>

              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Suggerimenti per una password sicura:</strong>
                </p>
                <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                  <li>Usa almeno 8 caratteri</li>
                  <li>Includi lettere maiuscole e minuscole</li>
                  <li>Aggiungi numeri e simboli</li>
                  <li>Non usare informazioni personali</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
