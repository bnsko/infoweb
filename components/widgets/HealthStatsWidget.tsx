'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useState } from 'react'

interface HealthNational {
  overweightPct: number
  obesePct: number
  avgBmi: number
  diabetesPct: number
  hypertensionPct: number
  yearOnYearObesityChange: number
}

interface GenderStat {
  gender: string
  overweightPct: number
  obesePct: number
  avgBmi: number
}

interface AgeGroupStat {
  ageGroup: string
  overweightPct: number
  obesePct: number
}

interface YearlyPoint {
  year: number
  obesePct: number
  overweightPct: number
}

interface HealthStatsData {
  national: HealthNational
  byGender: GenderStat[]
  byAgeGroup: AgeGroupStat[]
  yearlyTrend: YearlyPoint[]
  euRank: { rank: number; of: number; label: string }
  childObesity: { overweightPct: number; obesePct: number; note: string }
  updatedAt: string
}

function BmiBar({ value, max = 40, label }: { value: number; max?: number; label: string }) {
  const bmiColors = value >= 30 ? 'bg-red-500' : value >= 25 ? 'bg-orange-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-slate-500 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-600/40 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${bmiColors}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-[11px] font-bold text-white w-8 text-right">{value}</span>
    </div>
  )
}

export default function HealthStatsWidget() {
  const { data, loading, refetch } = useWidget<HealthStatsData>('/api/health-stats', 3600 * 1000)
  const [view, setView] = useState<'overview' | 'age' | 'trend'>('overview')

  return (
    <WidgetCard accent="green" title="BMI & Zdravie SR" icon="🏃" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-orange-400">{data.national.overweightPct}%</div>
              <div className="text-[9px] text-slate-500">nadváha</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-red-400">{data.national.obesePct}%</div>
              <div className="text-[9px] text-slate-500">obezita</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{data.national.avgBmi}</div>
              <div className="text-[9px] text-slate-500">priem. BMI</div>
            </div>
          </div>

          <div className="flex gap-1">
            {(['overview', 'age', 'trend'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-2.5 py-0.5 rounded text-[10px] border transition-colors ${view === v ? 'bg-green-500/20 border-green-500/40 text-green-300' : 'border-slate-600 text-slate-500 hover:text-slate-300'}`}>
                {v === 'overview' ? '📊 Prehľad' : v === 'age' ? '👥 Vek' : '📈 Trend'}
              </button>
            ))}
          </div>

          {view === 'overview' && (
            <div className="space-y-2">
              {data.byGender.map(g => (
                <div key={g.gender} className="bg-slate-700/30 rounded-lg p-2.5">
                  <div className="text-[10px] text-slate-400 mb-1.5 font-medium">{g.gender}</div>
                  <BmiBar value={g.avgBmi} label="Priem. BMI" />
                  <div className="mt-1 flex gap-3">
                    <span className="text-[9px] text-orange-400">Nadváha: {g.overweightPct}%</span>
                    <span className="text-[9px] text-red-400">Obezita: {g.obesePct}%</span>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-red-400">{data.national.diabetesPct}%</div>
                  <div className="text-[9px] text-slate-500">diabetes</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-orange-400">{data.national.hypertensionPct}%</div>
                  <div className="text-[9px] text-slate-500">hypertenzia</div>
                </div>
              </div>
            </div>
          )}

          {view === 'age' && (
            <div className="space-y-1.5">
              {data.byAgeGroup.map(ag => (
                <div key={ag.ageGroup} className="flex items-center gap-2 bg-slate-700/30 rounded-lg px-2.5 py-2">
                  <span className="text-[10px] text-slate-400 w-12 shrink-0">{ag.ageGroup}</span>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1">
                      <div className="text-[8px] text-slate-600 mb-0.5">nadváha</div>
                      <div className="h-2 bg-slate-600/40 rounded overflow-hidden">
                        <div className="h-full bg-orange-500/70 rounded" style={{ width: `${ag.overweightPct}%` }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-[8px] text-slate-600 mb-0.5">obezita</div>
                      <div className="h-2 bg-slate-600/40 rounded overflow-hidden">
                        <div className="h-full bg-red-500/70 rounded" style={{ width: `${(ag.obesePct / 40) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] text-orange-400">{ag.overweightPct}%</div>
                    <div className="text-[9px] text-red-400">{ag.obesePct}%</div>
                  </div>
                </div>
              ))}
              <div className="bg-slate-700/30 rounded-lg p-2 text-center mt-1">
                <div className="text-[10px] text-slate-400">Detská obezita <span className="text-slate-500">({data.childObesity.note})</span></div>
                <div className="text-[11px] font-bold text-red-400 mt-0.5">{data.childObesity.obesePct}% obéznych · {data.childObesity.overweightPct}% s nadváhou</div>
              </div>
            </div>
          )}

          {view === 'trend' && (
            <div className="space-y-1.5">
              <div className="flex items-end gap-0.5 h-20 px-1">
                {data.yearlyTrend.map(y => (
                  <div key={y.year} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full flex flex-col justify-end" style={{ height: '64px' }}>
                      <div className="w-full bg-orange-500/60 rounded-t" style={{ height: `${(y.overweightPct / 70) * 64}px` }} />
                    </div>
                    <div className="text-[8px] text-slate-600">{y.year}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-orange-500/60" /><span className="text-[9px] text-slate-500">nadváha</span></div>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] text-slate-500">EÚ rank: <span className="text-white font-bold">{data.euRank.rank}/{data.euRank.of}</span> {data.euRank.label}</span>
                <span className={`text-[10px] ${data.national.yearOnYearObesityChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {data.national.yearOnYearObesityChange > 0 ? '+' : ''}{data.national.yearOnYearObesityChange}% rok/rok
                </span>
              </div>
            </div>
          )}

          <div className="text-[9px] text-slate-600 text-right">NCZI SR · WHO</div>
        </div>
      )}
    </WidgetCard>
  )
}
