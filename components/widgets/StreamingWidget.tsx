'use client'

import { useState } from 'react'
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

const PLATFORM_STYLE: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  'Netflix': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: '🔴' },
  'HBO Max': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: '🟣' },
  'Disney+': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: '🔵' },
  'Apple TV+': { bg: 'bg-slate-400/10', text: 'text-slate-300', border: 'border-slate-400/20', icon: '⚪' },
  'Amazon Prime': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', icon: '🟢' },
}

export default function StreamingWidget() {
  const { lang } = useLang()
  const [platform, setPlatform] = useState<string>('all')
  const { data, loading, error, refetch } = useWidget<StreamData>('/api/streaming', 60 * 60 * 1000)

  const allItems = data?.items ?? []
  const platforms = Array.from(new Set(allItems.map(i => i.platform)))
  const items = platform === 'all' ? allItems : allItems.filter(i => i.platform === platform)

  return (
    <WidgetCard accent="purple" title={lang === 'sk' ? 'Streaming trendy' : 'Streaming Trending'} icon="🎬" onRefresh={refetch}>
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && allItems.length > 0 && (
        <>
          {/* Platform tabs */}
          <div className="flex flex-wrap gap-1 mb-3">
            <button onClick={() => setPlatform('all')}
              className={`text-[9px] px-2 py-1 rounded-lg font-semibold transition-all border ${
                platform === 'all' ? 'bg-purple-500/15 text-purple-300 border-purple-500/20' : 'text-slate-500 hover:text-slate-300 border-transparent hover:bg-white/5'
              }`}>
              🎬 Všetky ({allItems.length})
            </button>
            {platforms.map(p => {
              const ps = PLATFORM_STYLE[p]
              const count = allItems.filter(i => i.platform === p).length
              return (
                <button key={p} onClick={() => setPlatform(p)}
                  className={`text-[9px] px-2 py-1 rounded-lg font-semibold transition-all border ${
                    platform === p ? `${ps?.bg ?? 'bg-white/10'} ${ps?.text ?? 'text-white'} ${ps?.border ?? 'border-white/20'}` : 'text-slate-500 hover:text-slate-300 border-transparent hover:bg-white/5'
                  }`}>
                  {ps?.icon ?? '🎯'} {p} ({count})
                </button>
              )
            })}
          </div>

          {/* Items grid */}
          <div className="space-y-1 max-h-[350px] overflow-y-auto scrollbar-hide">
            {items.map((item, i) => {
              const ps = PLATFORM_STYLE[item.platform] ?? { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', icon: '🎯' }
              return (
                <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all hover:scale-[1.01] ${ps.border} ${ps.bg}`}>
                  <span className="text-[12px] font-bold text-slate-500/60 w-5 text-right tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-200 truncate">{item.title}</span>
                      <span className="text-[8px] px-1 py-0.5 rounded bg-white/5 text-slate-500 shrink-0">
                        {item.type === 'series' ? '📺' : '🎬'} {item.type === 'series' ? 'Seriál' : 'Film'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${ps.bg} ${ps.text}`}>{item.platform}</span>
                      <span className="text-[8px] text-slate-500">{item.genre}</span>
                      {item.year && <span className="text-[8px] text-slate-600">{item.year}</span>}
                    </div>
                  </div>
                  {item.rating && (
                    <div className="text-center shrink-0">
                      <span className="text-[12px] font-bold text-yellow-400">⭐ {item.rating}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </WidgetCard>
  )
}
