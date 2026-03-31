'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Ride { name: string; icon: string; estimatedPrice: string; surge: number; waitMinutes: number; carsNearby: number; available: boolean }
interface Scooter { name: string; icon: string; available: number; price: string; unlockFee: string; battery: number }
interface RideData { rides: Ride[]; scooters: Scooter[]; isRushHour: boolean; isNight: boolean; timestamp: number }

export default function RideShareWidget() {
  const { data, loading, refetch } = useWidget<RideData>('/api/rideshare', 5 * 60 * 1000)

  return (
    <WidgetCard accent="cyan" title="Taxi & Kolobežky" icon="🚕" onRefresh={refetch}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && data && (
        <div className="space-y-3">
          {data.isRushHour && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-orange-500/8 border border-orange-500/15 text-[9px] text-orange-400 font-semibold">
              ⚡ Rush hour — zvýšené ceny a dlhšie čakanie
            </div>
          )}

          {/* Rides */}
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">🚕 Taxi služby</div>
            <div className="space-y-1">
              {data.rides.map((r, i) => (
                <div key={i} className={`flex items-center gap-2 px-2 py-2 rounded-lg border transition-colors ${r.available ? 'bg-white/[0.02] border-white/5' : 'bg-red-500/5 border-red-500/10 opacity-60'}`}>
                  <span className="text-lg">{r.icon}</span>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-white">{r.name}</div>
                    <div className="text-[8px] text-slate-500">{r.carsNearby} áut v okolí · čakanie ~{r.waitMinutes} min</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold text-green-400">{r.estimatedPrice}</div>
                    {r.surge > 1.2 && <div className="text-[7px] text-orange-400 font-bold">×{r.surge} surge</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scooters */}
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">🛴 Ekolobežky</div>
            <div className="grid grid-cols-3 gap-1">
              {data.scooters.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-[10px] font-bold text-white">{s.name}</span>
                  <span className={`text-[13px] font-bold ${s.available > 5 ? 'text-green-400' : s.available > 0 ? 'text-amber-400' : 'text-red-400'}`}>{s.available}</span>
                  <span className="text-[7px] text-slate-500">dostupných</span>
                  <span className="text-[7px] text-slate-600">{s.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
