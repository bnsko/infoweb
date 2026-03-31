'use client'

import { useState, useEffect, useCallback } from 'react'

export type Theme = 'carbon' | 'sunset' | 'ocean'

export const THEMES: { key: Theme; label: string; labelEn: string; color: string }[] = [
  { key: 'carbon', label: 'Carbon', labelEn: 'Carbon', color: '#1a1a1a' },
  { key: 'sunset', label: 'Západ slnka', labelEn: 'Sunset', color: '#f97316' },
  { key: 'ocean', label: 'Oceán', labelEn: 'Ocean', color: '#06b6d4' },
]

const VALID_THEMES = new Set<string>(['carbon', 'sunset', 'ocean'])

export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void; isDark: boolean } {
  const [theme, setThemeState] = useState<Theme>('carbon')

  useEffect(() => {
    const stored = localStorage.getItem('infoweb-theme') ?? 'carbon'
    const valid = VALID_THEMES.has(stored) ? (stored as Theme) : 'carbon'
    setThemeState(valid)
    document.documentElement.setAttribute('data-theme', valid)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('infoweb-theme', next)
  }, [])

  return { theme, setTheme, isDark: true }
}
