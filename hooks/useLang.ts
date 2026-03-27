'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

export type Lang = 'sk' | 'en'

const TRANSLATIONS: Record<string, { sk: string; en: string }> = {
  subtitle: { sk: 'Slovenský prehľad', en: 'Slovak Dashboard' },
  holiday: { sk: 'Sviatok', en: 'Holiday' },
  live: { sk: 'Naživo', en: 'Live' },
  // Section labels
  'sec.finance': { sk: '🇸🇰 Slovensko & Financie', en: '🇸🇰 Slovakia & Finance' },
  'sec.transport': { sk: '🚗 Doprava, Šport & Podujatia', en: '🚗 Transport, Sports & Events' },
  'sec.space': { sk: '🌍 Vesmír & Ovzdušie', en: '🌍 Space & Atmosphere' },
  'sec.fun': { sk: '🎮 Zábava & Komunita', en: '🎮 Entertainment & Community' },
  'sec.history': { sk: '📖 Dnes v histórii & Zaujímavosti', en: '📖 Today in History & Facts' },
  'sec.news': { sk: '📰 Správy z 18 odvetví', en: '📰 News from 18 Sectors' },
  'sec.metrics': { sk: '📊 Zaujímavé metriky', en: '📊 Interesting Metrics' },
  // Stats
  'stat.temp': { sk: 'Teplota BA', en: 'Temp BA' },
  'stat.air': { sk: 'Vzduch BA', en: 'Air BA' },
  'stat.flights': { sk: 'Lety nad SK', en: 'Flights over SK' },
  'stat.btc': { sk: 'BTC', en: 'BTC' },
  'stat.dayOfYear': { sk: 'Deň roka', en: 'Day of year' },
  'stat.sources': { sk: 'Zdroje', en: 'Sources' },
  'stat.online': { sk: 'Online', en: 'Online' },
  'stat.visits': { sk: 'Návštevy', en: 'Visits' },
  'stat.unique': { sk: 'Unikátni', en: 'Unique' },
  'stat.uptime': { sk: 'Uptime', en: 'Uptime' },
  'stat.todayVisits': { sk: 'Dnes', en: 'Today' },
  // Widgets
  'weather.title': { sk: 'Počasie · Bratislava', en: 'Weather · Bratislava' },
  'flights.title': { sk: 'Lety nad Slovenskom', en: 'Flights over Slovakia' },
  'reddit.source': { sk: 'obnova 5 min', en: 'refresh 5 min' },
  'earthquakes.title': { sk: 'Zemetrasenia · Karpaty & okolie', en: 'Earthquakes · Carpathians' },
  'refresh': { sk: 'Obnoviť', en: 'Refresh' },
  'loading': { sk: 'Načítanie...', en: 'Loading...' },
  'error': { sk: 'Chyba načítania', en: 'Loading error' },
  'noData': { sk: 'Žiadne dáta', en: 'No data' },
  // Real estate
  'realestate.title': { sk: 'Nehnuteľnosti · Nové byty', en: 'Real Estate · New Apartments' },
  'realestate.rooms': { sk: 'izby', en: 'rooms' },
}

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LangContext = createContext<LangContextValue>({
  lang: 'sk',
  setLang: () => {},
  t: (k: string) => k,
})

export function useLang(): LangContextValue {
  const [lang, setLangState] = useState<Lang>('sk')

  useEffect(() => {
    const stored = localStorage.getItem('infoweb-lang') as Lang
    if (stored === 'en' || stored === 'sk') {
      setLangState(stored)
    }
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem('infoweb-lang', l)
  }, [])

  const t = useCallback((key: string): string => {
    return TRANSLATIONS[key]?.[lang] ?? key
  }, [lang])

  return { lang, setLang, t }
}
