import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientProviders from '@/components/ClientProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portale Aziendale - Gestione Risorse e Parco Auto',
  description: 'Sistema integrato per la gestione delle richieste risorse e del parco auto aziendale',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
