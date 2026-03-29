'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWidget } from '@/hooks/useWidget'
import type { StatsData } from '@/lib/types'
import { useLang } from '@/hooks/useLang'
import { HoroscopeMini, FactMini } from '@/components/widgets/DailyQuoteWidget'
import { NamedayMini } from '@/components/widgets/NamedayWidget'
import { ISSPassMini } from '@/components/widgets/SpaceEnvWidget'
import { LaunchesMini } from '@/components/widgets/LaunchesWidget'

interface VisitorData {
  lifetimeViews: number; lifetimeUnique: number; activeNow: number; todayPageViews: number; uptimeMs: number; lastHourViews?: number
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
  const stats = useWidget<StatsData>('/api/stats', 60 * 1000)
  const astronomy = useWidget<AstronomyData>('/api/astronomy', 30 * 60 * 1000)

  const [now, setNow] = useState<Date | null>(null)
  const [visitors, setVisitors] = useState<VisitorData | null>(null)
  const [uptime, setUptime] = useState('00:00:00')

  useEffect(() => {
    setNow(new Date())
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const updateUptime = useCallback((v: VisitorData) => {
    const elapsed = Math.floor(v.uptimeMs / 1000)
    const d = Math.floor(elapsed / 86400)
    const h = Math.floor((elapsed % 86400) / 3600).toString().padStart(2, '0')
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0')
    const s = (elapsed % 60).toString().padStart(2, '0')
    setUptime(d > 0 ? `${d}d ${h}:${m}:${s}` : `${h}:${m}:${s}`)
  }, [])

  useEffect(() => {
    const sid = getSessionId()
    const doVisit = () => {
      fetch(`/api/visitors?action=visit&sid=${sid}`)
        .then(r => r.json())
        .then((v: VisitorData) => { setVisitors(v); updateUptime(v) })
        .catch(() => {})
    }
    const doPing = () => {
      fetch(`/api/visitors?action=ping&sid=${sid}`)
        .then(r => r.json())
        .then((v: VisitorData) => { setVisitors(v); updateUptime(v) })
        .catch(() => {})
    }
    doVisit()
    const ping = setInterval(doPing, 60 * 1000)
    return () => clearInterval(ping)
  }, [updateUptime])

  const timeStr = now ? now.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'
  const today = now ? now.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''

  const astro = astronomy.data

  return (
    <div className="widget-card !py-3 !px-4 border-violet-500/15 relative overflow-hidden card-entrance">
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

          {/* Meniny (clickable mini widget) */}
          <NamedayMini />
          {/* Horoscope (next to meniny) */}
          <HoroscopeMini />

          <div className="hidden md:block w-px h-6 bg-white/5" />

          {/* Day of year */}
          <Pill icon="📅" value={stats.loading ? '...' : `${stats.data?.dayOfYear ?? '?'}/${stats.data?.daysInYear ?? 365}`} label="deň roka" />

          {/* ISS & Launches (before online) */}
          <ISSPassMini />
          <LaunchesMini />

          {/* Meteor shower / Aurora (moved up here) */}
          {astro?.nextShower && (
            <div className={`hidden md:flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg border cursor-help ${
              astro.nextShower.active ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-white/[0.02] border-white/5'
            }`} title={`ZHR: ${astro.nextShower.zhr} · ${astro.nextShower.active ? 'Aktívny meteorický roj!' : `Ďalšie za ${astro.nextShower.daysUntil} dní`}`}>
              <span className="text-sm">☄️</span>
              <span className={`text-[10px] font-bold ${astro.nextShower.active ? 'text-yellow-300' : 'text-slate-300'}`}>{astro.nextShower.name}</span>
              <span className="text-[9px] text-slate-500">
                {astro.nextShower.active ? '🔥' : `${astro.nextShower.daysUntil}d`}
              </span>
            </div>
          )}
          {astro?.aurora && astro.aurora.kpIndex >= 3 && (
            <div className={`hidden md:flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg border cursor-help ${
              astro.aurora.visibleFromSK ? 'bg-green-500/10 border-green-500/20' : 'bg-purple-500/8 border-purple-500/15'
            }`} title={`Kp Index: ${astro.aurora.kpIndex} · Šanca: ${astro.aurora.chance} · ${astro.aurora.visibleFromSK ? 'Viditeľná zo SK!' : 'Nie je viditeľná zo SK'}`}>
              <span className="text-sm">🌌</span>
              <span className={`text-[10px] font-bold ${astro.aurora.visibleFromSK ? 'text-green-300' : 'text-purple-300'}`}>
                Aurora Kp{astro.aurora.kpIndex}
              </span>
            </div>
          )}

          <div className="hidden md:block w-px h-6 bg-white/5" />

          {/* Online / sources / visits */}
          <Pill icon="👥" value={visitors ? String(visitors.activeNow) : '...'} label="online" valueColor="text-yellow-400" />
          <Pill icon="🔄" value={`${SOURCES}`} label="zdrojov" valueColor="text-emerald-400" />
          <Pill icon="📊" value={visitors ? String(visitors.todayPageViews) : '...'} label="dnes" valueColor="text-orange-300" />
          <Pill icon="🏆" value={visitors ? String(visitors.lifetimeViews) : '...'} label="celkom" valueColor="text-purple-300" />

          {/* Fact - subtle, far right */}
          <div className="ml-auto flex flex-col items-end gap-1 max-w-xs">
            <FactMini />
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
            {stats.data?.timestamp && (
              <div className="hidden xl:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 anim-pulse-dot" />
                <span className="text-[10px] text-green-400 font-medium">
                  Live · {new Date(stats.data.timestamp).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            <Pill icon="⏱️" value={uptime} label="uptime" mono />
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
