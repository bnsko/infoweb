'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface TrendData {
  trends: { term: string; traffic: string; link: string }[]
  timestamp: number
}

export default function TrendingSearchesWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<TrendData>('/api/trending', 60 * 60 * 1000)

  const trends = data?.trends ?? []

  return (
    <WidgetCard accent="blue" title={lang === 'sk' ? 'Hľadané výrazy' : 'Trending Searches'} icon="🔍" onRefresh={refetch}>
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && trends.length > 0 && (
        <div className="space-y-0.5">
          {trends.map((t, i) => (
            <a key={i} href={t.link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
              <span className={`text-[10px] font-bold w-5 text-center ${i < 3 ? 'text-blue-400' : 'text-slate-500'}`}>{i + 1}</span>
              <span className="text-[10px] text-slate-300 group-hover:text-white flex-1 truncate">{t.term}</span>
              <span className="text-[8px] text-slate-600 tabular-nums">{t.traffic}</span>
            </a>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
