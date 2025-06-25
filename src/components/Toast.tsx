'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose?: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
}

const colors = {
  success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
  error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
}

const iconColors = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400'
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const Icon = icons[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose?.(id)
    }, 300) // Durata dell'animazione di uscita
  }

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${colors[type]}
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[type]}`} />
      
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        {message && (
          <p className="mt-1 text-sm opacity-90">{message}</p>
        )}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Chiudi notifica"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// Container per i toast
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  useEffect(() => {
    // Esponi la funzione globalmente per poterla chiamare da ovunque
    if (typeof window !== 'undefined') {
      (window as any).showToast = (toast: Omit<ToastProps, 'id'>) => {
        const id = Date.now().toString()
        setToasts(prev => [...prev, { ...toast, id }])
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).showToast
      }
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}

// Hook per usare i toast
export function useToast() {
  const showToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(toast)
    }
  }

  return { showToast }
}