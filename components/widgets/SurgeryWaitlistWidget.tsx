'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useState } from 'react'

interface WaitItem {
  name: string
  category: string
  waitWeeks: number
  patientsWaiting: number
  trend: 'up' | 'down' | 'stable'
}

interface SurgeryWaitlistData {
  operations: WaitItem[]
  avgWaitWeeks: number
  totalWaiting: number
  updatedAt: string
}

const TREND_ICON: Record<string, string> = { up: '↑', down: '↓', stable: '→' }
const TREND_COLOR: Record<string, string> = { up: 'text-red-400', down: 'text-green-400', stable: 'text-slate-400' }

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
  const [filter, setFilter] = useState<'all' | 'ort' | 'card' | 'eye'>('all')
  const CATEGORY_FILTER: Record<string, string> = { ort: 'Ortopédia', card: 'Kardiológia', eye: 'Oftalmológia' }

  const maxWeeks = data ? Math.max(...data.operations.map(o => o.waitWeeks)) : 100

  return (
    <WidgetCard accent="purple" title="Čakacie doby na výkony" icon="🏥" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg px-3 py-2">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{data.avgWaitWeeks}</div>
              <div className="text-[9px] text-slate-500">SR priemer (týž.)</div>
            </div>
            <div className="w-px h-8 bg-slate-600" />
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">{data.totalWaiting.toLocaleString('sk-SK')}</div>
              <div className="text-[9px] text-slate-500">čaká celkovo</div>
            </div>
          </div>

          <div className="flex gap-1 flex-wrap">
            {(['all', 'ort', 'card', 'eye'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${filter === f ? 'bg-purple-500/30 border-purple-500/50 text-purple-300' : 'border-slate-600 text-slate-500 hover:text-slate-300'}`}>
                {f === 'all' ? 'Všetky' : CATEGORY_FILTER[f]}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {data.operations
              .filter(o => filter === 'all' || o.category === CATEGORY_FILTER[filter])
              .sort((a, b) => b.waitWeeks - a.waitWeeks)
              .map(op => (
                <div key={op.name} className="bg-slate-700/30 rounded-lg p-2.5">
                  <div className="flex justify-between mb-1">
                    <div>
                      <span className="text-[11px] text-slate-200 font-medium">{op.name}</span>
                      <span className="ml-1.5 text-[10px] text-slate-500">{op.category}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${TREND_COLOR[op.trend]}`}>{TREND_ICON[op.trend]}</span>
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
