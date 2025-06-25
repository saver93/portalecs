import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '@/components/Navbar'

export default async function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Ottieni i dati dell'utente
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <>
      <Navbar userRole={userData?.role} userName={userData?.full_name} />
      <main className="min-h-screen bg-bg-primary">
        {children}
      </main>
    </>
  )
}
