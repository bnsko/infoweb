'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useWidget } from '@/hooks/useWidget'
import type { StatsData } from '@/lib/types'
import { useLang } from '@/hooks/useLang'
import { HoroscopeMini } from '@/components/widgets/DailyQuoteWidget'
import { NamedayMini } from '@/components/widgets/NamedayWidget'
import { ISSPassMini } from '@/components/widgets/SpaceEnvWidget'
import { LaunchesMini } from '@/components/widgets/LaunchesWidget/LaunchesWidget'
// SpeedtestMini moved to footer
import { getHoliday, getNextHolidays } from '@/lib/namedays'
import { format } from 'date-fns'
import { sk, enUS } from 'date-fns/locale'
import MHDWidget from '@/components/widgets/MHDWidget'
import TrainDelaysWidget from '@/components/widgets/TrainDelaysWidget'
import OfficeWaitWidget from '@/components/widgets/OfficeWaitWidget'
import LotteryWidget from '@/components/widgets/LotteryWidget'
import DealsWidget from '@/components/widgets/DealsWidget'
import FlightsWidget from '@/components/widgets/FlightsWidget'
import { EnvironmentMini } from '@/components/widgets/EnvironmentWidget'
import { EnergyMini } from '@/components/widgets/EnergyWidget/EnergyWidget'
// MortgagesMini removed

interface SlovakFact { icon: string; title: string; value: string; detail: string }
interface SlovakFactsData { staticFacts: SlovakFact[]; dynamicFacts: SlovakFact[]; generalStats: Record<string, number>; dayOfYear: number }

const WMO_MINI: Record<number, string> = {
  0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',
  61:'🌧️',63:'🌧️',65:'🌧️',71:'🌨️',73:'🌨️',75:'❄️',77:'🌨️',
  80:'🌦️',81:'🌧️',82:'⛈️',85:'🌨️',86:'❄️',95:'⛈️',96:'⛈️',99:'⛈️',
}

interface VisitorData {
  lifetimeViews: number; activeNow: number; todayPageViews: number
}

interface AstronomyData {
  nextShower: { name: string; daysUntil: number; zhr: number; parent: string; active: boolean } | null
  nextEclipse: { type: string; date: string; name: string; daysUntil: number; visible: string } | null
  planets: { planets: string[]; note: string }
  aurora: { kpIndex: number; visibleFromSK: boolean; chance: string } | null
  moonConditions: { phase: number; illumination: number; goodForViewing: boolean }
}

const SECTIONS = [
  { id: 'sec-weather', icon: '🌤️', label: 'Počasie' },
  { id: 'sec-news', icon: '📰', label: 'Správy' },
  { id: 'sec-slovensko', icon: '🇸🇰', label: 'Slovensko' },
  { id: 'sec-financie', icon: '💶', label: 'Financie' },
  { id: 'sec-podnikanie', icon: '💼', label: 'Podnikanie' },
  { id: 'sec-fun', icon: '🎮', label: 'Zábava' },
  { id: 'sec-history', icon: '📚', label: 'História' },
]

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Dynamic Easter calculation (Anonymous Gregorian algorithm)
function getEasterDate(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function getWorkFreeForYear(year: number): Record<string, string> {
  const easter = getEasterDate(year)
  const goodFriday = new Date(easter)
  goodFriday.setDate(easter.getDate() - 2)
  const easterMonday = new Date(easter)
  easterMonday.setDate(easter.getDate() + 1)
  const fmt = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return {
    '01-01': 'Deň vzniku SR',
    '01-06': 'Traja králi',
    [fmt(goodFriday)]: 'Veľký piatok',
    [fmt(easterMonday)]: 'Veľkonočný pondelok',
    '05-01': 'Sviatok práce',
    '05-08': 'Deň víťazstva',
    '07-05': 'Sviatok sv. Cyrila a Metoda',
    '08-29': 'SNP',
    '09-01': 'Deň Ústavy SR',
    '09-15': 'Sedembolestná Panna Mária',
    '11-01': 'Sviatok všetkých svätých',
    '11-17': 'Deň boja za slobodu',
    '12-24': 'Štedrý deň',
    '12-25': 'Prvý sviatok vianočný',
    '12-26': 'Druhý sviatok vianočný',
  }
}

function isWorkFree(d: Date): boolean {
  const wf = getWorkFreeForYear(d.getFullYear())
  const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return key in wf || d.getDay() === 0 || d.getDay() === 6
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = sessionStorage.getItem('infosk-sid')
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('infosk-sid', sid)
  }
  return sid
}

