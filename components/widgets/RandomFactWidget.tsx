'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Fact {
  text: string
  source: string
  category: string
  emoji: string
}

interface FactData {
  today: Fact
  yesterday: Fact
  timestamp: number
}

export default function RandomFactWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<FactData>('/api/randomfact', 60 * 60 * 1000)

  return (
    <WidgetCard accent="yellow" title={lang === 'sk' ? 'Zaujímavosť dňa' : 'Fact of the Day'} icon="💡" onRefresh={refetch}>
      {loading && <SkeletonRows rows={3} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && data && (
        <div className="space-y-3">
          <div className="px-3 py-3 rounded-xl bg-yellow-500/[0.07] border border-yellow-500/15">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-base">{data.today.emoji}</span>
              <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-wider">Dnes</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-500">{data.today.category}</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-relaxed">{data.today.text}</p>
            <p className="text-[8px] text-slate-500 mt-1.5">Zdroj: {data.today.source}</p>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{data.yesterday.emoji}</span>
              <span className="text-[9px] text-slate-500 font-semibold">Včerajšia zaujímavosť</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">{data.yesterday.text}</p>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
