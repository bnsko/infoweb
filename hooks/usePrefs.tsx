'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface UserPreferences {
  hiddenWidgets: string[]
  theme: 'dark' | 'midnight' | 'ocean'
  compactMode: boolean
  refreshRate: 'fast' | 'normal' | 'slow'
}

const DEFAULT_PREFS: UserPreferences = {
  hiddenWidgets: [],
  theme: 'dark',
  compactMode: false,
  refreshRate: 'normal',
}

const STORAGE_KEY = 'infoweb-prefs'

interface PrefsContextValue {
  prefs: UserPreferences
  setPrefs: (p: UserPreferences) => void
  toggleWidget: (id: string) => void
  isWidgetVisible: (id: string) => boolean
  resetPrefs: () => void
}

const PrefsContext = createContext<PrefsContextValue>({
  prefs: DEFAULT_PREFS,
  setPrefs: () => {},
  toggleWidget: () => {},
  isWidgetVisible: () => true,
  resetPrefs: () => {},
})

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<UserPreferences>(DEFAULT_PREFS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setPrefsState({ ...DEFAULT_PREFS, ...parsed })
      }
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])

  const setPrefs = useCallback((p: UserPreferences) => {
    setPrefsState(p)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)) } catch { /* ignore */ }
  }, [])

  const toggleWidget = useCallback((id: string) => {
    setPrefsState(prev => {
      const hidden = prev.hiddenWidgets.includes(id)
        ? prev.hiddenWidgets.filter(w => w !== id)
        : [...prev.hiddenWidgets, id]
      const next = { ...prev, hiddenWidgets: hidden }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  const isWidgetVisible = useCallback((id: string) => {
    return !prefs.hiddenWidgets.includes(id)
  }, [prefs.hiddenWidgets])

  const resetPrefs = useCallback(() => {
    setPrefsState(DEFAULT_PREFS)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFS)) } catch { /* ignore */ }
  }, [])

  if (!loaded) return null

  return (
    <PrefsContext.Provider value={{ prefs, setPrefs, toggleWidget, isWidgetVisible, resetPrefs }}>
      {children}
    </PrefsContext.Provider>
  )
}

export function usePrefs(): PrefsContextValue {
  return useContext(PrefsContext)
}
