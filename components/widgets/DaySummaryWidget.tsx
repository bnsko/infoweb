'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWidget } from '@/hooks/useWidget'
import type { WeatherData } from '@/lib/types'
import { useLang } from '@/hooks/useLang'

interface NewsItem { title: string; link: string; source: string }
interface NewsData  { items: NewsItem[] }

const SECTIONS = [
  { id: 'sec-weather',   icon: '🌤️', labelSk: 'Počasie',   labelEn: 'Weather'    },
  { id: 'sec-news',      icon: '📰', labelSk: 'Správy',    labelEn: 'News'       },
  { id: 'sec-finance',   icon: '💶', labelSk: 'Financie',  labelEn: 'Finance'    },
  { id: 'sec-transport', icon: '🚗', labelSk: 'Doprava',   labelEn: 'Transport'  },
  { id: 'sec-prices',    icon: '🛒', labelSk: 'Ceny',      labelEn: 'Prices'     },
  { id: 'sec-space',     icon: '🌌', labelSk: 'Vesmír',    labelEn: 'Space'      },
  { id: 'sec-fun',       icon: '🎮', labelSk: 'Zábava',    labelEn: 'Fun'        },
  { id: 'sec-history',   icon: '📚', labelSk: 'História',  labelEn: 'History'    },
]

const WORK_START = 8
const WORK_END = 17

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function fmtSunTime(iso: string | undefined): string {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })
}

export default function DaySummaryWidget() {
  const { lang } = useLang()
  const weather = useWidget<WeatherData>('/api/weather', 10 * 60 * 1000)
  const news    = useWidget<NewsData>('/api/news', 5 * 60 * 1000)

  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const timeStr = now ? now.toLocaleTimeString(lang === 'sk' ? 'sk-SK' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'
  const today   = now ? now.toLocaleDateString(lang === 'sk' ? 'sk-SK' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }) : ''

  const sunrise = weather.data?.daily?.sunrise?.[0]
  const sunset  = weather.data?.daily?.sunset?.[0]

  // Daylight progress (0–1, animation for arc)
  const sunProgress = useMemo(() => {
    if (!sunrise || !sunset || !now) return 0
    const start = new Date(sunrise).getTime()
    const end   = new Date(sunset).getTime()
    const curr  = now.getTime()
    if (curr <= start) return 0
    if (curr >= end) return 1
    return (curr - start) / (end - start)
  }, [sunrise, sunset, now])

  // Workday progress
  const workday = useMemo(() => {
    if (!now) return { progress: 0, remaining: '', label: '' }
    const h = now.getHours()
    const m = now.getMinutes()
    const currentMin = h * 60 + m
    const startMin = WORK_START * 60
    const endMin   = WORK_END * 60
    if (currentMin < startMin) {
      const till = startMin - currentMin
      return { progress: 0, remaining: `${Math.floor(till / 60)}h ${till % 60}m`, label: lang === 'sk' ? 'do začiatku' : 'until start' }
    }
    if (currentMin >= endMin) {
      return { progress: 1, remaining: '', label: lang === 'sk' ? 'Koniec ✓' : 'Done ✓' }
    }
    const elapsed = currentMin - startMin
    const total = endMin - startMin
    const left = endMin - currentMin
    return { progress: elapsed / total, remaining: `${Math.floor(left / 60)}h ${left % 60}m`, label: lang === 'sk' ? 'zostáva' : 'left' }
  }, [now, lang])

  const topHeadline = news.data?.items?.find(i => i.title)

  // Day fraction for fun metric
  const dayFraction = now ? ((now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400 * 100).toFixed(1) : '0'

  return (
    <div className="widget-card !py-3 !px-4 border-violet-500/15 relative overflow-hidden card-entrance">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-indigo-600/3 to-transparent pointer-events-none" />
      <div className="relative flex flex-wrap items-center gap-x-5 gap-y-2">

        {/* Clock + date block */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <span className="text-2xl font-mono font-bold text-white tabular-nums tracking-tight leading-none" suppressHydrationWarning>
              {timeStr}
            </span>
            <span className="text-[11px] text-slate-400 capitalize mt-0.5 leading-none" suppressHydrationWarning>{today}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-white/8 shrink-0" />

        {/* Sunrise / Sunset pill with arc animation */}
        {sunrise && sunset && (
          <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/15 rounded-xl px-3 py-1.5 shrink-0">
            <div className="relative w-10 h-5 shrink-0">
              {/* Arc path */}
              <svg viewBox="0 0 40 20" className="w-full h-full">
                <path d="M 2 18 Q 20 -2 38 18" fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 2 18 Q 20 -2 38 18" fill="none" stroke="rgba(251,191,36,0.7)" strokeWidth="1.5" strokeLinecap="round"
                  strokeDasharray="60" strokeDashoffset={60 - sunProgress * 60}
                  style={{ transition: 'stroke-dashoffset 2s ease-out' }} />
                {/* Sun dot */}
                <circle
                  cx={2 + sunProgress * 36}
                  cy={18 - Math.sin(sunProgress * Math.PI) * 20}
                  r="2.5"
                  fill={sunProgress >= 1 ? '#475569' : '#fbbf24'}
                  className={sunProgress > 0 && sunProgress < 1 ? 'animate-pulse' : ''}
                />
              </svg>
            </div>
            <div className="flex flex-col text-[10px] leading-tight">
              <span className="text-amber-300">🌅 {fmtSunTime(sunrise)}</span>
              <span className="text-orange-400">🌇 {fmtSunTime(sunset)}</span>
            </div>
          </div>
        )}

        {/* Workday progress pill */}
        <div className="flex items-center gap-2 bg-violet-500/8 border border-violet-500/15 rounded-xl px-3 py-1.5 shrink-0">
          <span className="text-base leading-none">💼</span>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-violet-400 rounded-full transition-all duration-1000" style={{ width: `${workday.progress * 100}%` }} />
              </div>
              <span className="text-[10px] font-bold text-violet-300 tabular-nums">{Math.round(workday.progress * 100)}%</span>
            </div>
            <span className="text-[9px] text-slate-500">
              {workday.remaining && `${workday.remaining} ${workday.label}`}
              {!workday.remaining && workday.label}
            </span>
          </div>
        </div>

        {/* Day % pill */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-1.5 shrink-0" suppressHydrationWarning>
          <span className="text-base leading-none">📊</span>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-300 tabular-nums" suppressHydrationWarning>{dayFraction}%</span>
            <span className="text-[9px] text-slate-500">{lang === 'sk' ? 'deň uplynul' : 'day elapsed'}</span>
          </div>
        </div>

        {/* Top headline */}
        {topHeadline && (
          <a href={topHeadline.link} target="_blank" rel="noopener noreferrer"
             className="hidden xl:flex items-center gap-1.5 min-w-0 max-w-sm hover:opacity-80 transition-opacity">
            <span className="text-[10px] text-slate-600 shrink-0">📰</span>
            <span className="text-[10px] text-slate-400 truncate">{topHeadline.title}</span>
            <span className="text-[10px] text-slate-600 shrink-0">↗</span>
          </a>
        )}

        {/* Quick-scroll nav — right-aligned */}
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="flex items-center gap-1 text-[9px] font-semibold px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
              title={lang === 'sk' ? s.labelSk : s.labelEn}
            >
              <span>{s.icon}</span>
              <span className="hidden lg:inline">{lang === 'sk' ? s.labelSk : s.labelEn}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
