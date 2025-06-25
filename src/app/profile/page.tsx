'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { 
  Alert, 
  LoadingSpinner,
  Badge,
  ProgressBar
} from '@/components/UIComponents'
import { 
  User, Lock, Mail, Briefcase, Store, Save, 
  Shield, Check, X, Eye, EyeOff, Key,
  Camera, Edit2
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [passwordStrength, setPasswordStrength] = useState(0)
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

  useEffect(() => {
    calculatePasswordStrength(passwordData.newPassword)
  }, [passwordData.newPassword])

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

  function calculatePasswordStrength(password: string) {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 25
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
    if (/\d/.test(password)) strength += 12.5
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 12.5
    setPasswordStrength(strength)
  }

  function getPasswordStrengthColor(): 'danger' | 'warning' | 'success' {
    if (passwordStrength < 50) return 'danger'
    if (passwordStrength < 75) return 'warning'
    return 'success'
  }

  function getPasswordStrengthText() {
    if (passwordStrength < 50) return 'Debole'
    if (passwordStrength < 75) return 'Media'
    return 'Forte'
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

      setAlertMessage('Profilo aggiornato con successo!')
      setAlertType('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      checkUser()
    } catch (error: any) {
      setAlertMessage(error.message || 'Errore durante l\'aggiornamento del profilo')
      setAlertType('error')
      setShowAlert(true)
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlertMessage('Le password non corrispondono')
      setAlertType('error')
      setShowAlert(true)
      return
    }

    if (passwordData.newPassword.length < 8) {
      setAlertMessage('La password deve essere di almeno 8 caratteri')
      setAlertType('error')
      setShowAlert(true)
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setAlertMessage('Password aggiornata con successo!')
      setAlertType('success')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      setAlertMessage(error.message || 'Errore durante il cambio password')
      setAlertType('error')
      setShowAlert(true)
    } finally {
      setSaving(false)
    }
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

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'default'}>
        {labels[role as keyof typeof labels] || role}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-text-secondary">Caricamento profilo...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      <Navbar userRole={currentUser?.role} userName={currentUser?.full_name} />
      
      <main className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold text-text-primary">Il mio profilo</h1>
          <p className="text-text-secondary mt-1">
            Gestisci le tue informazioni personali e le impostazioni di sicurezza
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card text-center animate-slideInUp">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto">
                  {currentUser.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                {currentUser.full_name}
              </h2>
              <p className="text-text-secondary mb-4">{currentUser.email}</p>
              
              <div className="flex justify-center mb-4">
                {getRoleBadge(currentUser.role)}
              </div>

              {currentUser.location && (
                <div className="pt-4 border-t border-border-primary">
                  <div className="flex items-center justify-center text-sm text-text-secondary">
                    <Store className="w-4 h-4 mr-2" />
                    {currentUser.location.name}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border-primary">
                <div>
                  <p className="text-2xl font-bold text-primary-600">12</p>
                  <p className="text-xs text-text-tertiary">Richieste</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">3</p>
                  <p className="text-xs text-text-tertiary">Veicoli</p>
                </div>
              </div>
            </div>
          </div>

          {/* Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile */}
            <div className="card animate-slideInUp" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary flex items-center">
                  <Edit2 className="w-5 h-5 mr-2" />
                  Modifica Profilo
                </h2>
              </div>

              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-text-primary mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      required
                      className="input-field"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="input-field opacity-60 cursor-not-allowed"
                      value={currentUser.email}
                      disabled
                    />
                    <p className="text-xs text-text-tertiary mt-1">
                      L'email non può essere modificata
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex items-center"
                  >
                    {saving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Salvataggio...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salva Modifiche
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="card animate-slideInUp" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Sicurezza Account
                </h2>
                <Badge variant="info">
                  <Key className="w-3 h-3 mr-1" />
                  Cambio Password
                </Badge>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-text-primary mb-1">
                    Nuova Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="new_password"
                      required
                      minLength={8}
                      className="input-field pr-10"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
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
                  
                  {passwordData.newPassword && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">Forza password:</span>
                        <span className={`font-medium ${
                          getPasswordStrengthColor() === 'danger' ? 'text-red-600' :
                          getPasswordStrengthColor() === 'warning' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <ProgressBar 
                        value={passwordStrength} 
                        color={getPasswordStrengthColor()}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-text-primary mb-1">
                    Conferma Nuova Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm_password"
                      required
                      minLength={8}
                      className="input-field pr-10"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Ripeti la nuova password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-text-tertiary" />
                      ) : (
                        <Eye className="w-5 h-5 text-text-tertiary" />
                      )}
                    </button>
                  </div>
                </div>

                {passwordData.newPassword && passwordData.confirmPassword && (
                  <div className={`flex items-center text-sm ${
                    passwordData.newPassword === passwordData.confirmPassword
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {passwordData.newPassword === passwordData.confirmPassword ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Le password corrispondono
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-1" />
                        Le password non corrispondono
                      </>
                    )}
                  </div>
                )}

                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <p className="text-sm font-medium text-primary-800 dark:text-primary-300 mb-2">
                    Suggerimenti per una password sicura:
                  </p>
                  <ul className="space-y-1 text-sm text-primary-700 dark:text-primary-400">
                    <li className="flex items-start">
                      <Check className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      Usa almeno 8 caratteri (12+ consigliati)
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      Includi lettere maiuscole e minuscole
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      Aggiungi numeri e simboli speciali
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      Evita informazioni personali o parole comuni
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Aggiornamento...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Cambia Password
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}