'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Podcast {
  rank: number
  name: string
  author: string
  category: string
  listeners: number
  trend: 'up' | 'down' | 'stable'
}

interface PodcastData {
  podcasts: Podcast[]
  timestamp: number
}

export default function PodcastSKWidget() {
  const { data, loading, refetch } = useWidget<PodcastData>('/api/podcastsk', 60 * 60 * 1000)

  const trendIcon = (t: string) => t === 'up' ? '▲' : t === 'down' ? '▼' : '–'
  const trendColor = (t: string) => t === 'up' ? 'text-emerald-400' : t === 'down' ? 'text-red-400' : 'text-slate-500'

  return (
    <WidgetCard accent="yellow" title="SK Podcast Charts" icon="🎙️" onRefresh={refetch}>
      {loading && <SkeletonRows rows={8} />}
      {!loading && data && (
        <div className="space-y-0.5">
          {data.podcasts.slice(0, 10).map((p) => (
            <div key={p.rank} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition">
              <span className="text-[11px] font-bold text-yellow-400 w-4 text-right shrink-0">
                {p.rank}
              </span>
              <span className={`text-[8px] ${trendColor(p.trend)} shrink-0`}>{trendIcon(p.trend)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-slate-200 truncate">{p.name}</div>
                <div className="text-[8px] text-slate-500">{p.author}</div>
              </div>
              <span className="text-[7px] bg-white/[0.03] border border-white/5 rounded px-1.5 py-0.5 text-slate-500 shrink-0">
                {p.category}
              </span>
              <span className="text-[9px] text-slate-400 font-mono shrink-0">
                {(p.listeners / 1000).toFixed(0)}k
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">Simulácia · Aktualizácia 1h</p>
    </WidgetCard>
  )
}
