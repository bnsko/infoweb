'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface RegionData {
  id: string; name: string; population: number; totalCrimes: number; clearedCrimes: number
  clearanceRate: number; crimeRate: number; trend: string; trendPct: number; topCrime: string
}
interface CrimeType { type: string; count: number; change: number }
interface NationalStats { totalCrimes: number; clearanceRate: number; year: number; quarter: number }
interface CrimeData { regions: RegionData[]; nationalStats: NationalStats; crimeTypeBreakdown: CrimeType[]; sourceUrl: string; updatedAt: string }

const HEAT_COLORS = (rate: number) => {
  if (rate > 6) return 'bg-rose-500/80'
  if (rate > 4.5) return 'bg-rose-500/50'
  if (rate > 3) return 'bg-orange-500/50'
  if (rate > 2) return 'bg-yellow-500/50'
  return 'bg-green-500/50'
}

export default function CrimeRegionsWidget() {
  const { data, loading, refetch } = useWidget<CrimeData>('/api/crime-regions', 60 * 60 * 1000)

  return (
    <WidgetCard accent="rose" title="Kriminalita podľa regiónov" icon="📊" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={8} /> : (
        <div className="space-y-3">
          {data?.nationalStats && (
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase">Celkovo {data.nationalStats.year}</span>
                <span className="text-[13px] font-bold text-white">{data.nationalStats.totalCrimes.toLocaleString('sk-SK')}</span>
              </div>
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase">Vyriešené</span>
                <span className="text-[13px] font-bold text-green-400">{data.nationalStats.clearanceRate}%</span>
              </div>
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase">Q{data.nationalStats.quarter}</span>
                <span className="text-[13px] font-bold text-blue-400">{data.nationalStats.year}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 px-1 mb-1">
              <span className="text-[8px] text-slate-500 flex-1">Kraj</span>
              <span className="text-[8px] text-slate-500 text-right w-12">TČ na 1000</span>
              <span className="text-[8px] text-slate-500 text-right w-12">Trend</span>
              <span className="text-[8px] text-slate-500 text-right w-10">Objasn.</span>
            </div>
            {(data?.regions ?? []).map(r => (
              <div key={r.id} className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border border-transparent hover:border-slate-700 transition-colors`}>
                <div className={`w-2.5 h-2.5 rounded shrink-0 ${HEAT_COLORS(r.crimeRate)}`} />
                <span className="text-[10px] font-medium text-white flex-1 truncate">{r.name.replace('ský', '')}</span>
                <span className="text-[10px] font-bold text-white w-12 text-right">{r.crimeRate}</span>
                <span className={`text-[9px] w-12 text-right ${r.trend === 'up' ? 'text-rose-400' : r.trend === 'down' ? 'text-green-400' : 'text-slate-400'}`}>
                  {r.trend === 'up' ? '↑' : r.trend === 'down' ? '↓' : '→'}{Math.abs(r.trendPct)}%
                </span>
                <span className="text-[9px] text-green-400 w-10 text-right">{r.clearanceRate}%</span>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <span className="text-[8px] text-slate-500 uppercase tracking-wider px-1">Typy trestných činov</span>
            {(data?.crimeTypeBreakdown ?? []).slice(0, 3).map(c => (
              <div key={c.type} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-800/30">
                <span className="text-[9px] text-slate-300 flex-1 truncate">{c.type}</span>
                <span className="text-[9px] font-semibold text-white">{c.count.toLocaleString('sk-SK')}</span>
                <span className={`text-[8px] ${c.change > 0 ? 'text-rose-400' : 'text-green-400'}`}>
                  {c.change > 0 ? '+' : ''}{c.change}%
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            {[['text-green-500/80', '< 2'], ['text-yellow-500/80', '2–3'], ['text-orange-500/80', '3–4.5'], ['text-rose-400', '> 4.5']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded ${c.replace('text-', 'bg-')}`} />
                <span className="text-[7px] text-slate-500">{l}</span>
              </div>
            ))}
            <span className="text-[7px] text-slate-600 ml-auto">TČ/1000 obyv.</span>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
