'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import type { StatsData, WeatherData } from '@/lib/types'
import { getWeatherInfo, getAQIInfo } from '@/lib/utils'
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

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function DaySummaryWidget() {
  const { lang } = useLang()
  const stats   = useWidget<StatsData>('/api/stats',   60 * 1000)
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

  const temp    = weather.data?.current ? Math.round(weather.data.current.temperature_2m) : null
  const maxT    = weather.data?.daily?.temperature_2m_max?.[0] != null ? Math.round(weather.data.daily.temperature_2m_max[0]) : null
  const minT    = weather.data?.daily?.temperature_2m_min?.[0] != null ? Math.round(weather.data.daily.temperature_2m_min[0]) : null
  const wCode   = weather.data?.current?.weather_code ?? null
  const wInfo   = wCode !== null ? getWeatherInfo(wCode) : null
  const aqi     = stats.data?.aqiSK ?? stats.data?.aqi ?? null
  const aqiInfo = aqi !== null ? getAQIInfo(aqi) : null
  const eur     = stats.data?.eurToUsd

  const topHeadline = news.data?.items?.find(i => i.title)

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

        {/* Weather pill */}
        {temp !== null && wInfo && (
          <div className="flex items-center gap-1.5 bg-blue-500/8 border border-blue-500/18 rounded-xl px-3 py-1.5 shrink-0">
            <span className="text-lg leading-none">{wInfo.emoji}</span>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-bold text-blue-300 leading-none">{temp}°C</span>
                {maxT !== null && minT !== null && (
                  <span className="text-[10px] text-slate-500 leading-none">
                    <span className="text-orange-400">↑{maxT}°</span> <span className="text-blue-400">↓{minT}°</span>
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-500 leading-none mt-0.5">{wInfo.label}</div>
            </div>
          </div>
        )}

        {/* AQI pill */}
        {aqi !== null && aqiInfo && (
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 shrink-0">
            <span className="text-lg leading-none">💨</span>
            <div>
              <div className="text-[13px] font-bold leading-none" style={{ color: aqiInfo.color }}>AQI {aqi}</div>
              <div className="text-[9px] leading-none mt-0.5" style={{ color: aqiInfo.color }}>{aqiInfo.label}</div>
            </div>
          </div>
        )}

        {/* EUR/USD pill */}
        {eur != null && (
          <div className="flex items-center gap-1.5 bg-emerald-500/8 border border-emerald-500/18 rounded-xl px-3 py-1.5 shrink-0">
            <span className="text-lg leading-none">💶</span>
            <div>
              <div className="text-[13px] font-bold text-emerald-300 leading-none font-mono">{eur.toFixed(4)}</div>
              <div className="text-[9px] text-slate-500 leading-none mt-0.5">EUR/USD</div>
            </div>
          </div>
        )}

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
