'use client'

import { useState, useEffect, useCallback } from 'react'

export type Theme = 'klasik' | 'bratislava' | 'tatry'

export const THEMES: { key: Theme; label: string; labelEn: string; color: string }[] = [
  { key: 'klasik', label: 'Klasik', labelEn: 'Classic', color: '#c4956a' },
  { key: 'bratislava', label: 'Bratislava', labelEn: 'Bratislava', color: '#5b8fd8' },
  { key: 'tatry', label: 'Tatry', labelEn: 'Tatras', color: '#6aaa5c' },
]

export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void; isDark: boolean } {
  const [theme, setThemeState] = useState<Theme>('klasik')

  useEffect(() => {
    const stored = (localStorage.getItem('infoweb-theme') as Theme) ?? 'klasik'
    if (['klasik', 'bratislava', 'tatry'].includes(stored)) {
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
