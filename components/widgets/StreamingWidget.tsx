'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface StreamItem {
  title: string
  platform: string
  type: 'movie' | 'series'
  genre: string
  rating?: string
  year?: number
}

interface StreamData {
  items: StreamItem[]
  timestamp: number
}

const PLATFORM_STYLE: Record<string, { bg: string; text: string }> = {
  'Netflix': { bg: 'bg-red-500/15', text: 'text-red-400' },
  'HBO Max': { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  'Disney+': { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  'Apple TV+': { bg: 'bg-slate-400/15', text: 'text-slate-300' },
  'Amazon Prime': { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
}

export default function StreamingWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<StreamData>('/api/streaming', 60 * 60 * 1000)

  const items = data?.items ?? []

  return (
    <WidgetCard accent="purple" title={lang === 'sk' ? 'Streaming trendy' : 'Streaming Trending'} icon="🎬" onRefresh={refetch}>
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && items.length > 0 && (
        <div className="space-y-1">
          {items.map((item, i) => {
            const ps = PLATFORM_STYLE[item.platform] ?? { bg: 'bg-slate-500/15', text: 'text-slate-400' }
            return (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                <span className="text-[10px] font-bold text-slate-500 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-slate-200 block truncate">{item.title}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[7px] px-1 py-0.5 rounded font-bold ${ps.bg} ${ps.text}`}>{item.platform}</span>
                    <span className="text-[8px] text-slate-500">{item.genre}</span>
                    {item.year && <span className="text-[8px] text-slate-600">{item.year}</span>}
                  </div>
                </div>
                {item.rating && (
                  <span className="text-[10px] font-bold text-yellow-400">⭐ {item.rating}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </WidgetCard>
  )
}
