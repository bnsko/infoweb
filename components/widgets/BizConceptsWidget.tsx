'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Concept { term: string; emoji: string; definition: string; example: string }
interface ConceptData { todayConcept: Concept; recentConcepts: Concept[]; totalConcepts: number; timestamp: number }

export default function BizConceptsWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<ConceptData>('/api/bizconcepts', 60 * 60 * 1000)

  return (
    <WidgetCard accent="purple" title={lang === 'sk' ? 'Biznis pojem dňa' : 'Biz Concept'} icon="📖" onRefresh={refetch}>
      {loading && <SkeletonRows rows={3} />}
      {!loading && data && (
        <div className="space-y-3">
          <div className="rounded-xl p-3 bg-violet-500/[0.06] border border-violet-500/15">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl">{data.todayConcept.emoji}</span>
              <span className="text-[13px] font-bold text-violet-300">{data.todayConcept.term}</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed mb-2">{data.todayConcept.definition}</p>
            <div className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[9px] text-slate-400">
              💡 <span className="text-slate-300">{data.todayConcept.example}</span>
            </div>
          </div>
          <div>
            <div className="text-[8px] text-slate-600 uppercase tracking-wider font-semibold mb-1">Predchádzajúce</div>
            <div className="space-y-0.5">
              {data.recentConcepts.map((c, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <span>{c.emoji}</span>
                  <span className="text-[10px] text-slate-300 font-semibold">{c.term}</span>
                  <span className="text-[8px] text-slate-500 flex-1 line-clamp-1">{c.definition}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
