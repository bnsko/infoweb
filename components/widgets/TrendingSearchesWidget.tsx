'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface TrendData {
  trends: { term: string; traffic: string; link: string }[]
  global: { term: string; traffic: string; link: string }[]
  timestamp: number
}

function TrendColumn({ title, icon, items, accentColor }: { title: string; icon: string; items: { term: string; traffic: string; link: string }[]; accentColor: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      <div className="space-y-0.5">
        {items.map((t, i) => (
          <a key={i} href={t.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
            <span className={`text-[10px] font-bold w-5 text-center ${i < 3 ? accentColor : 'text-slate-500'}`}>{i + 1}</span>
            <span className="text-[10px] text-slate-300 group-hover:text-white flex-1 truncate">{t.term}</span>
            <span className="text-[8px] text-slate-600 tabular-nums">{t.traffic}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function TrendingSearchesWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<TrendData>('/api/trending', 60 * 60 * 1000)

  const trends = data?.trends ?? []
  const global = data?.global ?? []

  return (
    <WidgetCard accent="blue" title={lang === 'sk' ? 'Hľadané výrazy' : 'Trending Searches'} icon="🔍" onRefresh={refetch}>
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && (trends.length > 0 || global.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trends.length > 0 && <TrendColumn title="🇸🇰 Slovensko" icon="🔍" items={trends} accentColor="text-blue-400" />}
          {global.length > 0 && <TrendColumn title="🌍 Globálne" icon="🌐" items={global} accentColor="text-purple-400" />}
        </div>
      )}
    </WidgetCard>
  )
}
