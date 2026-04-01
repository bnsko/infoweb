'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Departure {
  id: string; operator: string; from: string; to: string; distance: number
  departureTime: string; arrivalTime: string; durationMin: number
  price: number; occupancyPct: number; occupancyStatus: string; seatsLeft: number
  hasWifi: boolean; hasBistro: boolean; bookingUrl: string; delayMin: number
}
interface PriceStats { cheapestToday: number; avgPrice: number; mostOccupiedRoute: string }
interface TrainData { departures: Departure[]; priceStats: PriceStats; updatedAt: string }

const OPERATOR_COLORS: Record<string, string> = {
  'RegioJet': 'text-yellow-400',
  'Leo Express': 'text-blue-400',
  'ZSSK': 'text-green-400',
}
const OCCUPANCY_COLOR = (pct: number) => pct > 80 ? 'text-rose-400' : pct > 50 ? 'text-amber-400' : 'text-green-400'

const ALL_ROUTES = ['všetky', 'BA-KE', 'BA-BB', 'BA-ZA', 'BA-PP']

export default function TrainRoutesWidget() {
  const { data, loading, refetch } = useWidget<TrainData>('/api/train-routes', 30 * 60 * 1000)
  const [routeFilter, setRouteFilter] = useState('všetky')
  const [sortBy, setSortBy] = useState<'price' | 'time'>('price')

  const departures = (data?.departures ?? [])
    .filter(d => routeFilter === 'všetky' || `${d.from.substring(0, 2).toUpperCase()}-${d.to.substring(0, 2).toUpperCase()}` === routeFilter || routeFilter === `${d.from}-${d.to}`)
    .sort((a, b) => sortBy === 'price' ? a.price - b.price : a.departureTime.localeCompare(b.departureTime))

  return (
    <WidgetCard accent="blue" title="RegioJet & Leo Express" icon="🚆" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={7} /> : (
        <div className="space-y-3">
          {data?.priceStats && (
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase">Najlacnejší</span>
                <span className="text-[14px] font-bold text-green-400">{data.priceStats.cheapestToday} €</span>
              </div>
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase">Priemer</span>
                <span className="text-[14px] font-bold text-blue-400">{data.priceStats.avgPrice} €</span>
              </div>
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase">Obsadená linka</span>
                <span className="text-[9px] font-bold text-amber-400 text-center leading-tight">{data.priceStats.mostOccupiedRoute}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 flex-wrap">
            {ALL_ROUTES.slice(0, 5).map(r => (
              <button key={r} onClick={() => setRouteFilter(r)}
                className={`text-[8px] px-2 py-0.5 rounded-full transition-colors ${routeFilter === r ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                {r}
              </button>
            ))}
            <div className="ml-auto flex gap-1">
              {(['price', 'time'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`text-[8px] px-2 py-0.5 rounded-full transition-colors ${sortBy === s ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {s === 'price' ? 'cena' : 'čas'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
            {departures.slice(0, 8).map(d => (
              <a key={d.id} href={d.bookingUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold ${OPERATOR_COLORS[d.operator] ?? 'text-slate-400'}`}>{d.operator}</span>
                    <span className="text-[9px] text-white">{d.from} → {d.to}</span>
                    {d.delayMin > 0 && <span className="text-[7px] text-rose-400">+{d.delayMin}'</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-mono text-slate-300">{d.departureTime}</span>
                    <span className="text-[8px] text-slate-600">→</span>
                    <span className="text-[10px] font-mono text-slate-300">{d.arrivalTime}</span>
                    <span className="text-[8px] text-slate-500">({Math.floor(d.durationMin / 60)}h{d.durationMin % 60}m)</span>
                    {d.hasWifi && <span className="text-[8px] text-slate-500" title="WiFi">📶</span>}
                    {d.hasBistro && <span className="text-[8px] text-slate-500" title="bistro">🍕</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[13px] font-bold text-green-400">{d.price} €</div>
                  <div className={`text-[8px] ${OCCUPANCY_COLOR(d.occupancyPct)}`}>{d.occupancyPct}% obs.</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
