'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      // Controlla la sessione
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      // Controlla l'utente
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Autenticazione</h1>
      
      <div className="space-y-4">
        <div className="card">
          <h2 className="font-semibold">Stato Sessione:</h2>
          <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="card">
          <h2 className="font-semibold">Utente:</h2>
          <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="flex gap-4">
          <a href="/auth/login" className="btn-primary">
            Vai al Login
          </a>
          <a href="/dashboard" className="btn-primary">
            Vai alla Dashboard
          </a>
          {user && (
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
