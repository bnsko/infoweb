'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface EUProgram { name: string; icon: string; budget: string; description: string; url: string; status: string }
interface SKGrant { name: string; icon: string; description: string; url: string }
interface EUGrantsData { euPrograms: EUProgram[]; skGrants: SKGrant[]; totalBudgetEU: string; timestamp: number }

export default function EUGrantsWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<EUGrantsData>('/api/eugrants', 60 * 60 * 1000)

  return (
    <WidgetCard accent="blue" title={lang === 'sk' ? 'EÚ Granty & Dotácie' : 'EU Grants'} icon="🇪🇺" onRefresh={refetch}
      badge={data?.totalBudgetEU}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && data && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm">🇪🇺</span>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">EÚ programy</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-hide">
              {data.euPrograms.map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <span className="text-sm">{p.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-slate-200 font-semibold line-clamp-1">{p.name}</div>
                    <div className="text-[7px] text-slate-500 line-clamp-1">{p.description}</div>
                  </div>
                  <span className="text-[8px] text-indigo-400 font-bold shrink-0">{p.budget}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm">🇸🇰</span>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">SK dotácie</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-0.5">
              {data.skGrants.map((g, i) => (
                <a key={i} href={g.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <span className="text-sm">{g.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] text-slate-200 font-semibold">{g.name}</div>
                    <div className="text-[7px] text-slate-500 line-clamp-1">{g.description}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
