'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWidget } from '@/hooks/useWidget'
import type { StatsData } from '@/lib/types'
import { useLang } from '@/hooks/useLang'
import { HoroscopeMini } from '@/components/widgets/DailyQuoteWidget'
import { NamedayMini } from '@/components/widgets/NamedayWidget'
import { ISSPassMini } from '@/components/widgets/SpaceEnvWidget'
import { LaunchesMini } from '@/components/widgets/LaunchesWidget'
import { SpeedtestMini } from '@/components/widgets/SpeedtestWidget'
import { getHoliday, getNextHoliday } from '@/lib/namedays'
import { format } from 'date-fns'
import { sk, enUS } from 'date-fns/locale'

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
  { id: 'sec-fun', icon: '🎮', label: 'Zábava' },
  { id: 'sec-history', icon: '📚', label: 'História' },
]

const SOURCES = 32

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

export default function DaySummaryWidget() {
  const { lang } = useLang()
  const loc = lang === 'sk' ? sk : enUS
  const stats = useWidget<StatsData>('/api/stats', 60 * 1000)
  const astronomy = useWidget<AstronomyData>('/api/astronomy', 30 * 60 * 1000)

  const [now, setNow] = useState<Date | null>(null)
  const [visitors, setVisitors] = useState<VisitorData | null>(null)
  const [showerOpen, setShowerOpen] = useState(false)
  const [auroraOpen, setAuroraOpen] = useState(false)

  const holiday = useMemo(() => now ? getHoliday(now) : null, [now])
  const nextHol = useMemo(() => now ? getNextHoliday(now) : null, [now])

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
    <div className="widget-card !py-3 !px-4 border-violet-500/15 relative card-entrance">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-indigo-600/3 to-transparent pointer-events-none" />
      <div className="relative space-y-2">
        {/* Row 1: Clock + Meniny + Horoskop + ISS/Launches + Stats + Fact */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* Clock */}
          <div className="flex flex-col shrink-0">
            <span className="text-2xl font-mono font-bold text-white tabular-nums tracking-tight leading-none" suppressHydrationWarning>{timeStr}</span>
            <span className="text-[10px] text-slate-400 capitalize mt-0.5 leading-none" suppressHydrationWarning>{today}</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/8" />

          {/* Holiday / Next holiday */}
          {holiday ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] shrink-0">
              <span>🎉</span>
              <span className="text-rose-300 font-bold">{holiday}</span>
            </div>
          ) : nextHol ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-[10px] shrink-0 cursor-help"
                 title={`${format(nextHol.date, 'd. MMMM', { locale: loc })}`}>
              <span>🗓️</span>
              <span className="text-emerald-300 font-bold">{nextHol.name}</span>
              <span className="text-[9px] text-slate-500">za {nextHol.daysUntil}d</span>
            </div>
          ) : null}

          {/* Meniny (clickable mini widget) */}
          <NamedayMini showLabel />
          {/* Horoscope (next to meniny) */}
          <HoroscopeMini />

          <div className="hidden md:block w-px h-6 bg-white/5" />

          {/* Day of year */}
          <Pill icon="📅" value={stats.loading ? '...' : `${stats.data?.dayOfYear ?? '?'}/${stats.data?.daysInYear ?? 365}`} label="deň roka" />

          {/* ISS & Launches (before online) */}
          <ISSPassMini />
          <LaunchesMini />

          {/* Meteor shower / Aurora (clickable with popup) */}
          {astro?.nextShower && (
            <>
              <button onClick={() => setShowerOpen(o => !o)}
                className={`hidden md:flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg border transition-all ${
                  astro.nextShower.active ? 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/15' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                }`}>
                <span className="text-sm">☄️</span>
                <span className={`text-[10px] font-bold ${astro.nextShower.active ? 'text-yellow-300' : 'text-slate-300'}`}>{astro.nextShower.name}</span>
                <span className="text-[9px] text-slate-500">{astro.nextShower.active ? '🔥' : `${astro.nextShower.daysUntil}d`}</span>
              </button>
              {showerOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setShowerOpen(false)}>
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <div className="relative w-full max-w-[360px] bg-[var(--bg-card)] border border-yellow-500/20 rounded-2xl shadow-2xl p-4 space-y-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-yellow-300">☄️ Meteorický roj</span>
                      <button onClick={() => setShowerOpen(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-yellow-300">{astro.nextShower.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${astro.nextShower.active ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-400'}`}>
                          {astro.nextShower.active ? '🔥 Aktívny' : `Za ${astro.nextShower.daysUntil} dní`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div><span className="text-slate-500">ZHR:</span> <span className="text-yellow-300 font-bold">{astro.nextShower.zhr} meteoritov/h</span></div>
                        <div><span className="text-slate-500">Pôvod:</span> <span className="text-slate-300">{astro.nextShower.parent}</span></div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {astro.nextShower.active
                          ? 'Meteorický roj je práve aktívny! Najlepšie pozorovanie po polnoci za tmavej oblohy, ďaleko od svetelného znečistenia.'
                          : `Ďalší meteorický roj "${astro.nextShower.name}" bude aktívny za ${astro.nextShower.daysUntil} dní. Očakávaná intenzita je ${astro.nextShower.zhr} meteoritov za hodinu.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {astro?.aurora && astro.aurora.kpIndex >= 3 && (
            <>
              <button onClick={() => setAuroraOpen(o => !o)}
                className={`hidden md:flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg border transition-all ${
                  astro.aurora.visibleFromSK ? 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15' : 'bg-purple-500/8 border-purple-500/15 hover:bg-purple-500/12'
                }`}>
                <span className="text-sm">🌌</span>
                <span className={`text-[10px] font-bold ${astro.aurora.visibleFromSK ? 'text-green-300' : 'text-purple-300'}`}>
                  Aurora Kp{astro.aurora.kpIndex}
                </span>
              </button>
              {auroraOpen && (
                <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setAuroraOpen(false)}>
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <div className="relative w-full max-w-[360px] bg-[var(--bg-card)] border border-green-500/20 rounded-2xl shadow-2xl p-4 space-y-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-green-300">🌌 Polárna žiara</span>
                      <button onClick={() => setAuroraOpen(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
                    </div>
                    <div className={`rounded-xl p-3 space-y-2 border ${astro.aurora.visibleFromSK ? 'bg-green-500/10 border-green-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-white">Kp Index: {astro.aurora.kpIndex}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${astro.aurora.visibleFromSK ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
                          {astro.aurora.visibleFromSK ? '✅ Viditeľná zo SK' : '❌ Nie zo SK'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div><span className="text-slate-500">Šanca:</span> <span className="text-green-300 font-bold">{astro.aurora.chance}</span></div>
                        <div><span className="text-slate-500">Viditeľnosť:</span> <span className="text-slate-300">{astro.aurora.visibleFromSK ? 'Áno, na severe SK' : 'Len severnejšie šírky'}</span></div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {astro.aurora.visibleFromSK
                          ? 'Polárna žiara by mohla byť viditeľná aj zo Slovenska! Pozrite sa na sever po zotmení, ideálne z tmavého miesta bez svetelného znečistenia.'
                          : `Kp index ${astro.aurora.kpIndex} naznačuje zvýšenú geomagnetickú aktivitu. Z nášho pozorovacieho bodu (48°N) však aurora pravdepodobne nebude viditeľná. Kp 7+ je potrebný pre viditeľnosť zo SK.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="hidden md:block w-px h-6 bg-white/5" />

          {/* Sources / Online / visits */}
          <Pill icon="�" value={`${SOURCES}`} label="zdrojov" valueColor="text-emerald-400" />
          <Pill icon="🟢" value={visitors ? String(visitors.activeNow) : '...'} label="online" valueColor="text-green-400" />
          <Pill icon="📈" value={visitors ? String(visitors.todayPageViews) : '...'} label="dnes" valueColor="text-orange-300" />
          <Pill icon="👁️" value={visitors ? String(visitors.lifetimeViews) : '...'} label="celkom" valueColor="text-purple-300" />

          {/* Speedtest mini - far right */}
          <div className="ml-auto flex flex-col items-end gap-1 max-w-xs">
            <SpeedtestMini />
            {astro?.planets && (
              <span className="text-[9px] text-slate-500 italic truncate max-w-[220px]" title={astro.planets.note}>
                🔭 {astro.planets.note}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Section quick-nav + uptime/live */}
        <div className="flex flex-wrap items-center gap-0.5 pt-1.5 border-t border-white/5">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              className="flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
              title={s.label}>
              <span>{s.icon}</span>
              <span className="hidden lg:inline">{s.label}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 anim-pulse-dot" />
              <span className="text-[10px] text-green-400 font-medium" suppressHydrationWarning>
                Live · {now ? now.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
              </span>
            </div>
            <Pill icon="⏱️" value={now ? now.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }) : '--:--'} label="aktualizované" mono />
          </div>
        </div>
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
