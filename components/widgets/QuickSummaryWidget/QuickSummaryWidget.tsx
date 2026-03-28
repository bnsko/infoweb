'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'

interface SummaryItem {
  category: string
  icon: string
  text: string
  detail?: string
  link?: string
}

interface SummaryData {
  items: SummaryItem[]
  timestamp: number
}

export default function QuickSummaryWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<SummaryData>('/api/quicksummary', 3 * 60 * 1000)

  return (
    <div className="widget-card !py-3 !px-4 border-cyan-500/15 relative overflow-hidden card-entrance">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 via-indigo-600/3 to-transparent pointer-events-none" />
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              {lang === 'sk' ? 'Rýchly prehľad' : 'Quick Overview'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            {data?.timestamp && (
              <span className="text-[9px] text-slate-600">
                {new Date(data.timestamp).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Items */}
        {loading && (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton h-10 rounded-xl flex-1 min-w-[200px]" />
            ))}
          </div>
        )}
        {!loading && data && data.items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.items.map((item, i) => {
              const Content = (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-xl px-3 py-2 border transition-all min-w-[200px] flex-1 ${
                    categoryStyle(item.category)
                  } ${item.link ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
                >
                  <span className="text-base shrink-0 leading-none mt-0.5">{item.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-200 leading-snug line-clamp-2 font-medium">{item.text}</div>
                    {item.detail && (
                      <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">{item.detail}</div>
                    )}
                  </div>
                </div>
              )
              if (item.link) {
                return (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[200px]">
                    {Content}
                  </a>
                )
              }
              return Content
            })}
          </div>
        )}
        {!loading && (!data || data.items.length === 0) && (
          <p className="text-[10px] text-slate-500 text-center py-2">
            {lang === 'sk' ? 'Načítanie prehľadu...' : 'Loading overview...'}
          </p>
        )}
      </div>
    </div>
  )
}

function categoryStyle(cat: string): string {
  switch (cat) {
    case 'weather': return 'bg-blue-500/8 border-blue-500/15'
    case 'reddit':  return 'bg-orange-500/8 border-orange-500/15'
    case 'crypto':  return 'bg-amber-500/8 border-amber-500/15'
    case 'world':   return 'bg-emerald-500/8 border-emerald-500/15'
    case 'sports':  return 'bg-purple-500/8 border-purple-500/15'
    default:        return 'bg-white/[0.03] border-white/8'
  }
}
