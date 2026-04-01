'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useState } from 'react'

interface WaitItem {
  operation: string
  specialization: string
  waitWeeks: number
  patientsWaiting: number
  trend: 'up' | 'down' | 'stable'
  priority: 'urgent' | 'standard' | 'elective'
}

interface SurgeryWaitlistData {
  operations: WaitItem[]
  nationalAvgWeeks: number
  euAvgWeeks: number
  updatedAt: string
}

const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', stable: '→' }
const TREND_COLOR: Record<string, string> = { up: 'text-red-400', down: 'text-green-400', stable: 'text-slate-400' }
const PRIORITY_COLOR: Record<string, string> = { urgent: 'text-red-400', standard: 'text-yellow-400', elective: 'text-slate-400' }
const PRIORITY_LABEL: Record<string, string> = { urgent: 'Urgentné', standard: 'Štandardné', elective: 'Plánované' }

function WaitBar({ weeks, max }: { weeks: number; max: number }) {
  const pct = Math.min(100, (weeks / max) * 100)
  const color = weeks > 52 ? 'bg-red-500' : weeks > 26 ? 'bg-orange-500' : weeks > 12 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-slate-600/40 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-bold text-white w-14 text-right">{weeks} týž.</span>
    </div>
  )
}

export default function SurgeryWaitlistWidget() {
  const { data, loading, refetch } = useWidget<SurgeryWaitlistData>('/api/surgery-waitlist', 3600 * 1000)
  const [filter, setFilter] = useState<'all' | 'urgent' | 'standard' | 'elective'>('all')

  const maxWeeks = data ? Math.max(...data.operations.map(o => o.waitWeeks)) : 100

  return (
    <WidgetCard accent="purple" title="Čakacie doby na výkony" icon="🏥" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg px-3 py-2">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{data.nationalAvgWeeks}</div>
              <div className="text-[9px] text-slate-500">SR priemer (týž.)</div>
            </div>
            <div className="w-px h-8 bg-slate-600" />
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{data.euAvgWeeks}</div>
              <div className="text-[9px] text-slate-500">EÚ priemer (týž.)</div>
            </div>
          </div>

          <div className="flex gap-1 flex-wrap">
            {(['all', 'urgent', 'standard', 'elective'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${filter === f ? 'bg-purple-500/30 border-purple-500/50 text-purple-300' : 'border-slate-600 text-slate-500 hover:text-slate-300'}`}>
                {f === 'all' ? 'Všetky' : PRIORITY_LABEL[f]}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {data.operations
              .filter(o => filter === 'all' || o.priority === filter)
              .sort((a, b) => b.waitWeeks - a.waitWeeks)
              .map(op => (
                <div key={op.operation} className="bg-slate-700/30 rounded-lg p-2.5">
                  <div className="flex justify-between mb-1">
                    <div>
                      <span className="text-[11px] text-slate-200 font-medium">{op.operation}</span>
                      <span className="ml-1.5 text-[10px] text-slate-500">{op.specialization}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] ${PRIORITY_COLOR[op.priority]}`}>{PRIORITY_LABEL[op.priority]}</span>
                      <span className={`text-[10px] font-bold ${TREND_COLOR[op.trend]}`}>{TREND_ICON[op.trend]}</span>
                    </div>
                  </div>
                  <WaitBar weeks={op.waitWeeks} max={maxWeeks} />
                  <div className="text-[9px] text-slate-600 mt-1">{op.patientsWaiting} pacientov čaká</div>
                </div>
              ))}
          </div>

          <div className="text-[9px] text-slate-600 text-right">NCZI SR · OECD Health Statistics</div>
        </div>
      )}
    </WidgetCard>
  )
}
