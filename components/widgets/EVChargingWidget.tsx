'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Connector { type: string; power: number; status: 'available' | 'occupied' | 'offline' }
interface Station { name: string; operator: string; city: string; address: string; connectors: Connector[]; pricePerKwh: number }
interface EVData { stations: Station[]; stats: { totalStations: number; totalConnectors: number; available: number; occupied: number }; timestamp: number }

type Filter = 'all' | 'free' | 'occupied'

export default function EVChargingWidget() {
  const { data, loading, refetch } = useWidget<EVData>('/api/evcharging', 10 * 60 * 1000)
  const [filter, setFilter] = useState<Filter>('all')

  const stations = data?.stations ?? []
  const filtered = filter === 'all' ? stations
    : filter === 'free' ? stations.filter(s => s.connectors.some(c => c.status === 'available'))
    : stations.filter(s => s.connectors.every(c => c.status !== 'available'))

  const cheapest = stations.length ? [...stations].sort((a, b) => a.pricePerKwh - b.pricePerKwh)[0] : null
  const fastestPower = stations.length ? Math.max(...stations.flatMap(s => s.connectors.map(c => c.power))) : 0

  const statusDot = (s: string) => s === 'available' ? 'bg-emerald-500' : s === 'occupied' ? 'bg-amber-500' : 'bg-red-500'

  const filters: { key: Filter; label: string; color: string }[] = [
    { key: 'all', label: 'Všetky', color: 'rgba(255,255,255,0.08)' },
    { key: 'free', label: '🟢 Voľné', color: 'rgba(34,197,94,0.12)' },
    { key: 'occupied', label: '🔴 Obsadené', color: 'rgba(239,68,68,0.12)' },
  ]

  return (
    <WidgetCard accent="green" title="EV Nabíjačky" icon="⚡" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} />}
      {!loading && data && (
        <div className="space-y-3">
          {/* Stats overview */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[14px] font-bold text-white">{data.stats.totalStations}</div>
              <div className="text-[7px] text-slate-500">Staníc</div>
            </div>
            <div className="text-center px-2 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <div className="text-[14px] font-bold text-emerald-400">{data.stats.available}</div>
              <div className="text-[7px] text-slate-500">Voľných</div>
            </div>
            <div className="text-center px-2 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <div className="text-[14px] font-bold text-amber-400">{data.stats.occupied}</div>
              <div className="text-[7px] text-slate-500">Obsadených</div>
            </div>
            <div className="text-center px-2 py-1.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
              <div className="text-[14px] font-bold text-cyan-400">{fastestPower}</div>
              <div className="text-[7px] text-slate-500">Max kW</div>
            </div>
          </div>

          {/* Quick info */}
          {cheapest && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10 text-[9px]">
              <span className="text-green-400">💰</span>
              <span className="text-green-300 font-semibold">Najlacnejšia:</span>
              <span className="text-slate-300">{cheapest.name}</span>
              <span className="ml-auto text-green-400 font-bold">{cheapest.pricePerKwh.toFixed(2)} €/kWh</span>
            </div>
          )}

          {/* Filter toggle */}
          <div className="flex gap-1">
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className="flex-1 text-[9px] font-semibold py-1.5 rounded-lg border transition-all" style={{ background: filter === f.key ? f.color : 'transparent', borderColor: filter === f.key ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', color: filter === f.key ? '#fff' : '#64748b' }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Stations */}
          <div className="space-y-1">
            {filtered.map((station, i) => {
              const avail = station.connectors.filter(c => c.status === 'available').length
              const total = station.connectors.length
              return (
                <div key={i} className="px-2.5 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="text-[11px] text-slate-200 font-medium">{station.name}</div>
                      <div className="text-[8px] text-slate-500">{station.operator} · {station.city} · {station.address}</div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-300 shrink-0">{station.pricePerKwh.toFixed(2)} €/kWh</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {station.connectors.map((c, j) => (
                      <div key={j} className="flex items-center gap-1 text-[7px] rounded px-1.5 py-0.5" style={{ background: c.status === 'available' ? 'rgba(34,197,94,0.08)' : c.status === 'occupied' ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)' }}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot(c.status)}`} />
                        <span className="text-slate-400">{c.type}</span>
                        <span className="text-slate-500">{c.power}kW</span>
                      </div>
                    ))}
                    <span className="ml-auto text-[9px] font-bold" style={{ color: avail > 0 ? '#34d399' : '#f59e0b' }}>
                      {avail}/{total} voľných
                    </span>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && <div className="text-[10px] text-slate-500 text-center py-4">Žiadne stanice pre tento filter</div>}
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">ZSE · GreenWay · Tesla · Ionity · 10 min</p>
    </WidgetCard>
  )
}
