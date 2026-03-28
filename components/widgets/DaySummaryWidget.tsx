'use client'

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

  const now   = new Date()
  const today = now.toLocaleDateString(lang === 'sk' ? 'sk-SK' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const temp    = weather.data?.current ? Math.round(weather.data.current.temperature_2m) : null
  const wCode   = weather.data?.current?.weather_code ?? null
  const wInfo   = wCode !== null ? getWeatherInfo(wCode) : null
  const aqi     = stats.data?.aqiSK ?? stats.data?.aqi ?? null
  const aqiInfo = aqi !== null ? getAQIInfo(aqi) : null
  const eur     = stats.data?.eurToUsd

  const topHeadline = news.data?.items?.find(i => i.title)

  return (
    <div className="widget-card !py-2.5 !px-4 border-violet-500/10 relative overflow-hidden card-entrance">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/4 via-transparent to-transparent pointer-events-none" />
      <div className="relative flex flex-wrap items-center gap-x-4 gap-y-2">

        {/* Date */}
        <div className="text-[11px] font-semibold text-slate-300 shrink-0 capitalize">
          📅 {today}
        </div>

        {/* Weather pill */}
        {temp !== null && wInfo && (
          <div className="flex items-center gap-1.5 bg-blue-500/8 border border-blue-500/15 rounded-lg px-2 py-1">
            <span className="text-sm">{wInfo.emoji}</span>
            <span className="text-[11px] font-semibold text-blue-300">{temp}°C</span>
            <span className="text-[10px] text-slate-500">{wInfo.label}</span>
          </div>
        )}

        {/* AQI pill */}
        {aqi !== null && aqiInfo && (
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/8 rounded-lg px-2 py-1">
            <span className="text-sm">💨</span>
            <span className="text-[11px] font-semibold" style={{ color: aqiInfo.color }}>AQI {aqi}</span>
            <span className="text-[10px]" style={{ color: aqiInfo.color }}>{aqiInfo.label}</span>
          </div>
        )}

        {/* EUR/USD pill */}
        {eur != null && (
          <div className="flex items-center gap-1.5 bg-emerald-500/8 border border-emerald-500/15 rounded-lg px-2 py-1">
            <span className="text-sm">💶</span>
            <span className="text-[11px] font-semibold text-emerald-300">EUR/USD</span>
            <span className="text-[10px] text-slate-400 font-mono">{eur.toFixed(4)}</span>
          </div>
        )}

        {/* Top headline */}
        {topHeadline && (
          <a href={topHeadline.link} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-1.5 min-w-0 max-w-xs xl:max-w-md hover:opacity-80 transition-opacity">
            <span className="text-[10px] text-slate-600 shrink-0">📰</span>
            <span className="text-[10px] text-slate-400 truncate">{topHeadline.title}</span>
            <span className="text-[10px] text-slate-700 shrink-0">↗</span>
          </a>
        )}

        {/* Quick-scroll nav — right-aligned */}
        <div className="ml-auto flex flex-wrap items-center gap-1">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="flex items-center gap-1 text-[9px] font-semibold px-2 py-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:border-white/8 transition-all"
              title={lang === 'sk' ? s.labelSk : s.labelEn}
            >
              <span>{s.icon}</span>
              <span className="hidden xl:inline">{lang === 'sk' ? s.labelSk : s.labelEn}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
