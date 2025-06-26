'use client'

import { NotificationProvider } from '@/contexts/NotificationContext'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  )
}
