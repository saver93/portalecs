'use client'

import { NotificationProvider } from '@/contexts/NotificationContext'
import { ToastContainer } from '@/components/Toast'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotificationProvider>
      {children}
      <ToastContainer />
    </NotificationProvider>
  )
}