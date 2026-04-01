'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useState } from 'react'

interface CityData {
  city: string
  totalCapacity: number
  freeSpots: number
  waitlistCount: number
  institutions: number
  avgWaitMonths: number
}

interface AgeGroup {
  label: string
  admittedPct: number
}

interface KindergartenData {
  cities: CityData[]
  national: { totalCapacity: number; totalFreeSpots: number; totalOnWaitlist: number; occupancyPct: number; coverageOfEligibleChildren: number; euTarget2030: number; yearOnYearNewPlaces: number }
  ageGroups: AgeGroup[]
  updatedAt: string
}

export default function KindergartensWidget() {
  const { data, loading, refetch } = useWidget<KindergartenData>('/api/kindergartens', 3600 * 1000)
  const [view, setView] = useState<'cities' | 'ages'>('cities')

  return (
    <WidgetCard accent="purple" title="Dostupnosť škôlok" icon="👶" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{data.national.occupancyPct}%</div>
              <div className="text-[9px] text-slate-500">obsadenosť</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-orange-400">{data.national.totalOnWaitlist.toLocaleString('sk-SK')}</div>
              <div className="text-[9px] text-slate-500">na čakačke</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-400">{data.national.totalFreeSpots}</div>
              <div className="text-[9px] text-slate-500">voľných miest</div>
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Pokrytie oprávnených detí</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-600/40 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${data.national.coverageOfEligibleChildren}%` }} />
              </div>
              <span className="text-[11px] font-bold text-white">{data.national.coverageOfEligibleChildren}%</span>
              <span className="text-[9px] text-slate-600">(EÚ cieľ: {data.national.euTarget2030}%)</span>
            </div>
          </div>

          <div className="flex gap-1">
            {(['cities', 'ages'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-2.5 py-0.5 rounded text-[10px] border transition-colors ${view === v ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'border-slate-600 text-slate-500 hover:text-slate-300'}`}>
                {v === 'cities' ? '🏙️ Mestá' : '🎂 Vek'}
              </button>
            ))}
          </div>

          {view === 'cities' ? (
            <div className="space-y-1.5">
              {data.cities.map(c => (
                <div key={c.city} className="flex items-center gap-2 bg-slate-700/30 rounded-lg px-2.5 py-2">
                  <span className="text-[11px] text-slate-300 w-28 shrink-0">{c.city}</span>
                  <div className="flex-1 h-1.5 bg-slate-600/40 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500/70 rounded-full"
                      style={{ width: `${Math.round((1 - c.freeSpots / c.totalCapacity) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-orange-400 w-14 text-right shrink-0">čaká: {c.waitlistCount}</span>
                  <span className="text-[9px] text-slate-600 w-10 text-right shrink-0">~{c.avgWaitMonths}m</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data.ageGroups.map(ag => (
                <div key={ag.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-16 shrink-0">{ag.label}</span>
                  <div className="flex-1 h-4 bg-slate-700/40 rounded overflow-hidden">
                    <div className={`h-full rounded text-[9px] text-right pr-1 leading-4 ${ag.admittedPct > 80 ? 'bg-green-500/60' : ag.admittedPct > 50 ? 'bg-yellow-500/60' : 'bg-red-500/60'}`}
                      style={{ width: `${ag.admittedPct}%` }}>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-white w-10 text-right shrink-0">{ag.admittedPct}%</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-[9px] text-slate-600 text-right">MŠVVaM SR · mestá a obce</div>
        </div>
      )}
    </WidgetCard>
  )
}
