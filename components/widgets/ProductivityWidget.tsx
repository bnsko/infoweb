'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Tip { icon: string; title: string; tip: string; category: string }
interface ProductivityData { todayTip: Tip; allTips: Tip[]; timestamp: number }

export default function ProductivityWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<ProductivityData>('/api/productivity', 60 * 60 * 1000)

  return (
    <WidgetCard accent="orange" title={lang === 'sk' ? 'Produktivita dňa' : 'Productivity'} icon="⚡" onRefresh={refetch}
      badge={data?.todayTip?.category}>
      {loading && <SkeletonRows rows={3} />}
      {!loading && data && (
        <div className="space-y-2">
          <div className="rounded-xl p-3 bg-orange-500/[0.06] border border-orange-500/15">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{data.todayTip.icon}</span>
              <span className="text-[11px] font-bold text-orange-300">{data.todayTip.title}</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">{data.todayTip.tip}</p>
          </div>
          <div className="space-y-0.5">
            {data.allTips.slice(1, 4).map((t, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <span>{t.icon}</span>
                <span className="text-[9px] text-slate-300 font-medium flex-1 line-clamp-1">{t.title}</span>
                <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-500">{t.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
