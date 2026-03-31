'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface ParkingSpot { name: string; address: string; total: number; free: number; occupancy: number; price: string }
interface ParkingData { parking: ParkingSpot[]; timestamp: number }

export default function ParkingWidget() {
  const { data, loading, refetch } = useWidget<ParkingData>('/api/parking', 5 * 60 * 1000)

  return (
    <WidgetCard accent="blue" title="Parkovanie Bratislava" icon="🅿️" onRefresh={refetch}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && data && (
        <div className="space-y-1">
          {data.parking.map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-slate-200 truncate">{p.name}</div>
                <div className="text-[8px] text-slate-500">📍 {p.address} · {p.price}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-[14px] font-bold font-mono tabular-nums ${p.free > 50 ? 'text-green-400' : p.free > 10 ? 'text-amber-400' : 'text-red-400'}`}>{p.free}</div>
                <div className="text-[7px] text-slate-500">voľných</div>
              </div>
              <div className="w-10 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${p.occupancy}%`, background: p.occupancy > 90 ? '#ef4444' : p.occupancy > 70 ? '#f59e0b' : '#22c55e' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
