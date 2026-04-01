'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'

interface Grant {
  id: string
  title: string
  agency: 'APVV' | 'VEGA' | 'KEGA' | 'Horizon Europe'
  maxAmount: number
  deadline: string
  area: string
  status: 'open' | 'closed' | 'evaluation'
  url: string
  description: string
}

interface APVVData {
  grants: Grant[]
  openCount: number
  source: string
}

const AGENCY_COLOR: Record<string, string> = {
  APVV: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  VEGA: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  KEGA: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Horizon Europe': 'bg-green-500/20 text-green-400 border-green-500/30',
}

const STATUS_LABEL: Record<string, string> = { open: 'Otvorená', closed: 'Uzavretá', evaluation: 'Hodnotenie' }
const STATUS_COLOR: Record<string, string> = { open: 'text-green-400', closed: 'text-slate-500', evaluation: 'text-yellow-400' }

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}

export default function APVVGrantsWidget() {
  const { data, loading, refetch } = useWidget<APVVData>('/api/apvv-grants', 3600 * 1000)

  return (
    <WidgetCard accent="blue" title="Výskumné granty SR" icon="🔬" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-400">{data.openCount}</div>
              <div className="text-[9px] text-slate-500">otvorených</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-blue-400">{data.grants.length}</div>
              <div className="text-[9px] text-slate-500">celkovo</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{data.grants.filter(g => g.agency === 'Horizon Europe').length}</div>
              <div className="text-[9px] text-slate-500">Horizon EU</div>
            </div>
          </div>

          <div className="space-y-1.5">
            {data.grants.map(g => {
              const days = daysUntil(g.deadline)
              return (
                <div key={g.id} className="bg-slate-700/30 rounded-lg p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${AGENCY_COLOR[g.agency]}`}>{g.agency}</span>
                        <span className={`text-[9px] ${STATUS_COLOR[g.status]}`}>{STATUS_LABEL[g.status]}</span>
                      </div>
                      <div className="text-[11px] text-slate-200 font-medium leading-tight">{g.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{g.area}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[12px] font-bold text-white">{(g.maxAmount / 1000).toFixed(0)}k €</div>
                      {g.status === 'open' && days > 0 && (
                        <div className={`text-[10px] ${days < 14 ? 'text-red-400' : days < 30 ? 'text-orange-400' : 'text-slate-500'}`}>
                          {days}d zostáva
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-[9px] text-slate-600 text-right">
            <a href="https://www.apvv.sk" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">apvv.sk</a>
            {' · '}
            <a href="https://erc.europa.eu" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">horizon-europe.ec</a>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
