'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface SKEvent {
  title: string
  date: string
  venue: string
  city: string
  category: 'concert' | 'sport' | 'culture' | 'festival' | 'other'
  emoji: string
  url?: string
}

interface EventsData {
  events: SKEvent[]
  today: string
}

const SK_CITIES = [
  { key: 'Bratislava', label: 'Bratislava', name: 'Bratislava', flag: '🏙️' },
  { key: 'Košice',     label: 'Košice',     name: 'Košice',     flag: '🏰' },
  { key: 'Žilina',    label: 'Žilina',     name: 'Žilina',     flag: '🏔️' },
  { key: 'Prešov',    label: 'Prešov',     name: 'Prešov',     flag: '🏛️' },
  { key: 'Nitra',     label: 'Nitra',      name: 'Nitra',      flag: '🌾' },
  { key: 'Banská Bystrica', label: 'B. Bystrica', name: 'Banská Bystrica', flag: '⛰️' },
  { key: 'Trnava',    label: 'Trnava',     name: 'Trnava',     flag: '⛪' },
  { key: 'Trenčín',   label: 'Trenčín',    name: 'Trenčín',    flag: '🏯' },
]

const COUNTRIES = [
  { key: 'sk', flag: '🇸🇰', label: 'Slovensko' },
  { key: 'cz', flag: '🇨🇿', label: 'Česko' },
  { key: 'pl', flag: '🇵🇱', label: 'Poľsko' },
  { key: 'hu', flag: '🇭🇺', label: 'Maďarsko' },
  { key: 'at', flag: '🇦🇹', label: 'Rakúsko' },
]

const CAT_COLORS: Record<string, string> = {
  concert: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  sport: 'bg-green-500/15 text-green-400 border-green-500/20',
  culture: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  festival: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  other: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
}

function isToday(dateStr: string, today: string): boolean {
  return dateStr.startsWith(today)
}
function isTomorrow(dateStr: string, today: string): boolean {
  const t = new Date(today)
  t.setDate(t.getDate() + 1)
  return dateStr.startsWith(t.toISOString().slice(0, 10))
}

export default function EventsWidget() {
  const { t, lang } = useLang()
  const [country, setCountry] = useState('sk')
  const [city, setCity] = useState('Bratislava')
  const { data, loading, refetch } = useWidget<EventsData>(
    country === 'sk'
      ? `/api/events?country=sk&city=${encodeURIComponent(city)}`
      : `/api/events?country=${country}`,
    60 * 60 * 1000
  )

  const today = data?.today ?? new Date().toISOString().slice(0, 10)
  const events = data?.events ?? []

  const formatDate = (d: string) => {
    if (isToday(d, today)) return lang === 'sk' ? '📌 Dnes' : '📌 Today'
    if (isTomorrow(d, today)) return lang === 'sk' ? '🗓️ Zajtra' : '🗓️ Tomorrow'
    return new Date(d).toLocaleDateString(lang === 'sk' ? 'sk-SK' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <WidgetCard accent="yellow" title={lang === 'sk' ? 'Podujatia' : 'Events'} icon="🎭" badge={events.length || undefined} onRefresh={refetch}>
      {/* Country selector */}
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {COUNTRIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCountry(c.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              country === c.key ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={c.label}
          >
            <span>{c.flag}</span>
            <span className="hidden sm:inline">{c.label}</span>
          </button>
        ))}
      </div>

      {/* City selector (only for SK) */}
      {country === 'sk' && (
        <div className="flex flex-wrap gap-1 mb-3">
          {SK_CITIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCity(c.key)}
              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-all ${
                city === c.key
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/5'
              }`}
              title={c.name}
            >
              {c.flag} {c.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : events.length === 0 ? (
        <p className="text-[11px] text-slate-500 text-center py-6">
          {lang === 'sk' ? 'Žiadne podujatia' : 'No events'}
        </p>
      ) : (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto scrollbar-hide">
          {events.map((ev, i) => {
            const card = (
              <div className={`bg-white/[0.02] rounded-xl p-3 border border-white/5 transition-all group ${ev.url ? 'hover:border-amber-500/20 hover:bg-white/[0.04] cursor-pointer' : ''}`}>
                <div className="flex items-start gap-2">
                  <span className="text-xl shrink-0 mt-0.5">{ev.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="text-[12px] font-semibold text-white leading-snug line-clamp-2">{ev.title}</div>
                      {ev.url && <span className="text-slate-600 group-hover:text-amber-400 shrink-0 mt-0.5 transition-colors">↗</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase ${CAT_COLORS[ev.category] ?? CAT_COLORS.other}`}>
                        {ev.category}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">📍 {ev.city} · {ev.venue}</span>
                    </div>
                    <div className="text-[10px] text-amber-400/80 mt-0.5 font-medium">
                      {formatDate(ev.date)}
                    </div>
                  </div>
                </div>
              </div>
            )
            return ev.url ? (
              <a key={i} href={ev.url} target="_blank" rel="noopener noreferrer" className="block no-underline">
                {card}
              </a>
            ) : (
              <div key={i}>{card}</div>
            )
          })}
        </div>
      )}
    </WidgetCard>
  )
}