function windDirArrow(deg: number): string {
  const arrows = ['↓','↙','←','↖','↑','↗','→','↘']
  return arrows[Math.round(deg / 45) % 8]
}
function aqiColor(aqi: number): string {
  if (aqi <= 20) return 'text-green-400'
  if (aqi <= 40) return 'text-emerald-400'
  if (aqi <= 60) return 'text-yellow-400'
  if (aqi <= 80) return 'text-orange-400'
  if (aqi <= 100) return 'text-red-400'
  return 'text-purple-400'
}
function aqiLabel(aqi: number): string {
  if (aqi <= 20) return 'Výborný'
  if (aqi <= 40) return 'Dobrý'
  if (aqi <= 60) return 'Stredný'
  if (aqi <= 80) return 'Zlý'
  if (aqi <= 100) return 'Veľmi zlý'
  return 'Extrémny'
}

const CITY_ORDER = ['BA', 'TT', 'NR', 'ZA', 'BB', 'PO', 'KE', 'TATRY']

export default function DaySummaryWidget() {
  const { lang } = useLang()
  const loc = lang === 'sk' ? sk : enUS
  const stats = useWidget<StatsData>('/api/stats', 60 * 1000)
  const astronomy = useWidget<AstronomyData>('/api/astronomy', 30 * 60 * 1000)

  const [now, setNow] = useState<Date | null>(null)
  const [visitors, setVisitors] = useState<VisitorData | null>(null)
  const [showerOpen, setShowerOpen] = useState(false)
  const [auroraOpen, setAuroraOpen] = useState(false)
  const [spaceOpen, setSpaceOpen] = useState(false)
  const [flightsOpen, setFlightsOpen] = useState(false)
  const [holidayOpen, setHolidayOpen] = useState(false)
  const [dayPopupOpen, setDayPopupOpen] = useState(false)
  const [namedayMiniOpen, setNamedayMiniOpen] = useState(false)
  const [horoscopeMiniOpen, setHoroscopeMiniOpen] = useState(false)
  const [issMiniOpen, setIssMiniOpen] = useState(false)
  const [launchesMiniOpen, setLaunchesMiniOpen] = useState(false)
  const [mhdOpen, setMhdOpen] = useState(false)
  const [trainOpen, setTrainOpen] = useState(false)
  const [officeOpen, setOfficeOpen] = useState(false)
  const [lotteryOpen, setLotteryOpen] = useState(false)
  const [dealsOpen, setDealsOpen] = useState(false)
  const [envMiniOpen, setEnvMiniOpen] = useState(false)
  const [energyMiniOpen, setEnergyMiniOpen] = useState(false)
  const [weatherCityKey, setWeatherCityKey] = useState<string | null>(null)
  const slovakFacts = useWidget<SlovakFactsData>('/api/slovakfacts', 60 * 1000)

  const anyPopupOpen = showerOpen || auroraOpen || spaceOpen || flightsOpen || holidayOpen || dayPopupOpen || namedayMiniOpen || horoscopeMiniOpen || issMiniOpen || launchesMiniOpen || mhdOpen || trainOpen || officeOpen || lotteryOpen || dealsOpen || envMiniOpen || energyMiniOpen || !!weatherCityKey

  const holiday = useMemo(() => now ? getHoliday(now) : null, [now])
  const nextHolidays = useMemo(() => now ? getNextHolidays(now, 6) : [], [now])
  const nextHol = nextHolidays[0] ?? null

  useEffect(() => {
    setNow(new Date())
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const sid = getSessionId()
    const doVisit = () => {
      fetch(`/api/visitors?action=visit&sid=${sid}`)
        .then(r => r.json())
        .then((v: VisitorData) => setVisitors(v))
        .catch(() => {})
    }
    const doPing = () => {
      fetch(`/api/visitors?action=ping&sid=${sid}`)
        .then(r => r.json())
        .then((v: VisitorData) => setVisitors(v))
        .catch(() => {})
    }
    doVisit()
    const ping = setInterval(doPing, 60 * 1000)
    return () => clearInterval(ping)
  }, [])

  const timeStr = now ? now.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'
  const today = now ? now.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''

  const astro = astronomy.data

  return (
    <div className={`widget-card !py-3 !px-4 border-violet-500/15 relative card-entrance ${anyPopupOpen ? 'z-[9998]' : ''}`} style={anyPopupOpen ? { backdropFilter: 'none', WebkitBackdropFilter: 'none' } : undefined}>
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-indigo-600/3 to-transparent pointer-events-none" />
      <div className="relative space-y-2">
        {/* Row 1: Clock + Meniny + Horoskop + ISS/Launches + Stats + Fact */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* Clock */}
          <div className="flex flex-col shrink-0">
            <span className="text-2xl font-mono font-bold text-white tabular-nums tracking-tight leading-none" suppressHydrationWarning>{timeStr}</span>
            <button onClick={() => setDayPopupOpen(o => !o)} className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 hover:text-amber-300 transition-colors capitalize cursor-pointer" suppressHydrationWarning>
              <span className="font-medium">{today}</span>
              {now && isWorkFree(now) && <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full">🏠 voľno</span>}
              {now && (() => {
                const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
                const daysInYear = new Date(now.getFullYear(), 1, 29).getDate() === 29 ? 366 : 365
                const weekNum = Math.ceil(((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay()) / 7)
                return (
                  <span className="text-[8px] text-slate-500 font-mono">W{weekNum} · D{dayOfYear}/{daysInYear}</span>
                )
              })()}
              <span className="text-[8px] text-slate-600">▼</span>
            </button>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/8" />

          {/* Holiday / Next holiday */}
          {holiday ? (
            <button onClick={() => setHolidayOpen(o => !o)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] shrink-0 hover:bg-rose-500/15 transition-colors">
              <span>🎉</span>
              <span className="text-rose-300 font-bold">{holiday}</span>
            </button>
          ) : nextHol ? (
            <button onClick={() => setHolidayOpen(o => !o)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-[10px] shrink-0 hover:bg-emerald-500/12 transition-colors">
              <span>🗓️</span>
              <span className="text-emerald-300 font-bold">{nextHol.name}</span>
              <span className="text-[9px] text-slate-500">za {nextHol.daysUntil}d</span>
            </button>
          ) : null}
          {holidayOpen && (
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setHolidayOpen(false)}>
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div className="relative w-full max-w-[360px] bg-[var(--bg-card)] border border-emerald-500/20 rounded-2xl shadow-2xl p-4 space-y-3" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-300">🗓️ Sviatky a dni pracovného pokoja</span>
                  <button onClick={() => setHolidayOpen(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
                </div>
                {holiday && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-lg">🎉</span>
                    <div>
                      <span className="text-sm font-bold text-rose-300">Dnes: {holiday}</span>
                      {now && isWorkFree(now) && <span className="ml-2 text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full">🏠 voľno</span>}
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  {nextHolidays.slice(0, 5).map((h, i) => {
                    const hKey = `${String(h.date.getMonth() + 1).padStart(2, '0')}-${String(h.date.getDate()).padStart(2, '0')}`
                    const wfMap = getWorkFreeForYear(h.date.getFullYear())
                    const wf = hKey in wfMap
                    return (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                        <span className="text-sm">{wf ? '🏠' : '🗓️'}</span>
                        <div className="flex-1">
                          <span className="text-[11px] font-semibold text-slate-200">{h.name}</span>
                          {wf && <span className="ml-1.5 text-[8px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded-full">voľno</span>}
                          <span className="text-[10px] text-slate-500 ml-2">{format(h.date, 'd. MMMM yyyy', { locale: loc })}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">za {h.daysUntil}d</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Day popup - Dnešný deň v číslach */}
          {dayPopupOpen && now && (
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setDayPopupOpen(false)}>
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div className="relative w-full max-w-[480px] bg-[var(--bg-card)] border border-amber-500/20 rounded-2xl shadow-2xl p-4 space-y-3 max-h-[70vh] overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-300">📅 {now.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <button onClick={() => setDayPopupOpen(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
                </div>
                {(() => {
                  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
                  const daysInYear = new Date(now.getFullYear(), 1, 29).getDate() === 29 ? 366 : 365
                  const yearPct = Math.round((dayOfYear / daysInYear) * 1000) / 10
                  const weekNum = Math.ceil(((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(now.getFullYear(), 0, 1).getDay()) / 7)
                  return (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-slate-400">
                      <span>📆 W{weekNum}</span>
                      <span>·</span>
                      <span>Deň {dayOfYear}/{daysInYear}</span>
                      <span>·</span>
                      <span className="text-amber-400 font-bold">{yearPct}% roka</span>
                    </div>
                  )
                })()}
                {slovakFacts.loading && <p className="text-xs text-slate-500">Načítavam...</p>}
                {slovakFacts.data && (
                  <div className="grid grid-cols-2 gap-2">
                    {slovakFacts.data.dynamicFacts.map((f, i) => (
                      <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-base">{f.icon}</span>
                          <span className="text-[9px] text-slate-500">{f.title}</span>
                        </div>
                        <div className="text-[13px] font-bold text-white tabular-nums font-mono">{f.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meniny (clickable mini widget) */}
          <NamedayMini showLabel onOpenChange={setNamedayMiniOpen} />
          {/* Horoscope (next to meniny) */}
          <HoroscopeMini onOpenChange={setHoroscopeMiniOpen} />

          <div className="hidden md:block w-px h-6 bg-white/5" />

          {/* ISS & Launches & Flights */}
          <ISSPassMini onOpenChange={setIssMiniOpen} />
          <LaunchesMini onOpenChange={setLaunchesMiniOpen} />
          <button onClick={() => setFlightsOpen(o => !o)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border shrink-0 ${
              flightsOpen ? 'bg-sky-500/15 border-sky-500/25 text-sky-300' : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-sky-300 hover:border-sky-500/20'
            }`}>
            <span>✈️</span><span className="hidden sm:inline">Lety</span>
          </button>

          {/* Merged Space button (Meteor + Aurora + Moon + Planets) */}
          <button onClick={() => setSpaceOpen(o => !o)}
            className={`hidden md:flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg border transition-all ${
              spaceOpen ? 'bg-purple-500/15 border-purple-500/25 text-purple-300' : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-purple-300 hover:border-purple-500/20'
            }`}>
            <span className="text-sm">🌌</span>
            <span className="text-[10px] font-bold">Vesmír</span>
          </button>

          {/* Space popup (merged: meteor shower + aurora + moon + planets) */}
          {spaceOpen && (
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setSpaceOpen(false)}>
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div className="relative w-full max-w-[420px] bg-[var(--bg-card)] border border-purple-500/20 rounded-2xl shadow-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-purple-300">🌌 Vesmír</span>
                  <button onClick={() => setSpaceOpen(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
                </div>
                {/* Meteor shower */}
                {astro?.nextShower && (
                  <div className={`rounded-xl p-3 space-y-2 border ${astro.nextShower.active ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-white/[0.03] border-white/5'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-yellow-300">☄️ {astro.nextShower.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${astro.nextShower.active ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-400'}`}>
                        {astro.nextShower.active ? '🔥 Aktívny' : `Za ${astro.nextShower.daysUntil} dní`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div><span className="text-slate-500">ZHR:</span> <span className="text-yellow-300 font-bold">{astro.nextShower.zhr}/h</span></div>
                      <div><span className="text-slate-500">Pôvod:</span> <span className="text-slate-300">{astro.nextShower.parent}</span></div>
                    </div>
                  </div>
                )}
                {/* Aurora */}
                {astro?.aurora && (
                  <div className={`rounded-xl p-3 space-y-2 border ${astro.aurora.visibleFromSK ? 'bg-green-500/10 border-green-500/20' : 'bg-white/[0.03] border-white/5'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-green-300">🌌 Polárna žiara · Kp{astro.aurora.kpIndex}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${astro.aurora.visibleFromSK ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
                        {astro.aurora.visibleFromSK ? '✅ Viditeľná zo SK' : '❌ Nie zo SK'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">Šanca: {astro.aurora.chance}</div>
                  </div>
                )}
                {/* Moon conditions */}
                {astro?.moonConditions && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{astro.moonConditions.illumination > 80 ? '🌕' : astro.moonConditions.illumination > 50 ? '🌔' : astro.moonConditions.illumination > 20 ? '🌓' : '🌑'}</span>
                      <div>
                        <div className="text-[10px] text-slate-500">Mesiac: <span className="text-white font-bold">{astro.moonConditions.illumination}%</span> osvetlenie</div>
                        <div className="text-[10px] text-slate-500">{astro.moonConditions.goodForViewing ? '✅ Dobré podmienky' : '❌ Slabé podmienky'}</div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Visible planets */}
                {astro?.planets && astro.planets.planets.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 mb-1">🪐 Viditeľné planéty</div>
                    <div className="text-[11px] text-white font-semibold">{astro.planets.planets.join(', ')}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{astro.planets.note}</div>
                  </div>
                )}
                {/* Space facts & fun info */}
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-2">
                  <div className="text-[10px] text-purple-400 font-bold">🔭 Zaujímavosti z vesmíru</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: '🌍', label: 'Vzdialenosť Mesiac', value: '384 400 km' },
                      { icon: '☀️', label: 'Vzdialenosť Slnko', value: '149.6 mil km' },
                      { icon: '🚀', label: 'ISS rýchlosť', value: '27 600 km/h' },
                      { icon: '🌡️', label: 'Povrch Slnka', value: '5 500 °C' },
                      { icon: '⏱️', label: 'Svetlo zo Slnka', value: '8 min 20 s' },
                      { icon: '🪐', label: 'Obeh Saturna', value: '29.5 rokov' },
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-sm">{f.icon}</span>
                        <div>
                          <div className="text-[8px] text-slate-500">{f.label}</div>
                          <div className="text-[10px] text-white font-bold">{f.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Next eclipse */}
                {astro?.nextEclipse && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-300">
                        {astro.nextEclipse.type === 'solar' ? '🌑' : '🌕'} {astro.nextEclipse.name}
                      </span>
                      <span className="text-[9px] text-slate-500">za {astro.nextEclipse.daysUntil} dní</span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1">
                      {astro.nextEclipse.date} · {astro.nextEclipse.visible}
                    </div>
                  </div>
                )}
                {/* Daily space tip */}
                {now && (() => {
                  const tips = [
                    'Najlepšie pozorovanie oblohy je 45 min po západe slnka 🌅',
                    'Medzinárodná vesmírna stanica je 3. najjasnejší objekt na nočnej oblohe 🌟',
                    'Na Marse trvá deň 24 hodín a 37 minút ⏰',
                    'Jupiter má 95 známych mesiacov 🪐',
                    'Voyager 1 je najvzdialenejší ľudský objekt — 24 mld km od Zeme 🛰️',
                    'Neutrónová hviezda sa točí až 716× za sekundu 💫',
                    'Vo vesmíre je viac hviezd ako zrniek piesku na Zemi 🏖️',
                  ]
                  const tip = tips[now.getDate() % tips.length]
                  return (
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-2.5 text-[9px] text-purple-300/80">
                      💡 {tip}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          <div className="hidden md:block w-px h-6 bg-white/5" />

          {/* Online indicator */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0" suppressHydrationWarning>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-[10px] font-bold text-green-400">{visitors ? String(visitors.activeNow) : '...'}</span>
            <span className="text-[9px] text-slate-600">online</span>
          </div>
          <Pill icon="" value={visitors ? String(visitors.todayPageViews) : '...'} label="dnes" valueColor="text-orange-300" />
        </div>

        {/* Row 2: Section quick-nav + panel icons */}
        <div className="flex flex-wrap items-center gap-0.5 pt-1.5 border-t border-white/5">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              className="flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
              title={s.label}>
              <span>{s.icon}</span>
              <span className="hidden lg:inline">{s.label}</span>
            </button>
          ))}

          <div className="w-px h-4 bg-white/5 mx-1" />

          {/* Panel icons: MHD, Train, Office, Lottery, Deals */}
          <button onClick={() => setMhdOpen(o => !o)}
            className={`flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-1 rounded-md transition-all border ${mhdOpen ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border-transparent hover:border-white/10'}`}
            title="MHD Odchody">
            <span>🚌</span>
            <span className="hidden lg:inline">MHD</span>
          </button>
          <button onClick={() => setTrainOpen(o => !o)}
            className={`flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-1 rounded-md transition-all border ${trainOpen ? 'bg-blue-500/15 text-blue-300 border-blue-500/20' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border-transparent hover:border-white/10'}`}
            title="Meškanie vlakov">
            <span>🚂</span>
            <span className="hidden lg:inline">Vlaky</span>
          </button>
          <button onClick={() => setOfficeOpen(o => !o)}
            className={`flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-1 rounded-md transition-all border ${officeOpen ? 'bg-orange-500/15 text-orange-300 border-orange-500/20' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border-transparent hover:border-white/10'}`}
            title="Čakacie doby">
            <span>🏛️</span>
            <span className="hidden lg:inline">Úrady</span>
          </button>
          <button onClick={() => setLotteryOpen(o => !o)}
            className={`flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-1 rounded-md transition-all border ${lotteryOpen ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border-transparent hover:border-white/10'}`}
            title="Lotéria">
            <span>🎰</span>
            <span className="hidden lg:inline">Lotéria</span>
          </button>
          <button onClick={() => setDealsOpen(o => !o)}
            className={`flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-1 rounded-md transition-all border ${dealsOpen ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border-transparent hover:border-white/10'}`}
            title="Zľavy dnes">
            <span>🏷️</span>
            <span className="hidden lg:inline">Zľavy</span>
          </button>
          <EnvironmentMini onOpenChange={setEnvMiniOpen} />
          <EnergyMini onOpenChange={setEnergyMiniOpen} />

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 anim-pulse-dot" />
            </div>
          </div>
        </div>

        {/* Panel popups */}
        {mhdOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setMhdOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-[500px]" onClick={e => e.stopPropagation()}>
              <button onClick={() => setMhdOpen(false)} className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-white/10 text-sm">✕</button>
              <MHDWidget />
            </div>
          </div>
        )}
        {trainOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setTrainOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-[500px]" onClick={e => e.stopPropagation()}>
              <button onClick={() => setTrainOpen(false)} className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-white/10 text-sm">✕</button>
              <TrainDelaysWidget />
            </div>
          </div>
        )}
        {officeOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setOfficeOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-[500px]" onClick={e => e.stopPropagation()}>
              <button onClick={() => setOfficeOpen(false)} className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-white/10 text-sm">✕</button>
              <OfficeWaitWidget />
            </div>
          </div>
        )}
        {lotteryOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setLotteryOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-[500px]" onClick={e => e.stopPropagation()}>
              <button onClick={() => setLotteryOpen(false)} className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-white/10 text-sm">✕</button>
              <LotteryWidget />
            </div>
          </div>
        )}
        {dealsOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setDealsOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-[500px]" onClick={e => e.stopPropagation()}>
              <button onClick={() => setDealsOpen(false)} className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-white/10 text-sm">✕</button>
              <DealsWidget />
            </div>
          </div>
        )}
        {flightsOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setFlightsOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-[500px]" onClick={e => e.stopPropagation()}>
              <button onClick={() => setFlightsOpen(false)} className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-white/10 text-sm">✕</button>
              <FlightsWidget />
            </div>
          </div>
        )}

        {/* Compact Weather Strip */}
        {stats.data?.cityTemps && stats.data.cityTemps.length > 0 && (
          <div className="pt-2 border-t border-white/5">
            {/* Warnings */}
            {(stats.data.warnings ?? []).length > 0 && (
              <div className="mb-1.5 space-y-0.5">
                {(stats.data.warnings ?? []).slice(0, 2).map((w, i) => (
                  <div key={i} className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[9px] font-semibold border ${
                    w.severity === 'high' ? 'bg-red-500/8 border-red-500/15 text-red-400' : 'bg-yellow-500/8 border-yellow-500/15 text-yellow-400'
                  }`}>
                    <span>{w.type === 'wind' ? '💨' : w.type === 'rain' ? '🌧️' : w.type === 'uv' ? '☀️' : w.type === 'heat' ? '🔥' : '❄️'}</span>
                    <span className="truncate">⚠️ {w.message}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
              {/* City cards sorted by CITY_ORDER */}
              {[...stats.data.cityTemps].sort((a, b) => {
                const ai = CITY_ORDER.indexOf(a.key)
                const bi = CITY_ORDER.indexOf(b.key)
                return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
              }).map(c => {
                const icon = WMO_MINI[c.weatherCode] ?? '🌡️'
                const tempColor = c.temp >= 25 ? 'text-orange-400' : c.temp >= 15 ? 'text-amber-400' : c.temp >= 5 ? 'text-blue-400' : c.temp >= 0 ? 'text-indigo-400' : 'text-violet-400'
                const cityAqi = stats.data?.cityAQI?.find(a => a.key === c.key)?.aqi ?? 0
                return (
                  <button key={c.key} onClick={() => setWeatherCityKey(c.key)} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-blue-500/20 transition-all shrink-0 cursor-pointer">
                    <span className="text-base">{icon}</span>
                    <div className="min-w-0 text-left">
                      <div className="text-[9px] text-slate-500 font-semibold truncate">{c.name}</div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-[13px] font-bold tabular-nums ${tempColor}`}>{c.temp}°</span>
                        <span className="text-[8px] text-slate-600">{c.tempMin}°/{c.tempMax}°</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[8px] text-slate-500" title={`Vietor ${c.windSpeed} km/h`}>{windDirArrow(c.windDir)} {c.windSpeed}</span>
                      {cityAqi > 0 && <span className={`text-[7px] font-bold ${aqiColor(cityAqi)}`} title={`AQI: ${aqiLabel(cityAqi)}`}>AQI {cityAqi}</span>}
                    </div>
                  </button>
                )
              })}
              {/* Sunrise/Sunset animation card (last) */}
              {(() => {
                const ba = stats.data?.cityTemps?.find(ct => ct.key === 'BA')
                if (!ba) return null
                const sunriseTime = ba.sunrise ? ba.sunrise.split('T')[1]?.slice(0, 5) : '--:--'
                const sunsetTime = ba.sunset ? ba.sunset.split('T')[1]?.slice(0, 5) : '--:--'
                const sunriseMin = ba.sunrise ? (() => { const p = ba.sunrise.split('T')[1]?.split(':'); return p ? parseInt(p[0]) * 60 + parseInt(p[1]) : 0 })() : 0
                const sunsetMin = ba.sunset ? (() => { const p = ba.sunset.split('T')[1]?.split(':'); return p ? parseInt(p[0]) * 60 + parseInt(p[1]) : 0 })() : 0
                const nowMin = now ? now.getHours() * 60 + now.getMinutes() : 720
                const dayLength = sunsetMin - sunriseMin
                const dayH = Math.floor(dayLength / 60)
                const dayM = dayLength % 60
                const sunPct = sunriseMin && sunsetMin ? Math.max(0, Math.min(100, ((nowMin - sunriseMin) / (sunsetMin - sunriseMin)) * 100)) : 50
                const isDay = nowMin >= sunriseMin && nowMin <= sunsetMin
                return (
                  <div className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-b from-amber-500/[0.06] via-orange-500/[0.04] to-rose-500/[0.03] border border-amber-500/15 shrink-0 min-w-[120px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent pointer-events-none" />
                    <div className="relative flex items-center gap-3 text-[9px]">
                      <div className="flex flex-col items-center">
                        <span className="text-lg leading-none">🌅</span>
                        <span className="text-amber-400 font-bold">{sunriseTime}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg leading-none">🌇</span>
                        <span className="text-orange-400 font-bold">{sunsetTime}</span>
                      </div>
                    </div>
                    <div className="relative w-full h-[6px] bg-white/5 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 via-yellow-400/40 to-orange-500/30 rounded-full" />
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-lg transition-all" style={{ left: `calc(${sunPct}% - 6px)`, background: isDay ? '#fbbf24' : '#64748b', boxShadow: isDay ? '0 0 10px #fbbf24, 0 0 20px rgba(251,191,36,0.3)' : 'none' }}>
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px]">{isDay ? '☀️' : '🌙'}</span>
                      </div>
                    </div>
                    <div className="relative text-[8px] text-amber-400/70 font-semibold">{dayH}h {dayM}m svetla</div>
                  </div>
                )
              })()}
            </div>
            {/* Weather city detail popup */}
            {weatherCityKey && (() => {
              const c = stats.data?.cityTemps?.find(ct => ct.key === weatherCityKey)
              if (!c) return null
              const icon = WMO_MINI[c.weatherCode] ?? '🌡️'
              const tempColor = c.temp >= 25 ? 'text-orange-400' : c.temp >= 15 ? 'text-amber-400' : c.temp >= 5 ? 'text-blue-400' : c.temp >= 0 ? 'text-indigo-400' : 'text-violet-400'
              const tomorrowIcon = c.tomorrowCode != null ? (WMO_MINI[c.tomorrowCode] ?? '🌡️') : null
              const cityAqi = stats.data?.cityAQI?.find(a => a.key === c.key)?.aqi ?? 0
              return (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setWeatherCityKey(null)}>
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <div className="relative w-full max-w-[400px] bg-[var(--bg-card)] border border-blue-500/20 rounded-2xl shadow-2xl p-5 space-y-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-300">{icon} {c.name}</span>
                      <button onClick={() => setWeatherCityKey(null)} className="text-slate-500 hover:text-white text-lg">✕</button>
                    </div>
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <div className="text-4xl">{icon}</div>
                        <div className={`text-3xl font-bold font-mono ${tempColor}`}>{c.temp}°C</div>
                        <div className="text-[10px] text-slate-500">Pocitovo {c.feelsLike}°C</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 text-center">
                        <div className="text-[9px] text-slate-500">Min / Max</div>
                        <div className="text-[13px] font-bold text-white">{c.tempMin}° / {c.tempMax}°</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 text-center">
                        <div className="text-[9px] text-slate-500">Vlhkosť</div>
                        <div className="text-[13px] font-bold text-cyan-300">{c.humidity}%</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 text-center">
                        <div className="text-[9px] text-slate-500">Vietor</div>
                        <div className="text-[13px] font-bold text-white">{windDirArrow(c.windDir)} {c.windSpeed} km/h</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 text-center">
                        <div className="text-[9px] text-slate-500">Tlak</div>
                        <div className="text-[13px] font-bold text-white">{c.pressure} hPa</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 text-center">
                        <div className="text-[9px] text-slate-500">UV index</div>
                        <div className="text-[13px] font-bold text-amber-300">{c.uvIndex}</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5 text-center">
                        <div className="text-[9px] text-slate-500">AQI</div>
                        <div className={`text-[13px] font-bold ${aqiColor(cityAqi)}`}>{cityAqi > 0 ? `${cityAqi} · ${aqiLabel(cityAqi)}` : '–'}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
                      <span>🌅 {c.sunrise}</span>
                      <span>🌇 {c.sunset}</span>
                    </div>
                    {tomorrowIcon && (
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                        <div className="text-[9px] text-slate-500 mb-1">🗓️ Zajtra</div>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{tomorrowIcon}</span>
                          <span className="text-[13px] font-bold text-white">{c.tomorrowMin}° / {c.tomorrowMax}°</span>
                          {c.tomorrowPrecipProb != null && <span className="text-[10px] text-blue-400">💧 {c.tomorrowPrecipProb}%</span>}
                          {c.tomorrowWindMax != null && <span className="text-[10px] text-slate-400">💨 {c.tomorrowWindMax} km/h</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

function Pill({ icon, value, label, valueColor, mono }: { icon: string; value: string; label: string; valueColor?: string; mono?: boolean }) {
  return (
    <div className="hidden lg:flex items-center gap-1 shrink-0" suppressHydrationWarning>
      <span className="text-sm leading-none">{icon}</span>
      <span className={`text-[10px] font-bold ${valueColor ?? 'text-slate-300'} ${mono ? 'font-mono tabular-nums' : ''}`}>{value}</span>
      <span className="text-[9px] text-slate-600">{label}</span>
    </div>
  )
}
