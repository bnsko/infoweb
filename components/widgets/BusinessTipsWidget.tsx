'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Tip { icon: string; title: string; tip: string; category: string }
interface MoneyIdea { icon: string; idea: string; potential: string; difficulty: string; description: string }
interface BizTipsData { todayTip: Tip; todayIdea: MoneyIdea; allTips: Tip[]; allIdeas: MoneyIdea[]; timestamp: number }

export default function BusinessTipsWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<BizTipsData>('/api/businesstips', 60 * 60 * 1000)

  return (
    <WidgetCard accent="orange" title={lang === 'sk' ? 'Podnikateľský tip dňa' : 'Business Tip'} icon="💡" onRefresh={refetch}
      badge={data?.todayTip?.category}>
      {loading && <SkeletonRows rows={3} />}
      {!loading && data && (
        <div className="space-y-3">
          <div className="rounded-xl p-3 bg-amber-500/[0.06] border border-amber-500/15">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{data.todayTip.icon}</span>
              <span className="text-[11px] font-bold text-amber-300">{data.todayTip.title}</span>
              <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold ml-auto">{data.todayTip.category}</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">{data.todayTip.tip}</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm">💰</span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Nápad na zarábanie</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="rounded-xl p-2.5 bg-emerald-500/[0.05] border border-emerald-500/15">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{data.todayIdea.icon}</span>
                <span className="text-[10px] font-bold text-emerald-300">{data.todayIdea.idea}</span>
              </div>
              <p className="text-[9px] text-slate-400 mb-1.5">{data.todayIdea.description}</p>
              <div className="flex gap-2 text-[8px]">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">💶 {data.todayIdea.potential}</span>
                <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-400">Náročnosť: {data.todayIdea.difficulty}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[8px] text-slate-600 uppercase tracking-wider font-semibold mb-1">Ďalšie tipy</div>
            <div className="space-y-0.5">
              {data.allTips.slice(1, 4).map((t, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <span>{t.icon}</span>
                  <span className="text-[9px] text-slate-300 font-medium flex-1 line-clamp-1">{t.title}</span>
                  <span className="text-[7px] text-slate-500">{t.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
