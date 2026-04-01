'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Section {
  id: string; name: string; intensity: number; truckPct: number
  avgSpeed: number; congestion: 'free' | 'moderate' | 'heavy'; incidents: number
}
interface HourlyPoint { hour: number; avg: number }
interface TransportData {
  sections: Section[]; topSections: Section[]; totalVehiclesInNetwork: number
  hourlyProfile: HourlyPoint[]; isRushHour: boolean; isWeekend: boolean
  sourceUrl: string; updatedAt: string
}

const CONGESTION_COLOR: Record<string, string> = {
  free: 'text-green-400',
  moderate: 'text-amber-400',
  heavy: 'text-rose-400',
}
const CONGESTION_BG: Record<string, string> = {
  free: 'bg-green-500/15',
  moderate: 'bg-amber-500/15',
  heavy: 'bg-rose-500/15',
}
const CONGESTION_LABEL: Record<string, string> = {
  free: 'voľno',
  moderate: 'stredné',
  heavy: 'husté',
}

export default function TransportIntensityWidget() {
  const { data, loading, refetch } = useWidget<TransportData>('/api/transport-intensity', 30 * 60 * 1000)

  const maxIntensity = Math.max(...(data?.hourlyProfile ?? [{ avg: 1 }]).map(h => h.avg), 1)

  return (
    <WidgetCard accent="green" title="Intenzita dopravy SR" icon="🛣️" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={7} /> : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col bg-slate-800/50 rounded-xl p-2.5">
              <span className="text-[7px] text-slate-500 uppercase tracking-wider">Vozidiel v sieti</span>
              <span className="text-[15px] font-bold text-white">{data?.totalVehiclesInNetwork.toLocaleString('sk-SK')}</span>
              <div className="flex gap-1.5 mt-0.5">
                {data?.isRushHour && <span className="text-[7px] bg-amber-500/20 text-amber-400 px-1 rounded">špička</span>}
                {data?.isWeekend && <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1 rounded">víkend</span>}
              </div>
            </div>
            <div className="flex flex-col bg-slate-800/50 rounded-xl p-2.5">
              <span className="text-[7px] text-slate-500 uppercase tracking-wider">Najzaťaženejší</span>
              {data?.topSections[0] && (
                <>
                  <span className="text-[9px] font-semibold text-white leading-tight mt-0.5">{data.topSections[0].name}</span>
                  <span className={`text-[11px] font-bold mt-0.5 ${CONGESTION_COLOR[data.topSections[0].congestion]}`}>
                    {data.topSections[0].intensity.toLocaleString('sk-SK')} voz/h
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {(data?.sections ?? []).slice(0, 6).map(s => (
              <div key={s.id} className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ${CONGESTION_BG[s.congestion]}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium text-white truncate">{s.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] text-slate-400">{s.avgSpeed} km/h</span>
                    <span className="text-[8px] text-slate-500">🚛 {s.truckPct}%</span>
                    {s.incidents > 0 && <span className="text-[8px] text-rose-400">⚠️ {s.incidents}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-[10px] font-bold ${CONGESTION_COLOR[s.congestion]}`}>
                    {(s.intensity / 1000).toFixed(1)}k
                  </div>
                  <div className={`text-[7px] ${CONGESTION_COLOR[s.congestion]}`}>{CONGESTION_LABEL[s.congestion]}</div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <span className="text-[8px] text-slate-500 uppercase tracking-wider">Hodinový profil</span>
            <div className="flex items-end gap-0.5 mt-1.5 h-12">
              {(data?.hourlyProfile ?? []).map(h => {
                const pct = (h.avg / maxIntensity) * 100
                const now = new Date().getHours()
                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-0.5" title={`${h.hour}:00 — ${h.avg.toLocaleString('sk-SK')} voz/h`}>
                    <div className={`w-full rounded-t-sm ${h.hour === now ? 'bg-green-400' : pct > 75 ? 'bg-rose-500/60' : pct > 50 ? 'bg-amber-500/50' : 'bg-slate-600'}`}
                      style={{ height: `${Math.max(2, pct)}%` }} />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-[7px] text-slate-600">0:00</span>
              <span className="text-[7px] text-slate-600">12:00</span>
              <span className="text-[7px] text-slate-600">23:00</span>
            </div>
          </div>

          <a href={data?.sourceUrl ?? 'https://www.ndsas.sk'} target="_blank" rel="noopener noreferrer"
            className="block text-center text-[8px] text-slate-500 hover:text-green-400 transition-colors py-1 rounded-lg bg-slate-800/30">
            ndsas.sk — intenzita dopravy &rarr;
          </a>
        </div>
      )}
    </WidgetCard>
  )
}
