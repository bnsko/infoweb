'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'

interface Contract {
  id: string
  subject: string
  contracting: string
  supplier: string
  value: number
  currency: string
  unit: string
  datePublished: string
  procedure: string
  url: string
}

interface ProcurementData {
  recentContracts: Contract[]
  stats: { totalThisYear: number; totalValueThisYear: number; newThisMonth: number; avgContractValue: number; byProcedure: Record<string, number>; topSectors: string[] }
  updatedAt: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'dnes'
  if (d === 1) return 'včera'
  return `pred ${d}d`
}

const PROCEDURE_COLOR: Record<string, string> = {
  'Verejná súťaž': 'bg-blue-500/20 text-blue-400',
  'Podlimitná zákazka': 'bg-cyan-500/20 text-cyan-400',
  'Priame rokovanie': 'bg-orange-500/20 text-orange-400',
  'Rámcová dohoda': 'bg-purple-500/20 text-purple-400',
}

export default function PublicProcurementWidget() {
  const { data, loading, refetch } = useWidget<ProcurementData>('/api/public-procurement', 3600 * 1000)

  return (
    <WidgetCard accent="blue" title="Verejné obstarávanie" icon="📋" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-blue-400">{(data.stats.totalValueThisYear / 1000).toFixed(1)} mld.</div>
              <div className="text-[9px] text-slate-500">hodnota zákaziek</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{data.stats.totalThisYear.toLocaleString('sk-SK')}</div>
              <div className="text-[9px] text-slate-500">zákaziek YTD</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-cyan-400">{data.stats.newThisMonth}</div>
              <div className="text-[9px] text-slate-500">tento mesiac</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Najnovšie zákazky</div>
            {data.recentContracts.map(c => (
              <div key={c.id} className="bg-slate-700/30 rounded-lg p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-slate-200 font-medium leading-tight">{c.subject}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{c.contracting}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[12px] font-bold text-white">{c.value} {c.unit}</div>
                    <div className="text-[9px] text-slate-500">{timeAgo(c.datePublished)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] ${PROCEDURE_COLOR[c.procedure] ?? 'bg-slate-500/20 text-slate-400'}`}>
                    {c.procedure}
                  </span>
                  <span className="text-[9px] text-slate-600">{c.supplier}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[9px] text-slate-600 text-right">
            <a href="https://www.uvo.gov.sk" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">uvo.gov.sk</a>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
