'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useWidget } from '@/hooks/useWidget'
import type { StatsData, WeatherData } from '@/lib/types'
import { getAQIInfo } from '@/lib/utils'
import { useLang } from '@/hooks/useLang'

interface NewsItem { title: string; link: string; source: string }
interface NewsData { items: NewsItem[] }

interface VisitorData {
  lifetimeViews: number; lifetimeUnique: number; activeNow: number; todayPageViews: number; uptimeMs: number
}

const SECTIONS = [
  { id: 'sec-weather', icon: '🌤️', label: 'Počasie' },
  { id: 'sec-news', icon: '📰', label: 'Správy' },
  { id: 'sec-finance', icon: '💶', label: 'Financie' },
  { id: 'sec-transport', icon: '🚗', label: 'Doprava' },
  { id: 'sec-prices', icon: '🛒', label: 'Ceny' },
  { id: 'sec-counters', icon: '📊', label: 'Štatistiky' },
  { id: 'sec-space', icon: '🌌', label: 'Vesmír' },
  { id: 'sec-fun', icon: '🎮', label: 'Zábava' },
  { id: 'sec-restaurants', icon: '🍽️', label: 'Reštaurácie' },
  { id: 'sec-invest', icon: '📈', label: 'Investície' },
  { id: 'sec-ai', icon: '🤖', label: 'AI' },
  { id: 'sec-extras', icon: '🔭', label: 'Objavy' },
  { id: 'sec-history', icon: '📚', label: 'História' },
]

const SOURCES = 32

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function fmtSunTime(iso: string | undefined): string {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })
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
  const weather = useWidget<WeatherData>('/api/weather', 10 * 60 * 1000)
  const stats = useWidget<StatsData>('/api/stats', 60 * 1000)
  const news = useWidget<NewsData>('/api/news', 5 * 60 * 1000)

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
  const sunrise = weather.data?.daily?.sunrise?.[0]
  const sunset = weather.data?.daily?.sunset?.[0]

  const sunProgress = useMemo(() => {
    if (!sunrise || !sunset || !now) return 0
    const s = new Date(sunrise).getTime(), e = new Date(sunset).getTime(), c = now.getTime()
    if (c <= s) return 0
    if (c >= e) return 1
    return (c - s) / (e - s)
  }, [sunrise, sunset, now])

  const dayFraction = now ? ((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400 * 100).toFixed(1) : '0'
  const topHeadline = news.data?.items?.find(i => i.title)

  return (
    <div className="widget-card !py-3 !px-4 border-violet-500/15 relative overflow-hidden card-entrance">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-indigo-600/3 to-transparent pointer-events-none" />
      <div className="relative space-y-2">
        {/* Row 1: Clock + sunrise/sunset + stats */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Clock */}
          <div className="flex flex-col shrink-0">
            <span className="text-2xl font-mono font-bold text-white tabular-nums tracking-tight leading-none" suppressHydrationWarning>{timeStr}</span>
            <span className="text-[10px] text-slate-400 capitalize mt-0.5 leading-none" suppressHydrationWarning>{today}</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/8" />

          {/* Sunrise/Sunset arc */}
          {sunrise && sunset && (
            <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/15 rounded-xl px-2.5 py-1 shrink-0">
              <div className="relative w-9 h-4.5 shrink-0">
                <svg viewBox="0 0 40 20" className="w-full h-full">
                  <path d="M 2 18 Q 20 -2 38 18" fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M 2 18 Q 20 -2 38 18" fill="none" stroke="rgba(251,191,36,0.7)" strokeWidth="1.5" strokeLinecap="round"
                    strokeDasharray="60" strokeDashoffset={60 - sunProgress * 60} style={{ transition: 'stroke-dashoffset 2s ease-out' }} />
                  <circle cx={2 + sunProgress * 36} cy={18 - Math.sin(sunProgress * Math.PI) * 20} r="2.5"
                    fill={sunProgress >= 1 ? '#475569' : '#fbbf24'} className={sunProgress > 0 && sunProgress < 1 ? 'animate-pulse' : ''} />
                </svg>
              </div>
              <div className="flex flex-col text-[9px] leading-tight">
                <span className="text-amber-300">🌅 {fmtSunTime(sunrise)}</span>
                <span className="text-orange-400">🌇 {fmtSunTime(sunset)}</span>
              </div>
            </div>
          )}

          {/* Day progress pill */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/8 rounded-xl px-2.5 py-1 shrink-0" suppressHydrationWarning>
            <span className="text-sm leading-none">📊</span>
            <div>
              <span className="text-[10px] font-bold text-slate-300 tabular-nums" suppressHydrationWarning>{dayFraction}%</span>
              <span className="text-[9px] text-slate-500 ml-1">dňa</span>
            </div>
          </div>

          {/* Day of year */}
          <Pill icon="📅" value={stats.loading ? '...' : `${stats.data?.dayOfYear ?? '?'}/${stats.data?.daysInYear ?? 365}`} label="deň roka" />
          {/* Sources */}
          <Pill icon="🔄" value={`${SOURCES}/${SOURCES}`} label="zdrojov" valueColor="text-emerald-400" />
          {/* Online */}
          <Pill icon="👥" value={visitors ? String(visitors.activeNow) : '...'} label="online" valueColor="text-yellow-400" />
          {/* Today visits */}
          <Pill icon="📊" value={visitors ? String(visitors.todayPageViews) : '...'} label="dnes" valueColor="text-orange-300" />
          {/* Lifetime */}
          <Pill icon="🌐" value={visitors ? String(visitors.lifetimeViews) : '...'} label="celkovo" valueColor="text-emerald-300" />
          {/* Uptime */}
          <Pill icon="⏱️" value={uptime} label="uptime" mono />

          {/* Live + Top headline */}
          <div className="ml-auto flex items-center gap-3">
            {topHeadline && (
              <a href={topHeadline.link} target="_blank" rel="noopener noreferrer"
                className="hidden xl:flex items-center gap-1.5 min-w-0 max-w-xs hover:opacity-80 transition-opacity">
                <span className="text-[9px] text-slate-600">📰</span>
                <span className="text-[9px] text-slate-400 truncate">{topHeadline.title}</span>
              </a>
            )}
            {stats.data?.timestamp && (
              <div className="hidden xl:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 anim-pulse-dot" />
                <span className="text-[10px] text-green-400 font-medium">
                  Live · {new Date(stats.data.timestamp).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Section quick-nav */}
        <div className="flex flex-wrap items-center gap-0.5 pt-1.5 border-t border-white/5">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              className="flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
              title={s.label}>
              <span>{s.icon}</span>
              <span className="hidden lg:inline">{s.label}</span>
            </button>
          ))}
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
