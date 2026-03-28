'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface FlashItem {
  title: string
  source: string
  link: string
  timestamp: number
  ago: string
}

interface FlashData {
  items: FlashItem[]
  summary?: string
  timestamp: number
}

const SOURCE_COLORS: Record<string, string> = {
  'SME.sk': '#ef4444',
  'Denník N': '#6366f1',
  'BBC World': '#f59e0b',
  'NYTimes': '#e5e7eb',
  'Aktuality': '#3b82f6',
}

export default function FlashNewsWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<FlashData>('/api/flashnews', 2 * 60 * 1000)

  return (
    <div className="widget-card !py-3 !px-4 border-red-500/20 relative overflow-hidden card-entrance">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
              Flash News
            </span>
          </div>
          <button onClick={refetch} className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all" title={lang === 'sk' ? 'Obnoviť' : 'Refresh'}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* AI Summary */}
        {!loading && data?.summary && (
          <div className="mb-2 px-2 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10">
            <p className="text-[10px] text-slate-300 leading-relaxed line-clamp-2">
              {data.summary}
            </p>
          </div>
        )}

        {/* News items */}
        {loading && <SkeletonRows rows={3} />}
        {!loading && error && <p className="text-[10px] text-slate-500">Chyba načítania</p>}
        {!loading && data && data.items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0.5">
            {data.items.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.04] transition-all group"
              >
                <span className="text-[9px] font-mono text-slate-600 shrink-0 tabular-nums w-[65px]">{item.ago}</span>
                <span className="text-[11px] text-slate-200 group-hover:text-white leading-snug line-clamp-1 flex-1 font-medium">{item.title}</span>
                <span
                  className="text-[8px] font-bold shrink-0 px-1.5 py-0.5 rounded-md border"
                  style={{ color: SOURCE_COLORS[item.source] ?? '#94a3b8', borderColor: `${SOURCE_COLORS[item.source] ?? '#94a3b8'}30`, backgroundColor: `${SOURCE_COLORS[item.source] ?? '#94a3b8'}10` }}
                >
                  {item.source}
                </span>
              </a>
            ))}
          </div>
        )}
        {!loading && data && data.items.length === 0 && (
          <p className="text-[10px] text-slate-500 text-center py-2">{lang === 'sk' ? 'Žiadne čerstvé správy' : 'No fresh news'}</p>
        )}
      </div>
    </div>
  )
}
