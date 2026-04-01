'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'

interface ParkingZone {
  id: string
  name: string
  type: string
  total: number
  free: number
  occupied: number
  occupancyPct: number
  status: string
  address: string
  lat: number
  lng: number
}

interface BAParkingData {
  zones: ParkingZone[]
  updatedAt: string
  totalFree: number
  totalCapacity: number
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'full') return <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-500/20 text-red-400 border border-red-500/30">PLNÉ</span>
  if (status === 'closed') return <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-500/20 text-slate-400 border border-slate-500/30">ZATVORENÉ</span>
  if (status === 'limited') return <span className="px-1.5 py-0.5 rounded text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">OBMEDZENÉ</span>
  return <span className="px-1.5 py-0.5 rounded text-[9px] bg-green-500/20 text-green-400 border border-green-500/30">VOĽNÉ</span>
}

function OccupancyBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-green-500'
  return (
    <div className="h-1.5 bg-slate-600/40 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function BAParkingWidget() {
  const { data, loading, refetch } = useWidget<BAParkingData>('/api/ba-parking', 5 * 60 * 1000)

  return (
    <WidgetCard accent="cyan" title="Parkoviská Bratislava" icon="🅿️" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-slate-700/30 rounded-lg px-3 py-2 mb-1">
            <span className="text-green-400 font-bold text-lg">{data.totalFree}</span>
            <span className="text-[11px] text-slate-400">voľných miest z {data.totalCapacity}</span>
          </div>

          {data.zones.map(z => (
            <div key={z.name} className="bg-slate-700/30 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-[12px] text-slate-200 font-medium">{z.name}</span>
                  <span className="ml-1.5 text-[10px] text-slate-500">{z.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">{z.free}/{z.total}</span>
                  <StatusBadge status={z.status} />
                </div>
              </div>
              <OccupancyBar pct={z.occupancyPct} />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-600">{z.occupancyPct}% obsadené</span>
                <a href={`https://www.google.com/maps?q=${z.lat},${z.lng}`} target="_blank" rel="noopener noreferrer"
                  className="text-[9px] text-slate-600 hover:text-cyan-400">maps ↗</a>
              </div>
            </div>
          ))}

          <div className="text-[9px] text-slate-600 text-right">parkovanie.sk · BPS · aktualizácia: {new Date(data.updatedAt).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      )}
    </WidgetCard>
  )
}
