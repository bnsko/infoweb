'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface DangerousProduct {
  id: string; name: string; brand: string; type: string
  danger: string; severity: 'vážne' | 'stredné' | 'mierne'
  recallDate: string; daysAgo: number; countryOfOrigin: string; url: string
}
interface InspectionStats {
  checksThisYear: number; failedChecks: number; failureRate: number
  finesIssuedEur: number; recallsThisYear: number; mostProblematicType: string
}
interface MonthlyRecall { month: string; count: number }
interface ConsumerData {
  dangerousProducts: DangerousProduct[]; inspectionStats: InspectionStats
  monthlyRecalls: MonthlyRecall[]; sourceUrl: string; updatedAt: string
}

const SEVERITY_COLOR = { 'vážne': 'text-rose-400 bg-rose-500/15', 'stredné': 'text-amber-400 bg-amber-500/15', 'mierne': 'text-yellow-400 bg-yellow-500/10' }

export default function ConsumerSafetyWidget() {
  const { data, loading, refetch } = useWidget<ConsumerData>('/api/consumer-safety', 60 * 60 * 1000)

  const maxRecalls = Math.max(...(data?.monthlyRecalls ?? [{ count: 1 }]).map(m => m.count), 1)

  return (
    <WidgetCard accent="yellow" title="SOI — Bezpečnosť výrobkov" icon="⚠️" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={7} /> : (
        <div className="space-y-3">
          {data?.inspectionStats && (
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase">Inšpekcií</span>
                <span className="text-[12px] font-bold text-white">{(data.inspectionStats.checksThisYear / 1000).toFixed(1)}k</span>
              </div>
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase">Stiahnuté</span>
                <span className="text-[12px] font-bold text-rose-400">{data.inspectionStats.recallsThisYear}</span>
              </div>
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase">Zlyhanie</span>
                <span className="text-[12px] font-bold text-amber-400">{data.inspectionStats.failureRate}%</span>
              </div>
            </div>
          )}

          <div>
            <span className="text-[8px] text-slate-500 uppercase tracking-wider">Nedávne stiahnuté produkty</span>
            <div className="space-y-1.5 mt-1.5 max-h-[220px] overflow-y-auto">
              {(data?.dangerousProducts ?? []).map(p => (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-2 px-2.5 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 transition-colors block">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-medium text-white truncate">{p.name}</span>
                      <span className={`text-[7px] px-1 rounded shrink-0 ${SEVERITY_COLOR[p.severity]}`}>{p.severity}</span>
                    </div>
                    <div className="text-[8px] text-slate-400 truncate">{p.brand} · {p.danger}</div>
                    <div className="text-[7px] text-slate-500">{p.type} · {p.countryOfOrigin} · {p.daysAgo === 0 ? 'dnes' : `pred ${p.daysAgo}d`}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[8px] text-slate-500 uppercase tracking-wider">Stiahnutia za posledných 6 mes.</span>
            <div className="flex items-end gap-1 mt-1.5 h-10">
              {(data?.monthlyRecalls ?? []).map(m => {
                const pct = (m.count / maxRecalls) * 100
                const label = m.month.split('-')[1]
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5" title={`${m.month}: ${m.count}`}>
                    <div className="w-full bg-yellow-500/50 rounded-t-sm" style={{ height: `${Math.max(4, pct)}%` }} />
                    <span className="text-[6px] text-slate-600">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <a href={data?.sourceUrl ?? 'https://www.soi.sk'} target="_blank" rel="noopener noreferrer"
            className="block text-center text-[8px] text-slate-500 hover:text-yellow-400 transition-colors py-1 rounded-lg bg-slate-800/30">
            soi.sk — nebezpečné výrobky &rarr;
          </a>
        </div>
      )}
    </WidgetCard>
  )
}
