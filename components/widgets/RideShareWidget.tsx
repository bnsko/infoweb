'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Ride { name: string; icon: string; estimatedPrice: string; surge: number; waitMinutes: number; carsNearby: number; available: boolean }
interface Scooter { name: string; icon: string; available: number; price: string; unlockFee: string; battery: number }
interface RideData { rides: Ride[]; scooters: Scooter[]; isRushHour: boolean; isNight: boolean; timestamp: number }

export default function RideShareWidget() {
  const { data, loading, refetch } = useWidget<RideData>('/api/rideshare', 5 * 60 * 1000)

  const rides = data?.rides ?? []
  const scooters = data?.scooters ?? []
  const cheapestRide = rides.length ? [...rides].filter(r => r.available).sort((a, b) => parseFloat(a.estimatedPrice) - parseFloat(b.estimatedPrice))[0] : null
  const totalCars = rides.reduce((s, r) => s + r.carsNearby, 0)
  const totalScooters = scooters.reduce((s, sc) => s + sc.available, 0)
  const avgWait = rides.length ? Math.round(rides.filter(r => r.available).reduce((s, r) => s + r.waitMinutes, 0) / Math.max(1, rides.filter(r => r.available).length)) : 0

  return (
    <WidgetCard accent="cyan" title="Taxi & Kolobežky" icon="🚕" onRefresh={refetch}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && data && (
        <div className="space-y-3">
          {/* Context banner */}
          {(data.isRushHour || data.isNight) && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-semibold" style={{ background: data.isRushHour ? 'rgba(249,115,22,0.06)' : 'rgba(99,102,241,0.06)', borderColor: data.isRushHour ? 'rgba(249,115,22,0.12)' : 'rgba(99,102,241,0.12)', color: data.isRushHour ? '#fb923c' : '#818cf8' }}>
              {data.isRushHour ? '⚡ Rush hour — zvýšené ceny a dlhšie čakanie' : '🌙 Nočná tarifa — menej vodičov'}
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-1.5">
            <div className="text-center px-1.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[13px] font-bold text-cyan-400">{totalCars}</div>
              <div className="text-[7px] text-slate-500">Áut v okolí</div>
            </div>
            <div className="text-center px-1.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[13px] font-bold text-white">~{avgWait} min</div>
              <div className="text-[7px] text-slate-500">Priem. čakanie</div>
            </div>
            <div className="text-center px-1.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[13px] font-bold text-green-400">{totalScooters}</div>
              <div className="text-[7px] text-slate-500">Kolobežiek</div>
            </div>
            <div className="text-center px-1.5 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10">
              <div className="text-[13px] font-bold text-green-400">{cheapestRide?.estimatedPrice ?? '—'}</div>
              <div className="text-[7px] text-slate-500">Najlacnejšie</div>
            </div>
          </div>

          {/* Rides */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[9px]">🚕</span>
              <span className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider">Taxi služby</span>
              <div className="flex-1 h-px bg-cyan-500/10" />
            </div>
            <div className="space-y-1">
              {rides.map((r, i) => {
                const isCheapest = cheapestRide && r.name === cheapestRide.name
                return (
                  <div key={i} className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all ${r.available ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-red-500/5 border-red-500/10 opacity-50'}`} style={isCheapest ? { borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.04)' } : {}}>
                    <span className="text-lg">{r.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-white">{r.name}</span>
                        {isCheapest && <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 font-bold">💰 Najlacnejšie</span>}
                        {r.surge > 1.2 && <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-bold">×{r.surge}</span>}
                      </div>
                      <div className="text-[8px] text-slate-500">{r.carsNearby} áut · ~{r.waitMinutes} min čakanie</div>
                    </div>
                    <div className="text-[14px] font-bold text-green-400">{r.estimatedPrice}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scooters */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[9px]">🛴</span>
              <span className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider">Ekolobežky</span>
              <div className="flex-1 h-px bg-cyan-500/10" />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {scooters.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-[10px] font-bold text-white">{s.name}</span>
                  <span className={`text-[14px] font-bold ${s.available > 5 ? 'text-green-400' : s.available > 0 ? 'text-amber-400' : 'text-red-400'}`}>{s.available}</span>
                  <span className="text-[7px] text-slate-500">dostupných</span>
                  <div className="w-full h-1 rounded-full bg-white/5 mt-1">
                    <div className="h-1 rounded-full transition-all" style={{ width: `${s.battery}%`, background: s.battery > 60 ? '#22c55e' : s.battery > 30 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                  <span className="text-[7px] text-slate-600">{s.battery}% bat · {s.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">Bolt · Uber · Hopin · Liftago · Tier · Lime · 5 min</p>
    </WidgetCard>
  )
}
