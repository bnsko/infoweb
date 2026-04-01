'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Connector { type: string; power: number; status: 'available' | 'occupied' | 'offline' }
interface Station { name: string; operator: string; city: string; address: string; connectors: Connector[]; pricePerKwh: number; lat: number; lng: number; mapsUrl: string }
interface EVData { stations: Station[]; stats: { totalStations: number; totalConnectors: number; available: number; occupied: number }; timestamp: number }

type Filter = 'all' | 'free' | 'occupied'

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function EVChargingWidget() {
  const { data, loading, refetch } = useWidget<EVData>('/api/evcharging', 10 * 60 * 1000)
  const [filter, setFilter] = useState<Filter>('free')
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => {},
        { timeout: 5000 }
      )
    }
  }, [])

  const stations = data?.stations ?? []

  // Sort: free first, then by distance if we have location
  const sorted = [...stations].sort((a, b) => {
    const aFree = a.connectors.filter(c => c.status === 'available').length
    const bFree = b.connectors.filter(c => c.status === 'available').length
    if (filter !== 'occupied') {
      if (bFree > 0 && aFree === 0) return 1
      if (aFree > 0 && bFree === 0) return -1
    }
    if (userPos) {
      const da = haversine(userPos.lat, userPos.lng, a.lat, a.lng)
      const db = haversine(userPos.lat, userPos.lng, b.lat, b.lng)
      return da - db
    }
    return 0
  })

  const filtered = filter === 'all' ? sorted
    : filter === 'free' ? sorted.filter(s => s.connectors.some(c => c.status === 'available'))
    : sorted.filter(s => s.connectors.every(c => c.status !== 'available'))

  const cheapest = stations.length ? [...stations].filter(s => s.connectors.some(c => c.status === 'available')).sort((a, b) => a.pricePerKwh - b.pricePerKwh)[0] : null
  const fastestPower = stations.length ? Math.max(...stations.flatMap(s => s.connectors.map(c => c.power))) : 0

  const statusDot = (s: string) => s === 'available' ? 'bg-emerald-500' : s === 'occupied' ? 'bg-amber-500' : 'bg-red-500'

  const filters: { key: Filter; label: string }[] = [
    { key: 'free', label: '🟢 Voľné' },
    { key: 'all', label: '☰ Všetky' },
    { key: 'occupied', label: '🔴 Obsadené' },
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

          {/* Cheapest free + location hint */}
          <div className="flex items-center gap-2">
            {cheapest && (
              <a href={cheapest.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10 text-[9px] hover:bg-green-500/8 transition-colors">
                <span className="text-green-400">💰</span>
                <span className="text-green-300 font-semibold">Najlacnejšia voľná:</span>
                <span className="text-slate-300 flex-1 truncate">{cheapest.name}</span>
                <span className="text-green-400 font-bold shrink-0">{cheapest.pricePerKwh.toFixed(2)} €/kWh</span>
                <span className="text-slate-500 shrink-0">↗</span>
              </a>
            )}
            {userPos && <span className="text-[8px] text-slate-500">📍 Zoradené najbližšie</span>}
          </div>

          {/* Filter toggle */}
          <div className="flex gap-1">
            {filters.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} className="flex-1 text-[9px] font-semibold py-1.5 rounded-lg border transition-all" style={{ background: filter === f.key ? 'rgba(34,197,94,0.1)' : 'transparent', borderColor: filter === f.key ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.04)', color: filter === f.key ? '#86efac' : '#64748b' }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Stations */}
          <div className="space-y-1.5">
            {filtered.map((station, i) => {
              const avail = station.connectors.filter(c => c.status === 'available').length
              const total = station.connectors.length
              const dist = userPos ? haversine(userPos.lat, userPos.lng, station.lat, station.lng) : null
              return (
                <div key={i} className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
                  <div className="flex items-start justify-between px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${avail > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-[11px] text-slate-200 font-semibold truncate">{station.name}</span>
                        {dist !== null && <span className="text-[7px] text-slate-500 shrink-0">{dist.toFixed(0)} km</span>}
                      </div>
                      <div className="text-[8px] text-slate-500 mt-0.5 ml-3.5">{station.operator} · {station.city} · {station.address}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[9px] font-mono text-slate-300">{station.pricePerKwh.toFixed(2)} €/kWh</span>
                      <a href={station.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-[8px] px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/15 text-blue-300 hover:bg-blue-500/15 transition-colors font-semibold" title="Otvoriť v Google Maps">
                        🗺️ Mapa
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-3 pb-2 flex-wrap">
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

