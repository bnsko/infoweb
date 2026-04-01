'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface StolenVehicle {
  id: string; make: string; model: string; year: number; color: string
  licensePlate: string; region: string; stolenDate: string; daysAgo: number
  recovered: boolean; reward: number | null
}
interface RegionalStat { region: string; stolenThisYear: number; recoveryRate: number }
interface YearlyTrend { year: number; count: number }
interface StolenData {
  recentStolen: StolenVehicle[]; regionalStats: RegionalStat[]
  yearlyTrend: YearlyTrend[]; totalThisYear: number; recoveredThisYear: number
  mostStolenMake: string; sourceUrl: string; updatedAt: string
}

export default function StolenVehiclesWidget() {
  const { data, loading, refetch } = useWidget<StolenData>('/api/stolen-vehicles', 30 * 60 * 1000)
  const [tab, setTab] = useState<'recent' | 'regions'>('recent')

  const recoveryRate = data ? Math.floor((data.recoveredThisYear / data.totalThisYear) * 100) : 0

  return (
    <WidgetCard accent="orange" title="Odcudzené vozidlá" icon="🚗" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={7} /> : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
              <span className="text-[7px] text-slate-500 uppercase">Tento rok</span>
              <span className="text-[14px] font-bold text-rose-400">{data?.totalThisYear}</span>
            </div>
            <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
              <span className="text-[7px] text-slate-500 uppercase">Nájdené</span>
              <span className="text-[14px] font-bold text-green-400">{data?.recoveredThisYear}</span>
            </div>
            <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
              <span className="text-[7px] text-slate-500 uppercase">Úspešnosť</span>
              <span className="text-[14px] font-bold text-orange-400">{recoveryRate}%</span>
            </div>
          </div>

          <div className="flex gap-1">
            {(['recent', 'regions'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 text-[9px] py-1 rounded-lg transition-colors ${tab === t ? 'bg-orange-500/20 text-orange-300' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                {t === 'recent' ? 'Posledné krádeže' : 'Podľa regiónov'}
              </button>
            ))}
          </div>

          {tab === 'recent' && (
            <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
              {(data?.recentStolen ?? []).map(v => (
                <div key={v.id} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl ${v.recovered ? 'bg-green-900/20' : 'bg-slate-800/40'}`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${v.recovered ? 'bg-green-500' : 'bg-rose-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-white">{v.make} {v.model} {v.year}</span>
                      {v.recovered && <span className="text-[7px] bg-green-500/20 text-green-400 px-1 rounded">nájdené</span>}
                    </div>
                    <div className="text-[9px] text-slate-400">{v.color} · {v.licensePlate} · {v.region}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[8px] text-slate-500">{v.daysAgo === 0 ? 'dnes' : `pred ${v.daysAgo}d`}</div>
                    {v.reward && <div className="text-[8px] text-amber-400">{v.reward} €</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'regions' && (
            <div className="space-y-1">
              {(data?.regionalStats ?? []).sort((a, b) => b.stolenThisYear - a.stolenThisYear).map(r => (
                <div key={r.region} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/30">
                  <span className="text-[9px] font-mono text-slate-400 w-6 shrink-0">{r.region}</span>
                  <div className="flex-1">
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500/70 rounded-full" style={{ width: `${Math.min(100, r.stolenThisYear / 2)}%` }} />
                    </div>
                  </div>
                  <span className="text-[9px] text-white font-semibold w-8 text-right shrink-0">{r.stolenThisYear}</span>
                  <span className="text-[8px] text-green-400 w-8 text-right shrink-0">{r.recoveryRate}%</span>
                </div>
              ))}
            </div>
          )}

          <a href={data?.sourceUrl ?? 'https://www.minv.sk'} target="_blank" rel="noopener noreferrer"
            className="block text-center text-[8px] text-slate-500 hover:text-orange-400 transition-colors py-1 rounded-lg bg-slate-800/30">
            minv.sk — odcudzené vozidlá &rarr;
          </a>
        </div>
      )}
    </WidgetCard>
  )
}
