'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useLang } from '@/hooks/useLang'

interface SKEvent {
  title: string; date: string; venue: string; city: string; category: string; emoji: string
}

const COUNTRIES = [
  { key: 'sk', emoji: '🇸🇰', sk: 'Slovensko', en: 'Slovakia' },
  { key: 'cz', emoji: '🇨🇿', sk: 'Česko', en: 'Czechia' },
  { key: 'pl', emoji: '🇵🇱', sk: 'Poľsko', en: 'Poland' },
  { key: 'at', emoji: '🇦🇹', sk: 'Rakúsko', en: 'Austria' },
  { key: 'hu', emoji: '🇭🇺', sk: 'Maďarsko', en: 'Hungary' },
]

const categoryColors: Record<string, string> = {
  concert: 'text-purple-400', sport: 'text-green-400',
  culture: 'text-amber-400', festival: 'text-pink-400', other: 'text-slate-400',
}

function formatEventDate(dateStr: string, t: (k: string) => string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (diffDays === 0) return t('today')
  if (diffDays === 1) return t('tomorrow')
  if (diffDays < 7) return ['Ne','Po','Ut','St','Št','Pi','So'][d.getDay()]
  return `${d.getDate()}.${d.getMonth() + 1}.`
}

export default function EventsWidget() {
  const { t, lang } = useLang()
  const [country, setCountry] = useState('sk')
  const { data, loading, refetch } = useWidget<{ events: SKEvent[] }>(`/api/events?country=${country}`, 60 * 60 * 1000)

  return (
    <WidgetCard accent="purple" title={t('events.title')} icon="🎪" onRefresh={refetch}>
      {/* Country tabs */}
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5 overflow-x-auto scrollbar-hide">
        {COUNTRIES.map(c => (
          <button key={c.key} onClick={() => setCountry(c.key)}
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded-md whitespace-nowrap transition-all ${
              country === c.key ? 'bg-purple-500/15 text-purple-300' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{c.emoji}</span>
            <span className="hidden sm:inline">{lang === 'sk' ? c.sk : c.en}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
        </div>
      ) : data?.events ? (
        <div className="space-y-1 max-h-[320px] overflow-y-auto scrollbar-hide">
          {data.events.slice(0, 12).map((event, i) => {
            const dateLabel = formatEventDate(event.date, t)
            const isToday = dateLabel === t('today')
            return (
              <div key={i} className={`flex items-start gap-2.5 p-2 rounded-lg transition-all ${
                isToday ? 'bg-purple-500/10 border border-purple-500/15' : 'hover:bg-white/[0.03]'
              }`}>
                <div className={`text-center shrink-0 w-8 ${isToday ? 'text-purple-400' : 'text-slate-500'}`}>
                  <div className="text-[10px] font-bold uppercase">{dateLabel}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{event.emoji}</span>
                    <span className={`text-[11px] font-semibold truncate ${categoryColors[event.category] ?? 'text-slate-300'}`}>
                      {event.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">📍 {event.venue}, {event.city}</div>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-600">
        <span>🎵 {t('events.concerts')}</span>
        <span>⚽ {t('events.sport')}</span>
        <span>🎭 {t('events.culture')}</span>
        <span>🎪 {t('events.festivals')}</span>
      </div>
    </WidgetCard>
  )
}
