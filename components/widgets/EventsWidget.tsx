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
}

interface EventsData {
  events: SKEvent[]
  today: string
}

const SK_CITIES = [
  { key: 'Bratislava', label: 'BA', name: 'Bratislava', flag: '🏙️' },
  { key: 'Košice',     label: 'KE', name: 'Košice',     flag: '🏰' },
  { key: 'Žilina',    label: 'ZA', name: 'Žilina',     flag: '🏔️' },
  { key: 'Prešov',    label: 'PO', name: 'Prešov',     flag: '🏛️' },
  { key: 'Nitra',     label: 'NR', name: 'Nitra',      flag: '🌾' },
  { key: 'Banská Bystrica', label: 'BB', name: 'B. Bystrica', flag: '⛰️' },
  { key: 'Trnava',    label: 'TT', name: 'Trnava',     flag: '⛪' },
  { key: 'Trenčín',   label: 'TN', name: 'Trenčín',    flag: '🏯' },
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
  const [city, setCity] = useState('Bratislava')
  const { data, loading, refetch } = useWidget<EventsData>(
    `/api/events?country=sk&city=${encodeURIComponent(city)}`,
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
    <WidgetCard accent="yellow" title={t('events.title')} icon="🎭" badge={events.length || undefined} onRefresh={refetch}>
      {/* Regional cities row */}
      <div className="flex flex-wrap gap-1 mb-3">
        {SK_CITIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCity(c.key)}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
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

      {/* City name header */}
      <div className="text-[11px] text-slate-400 font-semibold mb-2">
        📍 {SK_CITIES.find(c => c.key === city)?.name ?? city}
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : events.length === 0 ? (
        <p className="text-[11px] text-slate-500 text-center py-6">
          {lang === 'sk' ? 'Žiadne podujatia' : 'No events'}
        </p>
      ) : (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto scrollbar-hide">
          {events.map((ev, i) => (
            <div key={i} className="bg-white/[0.02] rounded-xl p-3 border border-white/5 hover:border-amber-500/15 transition-all">
              <div className="flex items-start gap-2">
                <span className="text-xl shrink-0 mt-0.5">{ev.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-white leading-snug line-clamp-2">{ev.title}</div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase ${CAT_COLORS[ev.category] ?? CAT_COLORS.other}`}>
                      {ev.category}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">{ev.venue}</span>
                  </div>
                  <div className="text-[10px] text-amber-400/80 mt-0.5 font-medium">
                    {formatDate(ev.date)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}

