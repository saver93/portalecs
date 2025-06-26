'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Recupera il tema salvato o usa 'system' come default
    const savedTheme = localStorage.getItem('theme') as Theme || 'system'
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Ascolta i cambiamenti delle preferenze di sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, mounted])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    const isDark = 
      newTheme === 'dark' || 
      (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      root.setAttribute('data-theme', 'dark')
    } else {
      root.removeAttribute('data-theme')
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="relative">
      <button
        className="btn-icon group"
        onClick={() => {
          const themes: Theme[] = ['light', 'dark', 'system']
          const currentIndex = themes.indexOf(theme)
          const nextTheme = themes[(currentIndex + 1) % themes.length]
          handleThemeChange(nextTheme)
        }}
        aria-label="Cambia tema"
      >
        {theme === 'light' && <Sun className="w-5 h-5 text-yellow-500" />}
        {theme === 'dark' && <Moon className="w-5 h-5 text-blue-500" />}
        {theme === 'system' && <Monitor className="w-5 h-5 text-gray-500" />}
        
        {/* Tooltip */}
        <span className="tooltip-content">
          {theme === 'light' && 'Tema chiaro'}
          {theme === 'dark' && 'Tema scuro'}
          {theme === 'system' && 'Tema di sistema'}
        </span>
      </button>
    </div>
  )
}