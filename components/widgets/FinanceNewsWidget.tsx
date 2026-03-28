'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

interface FinanceItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
  region: 'EU' | 'US'
}

interface FinanceData {
  eu: FinanceItem[]
  us: FinanceItem[]
}

function timeAgo(pubDate: string): string {
  if (!pubDate) return ''
  try {
    const diff = Math.floor((Date.now() - new Date(pubDate).getTime()) / 60000)
    if (diff < 1) return 'práve'
    if (diff < 60) return `${diff}m`
    if (diff < 1440) return `${Math.floor(diff / 60)}h`
    return `${Math.floor(diff / 1440)}d`
  } catch { return '' }
}

type Tab = 'eu' | 'us'

export default function FinanceNewsWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('eu')
  const { data, loading, refetch } = useWidget<FinanceData>('/api/bloomberg', 5 * 60 * 1000)

  const items = tab === 'eu' ? (data?.eu ?? []) : (data?.us ?? [])

  return (
    <WidgetCard
      accent="green"
      title={lang === 'sk' ? 'Finančné správy' : 'Finance News'}
      icon="📈"
      badge={items.length || undefined}
      onRefresh={refetch}
    >
      {/* EU / US tabs */}
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        <button
          onClick={() => setTab('eu')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
            tab === 'eu' ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          🇪🇺 {lang === 'sk' ? 'Európa' : 'Europe'}
        </button>
        <button
          onClick={() => setTab('us')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
            tab === 'us' ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          🇺🇸 {lang === 'sk' ? 'USA' : 'USA'}
        </button>
      </div>

      {loading ? (
        <SkeletonRows rows={5} />
      ) : items.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-6">
          {lang === 'sk' ? 'Žiadne správy' : 'No articles'}
        </p>
      ) : (
        <div className="space-y-0.5 max-h-[380px] overflow-y-auto scrollbar-hide">
          {items.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group rounded-xl p-2.5 widget-item-hover transition-all"
            >
              <div className="flex items-start gap-2">
                <span className="text-sm mt-0.5">📊</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-emerald-600 font-semibold">{item.source}</span>
                    {item.pubDate && (
                      <span className="text-[9px] text-slate-600">{timeAgo(item.pubDate)}</span>
                    )}
                  </div>
                </div>
                <span className="text-slate-700 group-hover:text-slate-500 transition-colors shrink-0 mt-0.5">↗</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
