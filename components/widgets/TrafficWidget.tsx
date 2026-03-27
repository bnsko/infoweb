'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface TrafficItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
}

interface TrafficData {
  items: TrafficItem[]
}

function formatTime(iso: string): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('sk-SK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function getIcon(title: string): string {
  if (title.includes('Nehoda') || title.includes('🚗')) return '🚗'
  if (title.includes('Zápcha') || title.includes('🚦')) return '🚦'
  if (title.includes('Uzávierka') || title.includes('🚧')) return '🚧'
  if (title.includes('Havária')) return '💥'
  return '⚠️'
}

export default function TrafficWidget() {
  const { data, loading, error, refetch } = useWidget<TrafficData>('/api/traffic', 2 * 60 * 1000)

  return (
    <WidgetCard accent="rose" title="Dopravné udalosti" icon="🚗" onRefresh={refetch}>
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba načítania dopravných dát</p>}
      {!loading && data && (
        <div className="space-y-0.5 max-h-[380px] overflow-y-auto">
          {data.items.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">Žiadne aktuálne dopravné udalosti</p>
          ) : (
            data.items.map((item, i) => (
              <div key={i} className="news-item py-1.5 group">
                {item.link ? (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="block">
                    <TrafficItemRow item={item} />
                  </a>
                ) : (
                  <TrafficItemRow item={item} />
                )}
              </div>
            ))
          )}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">Waze · Polícia SR · obnova 2 min</p>
    </WidgetCard>
  )
}

function TrafficItemRow({ item }: { item: TrafficItem }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm shrink-0 mt-0.5">{getIcon(item.title)}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-200 group-hover:text-white leading-snug line-clamp-2 transition-colors">
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-rose-400/70 font-medium">{item.source}</span>
          {item.pubDate && <span className="text-[10px] text-slate-600">{formatTime(item.pubDate)}</span>}
        </div>
      </div>
    </div>
  )
}
