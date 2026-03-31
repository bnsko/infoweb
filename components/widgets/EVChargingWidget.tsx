'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Connector {
  type: string
  power: number
  status: 'available' | 'occupied' | 'offline'
}

interface Station {
  name: string
  operator: string
  city: string
  address: string
  connectors: Connector[]
  pricePerKwh: number
}

interface EVData {
  stations: Station[]
  stats: { totalStations: number; totalConnectors: number; available: number; occupied: number }
  timestamp: number
}

export default function EVChargingWidget() {
  const { data, loading, refetch } = useWidget<EVData>('/api/evcharging', 10 * 60 * 1000)

  const statusColor = (s: string) =>
    s === 'available' ? 'bg-emerald-500' : s === 'occupied' ? 'bg-amber-500' : 'bg-red-500'
  const statusLabel = (s: string) =>
    s === 'available' ? 'Voľný' : s === 'occupied' ? 'Obsadený' : 'Offline'

  return (
    <WidgetCard accent="green" title="EV Nabíjačky" icon="⚡" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} />}
      {!loading && data && (
        <div className="space-y-3">
          {/* Stats bar */}
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-slate-400">{data.stats.totalStations} staníc</span>
            <span className="text-slate-700">•</span>
            <span className="text-emerald-400">{data.stats.available} voľných</span>
            <span className="text-slate-700">•</span>
            <span className="text-amber-400">{data.stats.occupied} obsadených</span>
          </div>

          {/* Stations */}
          <div className="space-y-1">
            {data.stations.map((station, i) => {
              const avail = station.connectors.filter(c => c.status === 'available').length
              const total = station.connectors.length
              return (
                <div key={i} className="px-2 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="text-[11px] text-slate-200 font-medium">{station.name}</div>
                      <div className="text-[8px] text-slate-500">{station.operator} · {station.address}</div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-300 shrink-0">
                      {station.pricePerKwh.toFixed(2)} €/kWh
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {station.connectors.map((c, j) => (
                      <div key={j} className="flex items-center gap-1 text-[7px] bg-white/[0.03] rounded px-1.5 py-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${statusColor(c.status)}`} />
                        <span className="text-slate-400">{c.type}</span>
                        <span className="text-slate-600">{c.power}kW</span>
                      </div>
                    ))}
                    <span className="ml-auto text-[8px] font-medium" style={{ color: avail > 0 ? '#34d399' : '#f59e0b' }}>
                      {avail}/{total}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">ZSE · GreenWay · Tesla · Ionity · 10 min</p>
    </WidgetCard>
  )
}
