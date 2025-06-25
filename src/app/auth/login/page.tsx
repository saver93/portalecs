'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogIn, Mail, Lock, Building2, Car, Package } from 'lucide-react'
import { Alert, LoadingSpinner } from '@/components/UIComponents'
import ThemeSwitcher from '@/components/ThemeSwitcher'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Controlla se l'utente è già loggato
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setCheckingAuth(false)
      }
    }
    checkUser()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Verifica che l'utente esista nella tabella users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (userError || !userData) {
        setError('Utente non configurato nel sistema. Contatta l\'amministratore.')
        await supabase.auth.signOut()
        return
      }

      router.push('/dashboard')
      
    } catch (error: any) {
      setError(error.message || 'Errore durante il login')
    } finally {
      setLoading(false)
    }
  }

  // Mostra loading mentre controlla l'autenticazione
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-text-secondary">Caricamento...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>

      <div className="max-w-md w-full space-y-8 z-10">
        {/* Logo and Title */}
        <div className="text-center animate-fadeIn">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
              <Building2 className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-text-primary">
            Portale Aziendale
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Sistema di Gestione Risorse e Parco Auto
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 animate-slideInUp" onSubmit={handleLogin}>
          <div className="bg-bg-primary rounded-xl shadow-lg p-8 space-y-6">
            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-border-primary">
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Package className="w-4 h-4 text-primary-500" />
                <span>Richieste Risorse</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <Car className="w-4 h-4 text-primary-500" />
                <span>Gestione Veicoli</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-text-tertiary" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input-field pl-10"
                    placeholder="nome@azienda.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-text-tertiary" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="input-field pl-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert type="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Accesso in corso...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Accedi
                </>
              )}
            </button>

            {/* Help Text */}
            <p className="text-center text-xs text-text-tertiary">
              Problemi di accesso? Contatta l'amministratore di sistema
            </p>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-text-tertiary animate-fadeIn" style={{ animationDelay: '300ms' }}>
          © 2024 Portale Aziendale. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  )
}