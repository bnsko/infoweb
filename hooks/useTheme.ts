'use client'

import { useState, useEffect, useCallback } from 'react'

export type Theme = 'midnight' | 'forest' | 'ember'

export const THEMES: { key: Theme; label: string; emoji: string }[] = [
  { key: 'midnight', label: 'Polnoc', emoji: '🌙' },
  { key: 'forest', label: 'Les', emoji: '🌲' },
  { key: 'ember', label: 'Žeravý', emoji: '🔥' },
]

export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void; isDark: boolean } {
  const [theme, setThemeState] = useState<Theme>('midnight')

  useEffect(() => {
    const stored = (localStorage.getItem('infoweb-theme') as Theme) ?? 'midnight'
    if (['midnight', 'forest', 'ember'].includes(stored)) {
      setThemeState(stored)
      document.documentElement.setAttribute('data-theme', stored)
    }
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('infoweb-theme', next)
  }, [])

  return { theme, setTheme, isDark: true }
}
