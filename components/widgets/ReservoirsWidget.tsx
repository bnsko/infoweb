'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Reservoir {
  name: string
  river: string
  region: string
  capacity: number
  level: string
  trend: string
  volume_mil_m3: number
  maxVolume_mil_m3: number
}

interface ReservoirData {
  reservoirs: Reservoir[]
  avgCapacity: number
  droughtWarning: boolean
  droughtCount: number
  timestamp: number
}

export default function ReservoirsWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<ReservoirData>('/api/reservoirs', 60 * 60 * 1000)

  return (
    <WidgetCard accent="blue" title={lang === 'sk' ? 'Vodné nádrže' : 'Water Reservoirs'} icon="💧" onRefresh={refetch}
      badge={data ? `${data.avgCapacity}%` : undefined}>
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && data && (
        <div className="space-y-1">
          {data.droughtWarning && (
            <div className="px-2 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[9px] text-orange-300 mb-2">
              ⚠️ {data.droughtCount} nádrží pod 40% kapacity
            </div>
          )}
          {data.reservoirs.map((r, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.03]">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-medium text-slate-200 block truncate">{r.name}</span>
                <span className="text-[8px] text-slate-500">{r.river} · {r.region}</span>
              </div>
              <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{
                  width: `${r.capacity}%`,
                  background: r.capacity > 70 ? '#3b82f6' : r.capacity > 40 ? '#f59e0b' : '#ef4444',
                }} />
              </div>
              <span className={`text-[10px] font-bold tabular-nums w-8 text-right ${r.capacity > 70 ? 'text-blue-400' : r.capacity > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {r.capacity}%
              </span>
              <span className="text-[8px] w-4">{r.trend === 'stúpa' ? '📈' : r.trend === 'klesá' ? '📉' : '➡️'}</span>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
