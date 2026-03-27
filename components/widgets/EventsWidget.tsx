'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'

interface SKEvent {
  title: string
  date: string
  venue: string
  city: string
  category: string
  emoji: string
}

interface EventsData {
  events: SKEvent[]
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000)

  if (diffDays === 0) return 'Dnes'
  if (diffDays === 1) return 'Zajtra'
  if (diffDays < 7) {
    const days = ['Ne', 'Po', 'Ut', 'St', 'Št', 'Pi', 'So']
    return days[d.getDay()]
  }
  return `${d.getDate()}.${d.getMonth() + 1}.`
}

const categoryColors: Record<string, string> = {
  concert: 'text-purple-400',
  sport: 'text-green-400',
  culture: 'text-amber-400',
  festival: 'text-pink-400',
  other: 'text-slate-400',
}

export default function EventsWidget() {
  const { data, loading, refetch } = useWidget<EventsData>('/api/events', 60 * 60 * 1000)

  return (
    <WidgetCard accent="purple" title="Podujatia na Slovensku" icon="🎪" onRefresh={refetch}>
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
        </div>
      ) : data?.events ? (
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
          {data.events.slice(0, 12).map((event, i) => {
            const dateLabel = formatEventDate(event.date)
            const isToday = dateLabel === 'Dnes'
            const isTomorrow = dateLabel === 'Zajtra'
            return (
              <div
                key={i}
                className={`flex items-start gap-2.5 p-2 rounded-lg transition-all ${
                  isToday
                    ? 'bg-purple-500/10 border border-purple-500/15'
                    : 'bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div className={`text-center flex-shrink-0 w-10 ${isToday ? 'text-purple-400' : isTomorrow ? 'text-blue-400' : 'text-slate-500'}`}>
                  <div className="text-[10px] font-bold uppercase">{dateLabel}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{event.emoji}</span>
                    <span className={`text-xs font-semibold truncate ${categoryColors[event.category] ?? 'text-slate-300'}`}>
                      {event.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    📍 {event.venue}, {event.city}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-600">
        <span className="flex items-center gap-1">🎵 koncerty</span>
        <span className="flex items-center gap-1">⚽ šport</span>
        <span className="flex items-center gap-1">🎭 kultúra</span>
        <span className="flex items-center gap-1">🎪 festivaly</span>
      </div>
    </WidgetCard>
  )
}
