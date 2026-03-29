'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface StationRow { station: string; logo: string; price: number; change: number }
interface FuelData { fuel: string; fuelSk: string; emoji: string; unit: string; stations: StationRow[]; avgPrice: number; change: number }
interface HistoryPoint { month: string; price: number }
interface EUCountry { country: string; flag: string; petrol: number; diesel: number }
interface SourceLink { name: string; url: string }
interface ApiData {
  fuels: FuelData[]; energy: FuelData[]; updatedAt: string
  brent: { price: number; change: number }
  history: HistoryPoint[]; euComparison: EUCountry[]; sources: SourceLink[]
}

type Tab = 'fuel' | 'energy' | 'eu' | 'chart'

export default function FuelPricesWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('fuel')
  const [selectedFuel, setSelectedFuel] = useState(0)
  const { data, loading, refetch } = useWidget<ApiData>('/api/fuelprices', 60 * 60 * 1000)

  const items = tab === 'fuel' ? (data?.fuels ?? []) : tab === 'energy' ? (data?.energy ?? []) : []
  const current = items[selectedFuel] ?? items[0]

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'fuel', icon: '⛽', label: lang === 'sk' ? 'Palivo' : 'Fuel' },
    { key: 'energy', icon: '⚡', label: lang === 'sk' ? 'Energie' : 'Energy' },
    { key: 'eu', icon: '🇪🇺', label: lang === 'sk' ? 'EÚ' : 'EU' },
    { key: 'chart', icon: '📊', label: lang === 'sk' ? 'Vývoj' : 'History' },
  ]

  return (
    <WidgetCard accent="orange" title={lang === 'sk' ? '⛽ Ceny pohonných hmôt & Energie' : '⛽ Fuel & Energy Prices'} icon="" onRefresh={refetch}>
      {/* Brent banner */}
      {data?.brent && (
        <div className="flex items-center justify-between bg-slate-500/8 rounded-xl px-3 py-2 mb-3 border border-slate-500/15">
          <div className="flex items-center gap-2">
            <span className="text-sm">🛢️</span>
            <span className="text-[10px] text-slate-400 font-semibold">Brent Crude</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tabular-nums">${data.brent.price}</span>
            <span className={`text-[10px] font-bold tabular-nums ${data.brent.change > 0 ? 'text-red-400' : data.brent.change < 0 ? 'text-green-400' : 'text-slate-400'}`}>
              {data.brent.change > 0 ? '▲' : data.brent.change < 0 ? '▼' : '─'}{Math.abs(data.brent.change)}%
            </span>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => { setTab(tb.key); setSelectedFuel(0) }}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === tb.key ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{tb.icon}</span>
            <span className="hidden sm:inline">{tb.label}</span>
          </button>
        ))}
      </div>

      {loading && <div className="space-y-2">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>}

      {/* Fuel / Energy tabs */}
      {!loading && (tab === 'fuel' || tab === 'energy') && (
        <>
          {/* Fuel type selector */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {items.map((item, i) => (
              <button key={item.fuel} onClick={() => setSelectedFuel(i)}
                className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-xl transition-all border ${
                  selectedFuel === i
                    ? 'bg-orange-500/15 text-orange-300 border-orange-500/25'
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                }`}>
                {item.emoji} {lang === 'sk' ? item.fuelSk : item.fuel}
              </button>
            ))}
          </div>

          {current && (
            <>
              {/* Average price header */}
              <div className="flex items-center justify-between bg-orange-500/8 rounded-xl p-3 mb-3 border border-orange-500/15">
                <div>
                  <div className="text-[10px] text-orange-300/70 uppercase font-semibold">{lang === 'sk' ? 'Priemerná cena SK' : 'SK avg price'}</div>
                  <div className="text-xl font-bold text-white tabular-nums">{current.avgPrice.toFixed(3)} €<span className="text-sm text-slate-400 ml-1">{current.unit}</span></div>
                </div>
                <div className={`text-[13px] font-bold ${current.change > 0 ? 'text-red-400' : current.change < 0 ? 'text-green-400' : 'text-slate-400'}`}>
                  {current.change > 0 ? '▲' : current.change < 0 ? '▼' : '─'} {Math.abs(current.change)}%
                  <div className="text-[9px] text-slate-500 font-normal text-right">{lang === 'sk' ? 'vs 7 dní' : 'vs 7d'}</div>
                </div>
              </div>

              {/* Station breakdown */}
              {current.stations.length > 0 ? (
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto scrollbar-hide">
                  {current.stations.map((s, i) => (
                    <div key={s.station}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all ${
                        i === 0 ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-white/[0.02] border-white/5 hover:border-orange-500/15'
                      }`}>
                      <span className="text-base">{s.logo}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-semibold text-slate-200">{s.station}</span>
                          {i === 0 && <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold uppercase">{lang === 'sk' ? 'Najlacnejšie' : 'Cheapest'}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] font-bold text-white tabular-nums">{s.price.toFixed(3)} €</div>
                        <div className={`text-[10px] tabular-nums ${s.change > 0 ? 'text-red-400' : s.change < 0 ? 'text-green-400' : 'text-slate-500'}`}>
                          {s.change > 0 ? '▲' : s.change < 0 ? '▼' : '─'} {Math.abs(s.change)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-1">{current.emoji}</div>
                  <div className="text-sm font-bold text-white">{current.avgPrice.toFixed(4)} € / {current.unit}</div>
                  <div className={`text-[11px] mt-1 ${current.change > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {current.change > 0 ? '▲' : '▼'} {Math.abs(current.change)}%
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* EU Comparison tab */}
      {!loading && tab === 'eu' && (
        <div className="space-y-1.5 max-h-[380px] overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-2 text-[9px] text-slate-500 px-2 mb-1 border-b border-white/5 pb-1">
            <span className="flex-1">Krajina</span>
            <span className="w-16 text-center">⛽ Benzín</span>
            <span className="w-16 text-center">🛢️ Nafta</span>
          </div>
          {(data?.euComparison ?? [])
            .sort((a, b) => a.petrol - b.petrol)
            .map((c, i) => (
            <div key={c.country} className={`flex items-center gap-2 rounded-lg px-2 py-2 border transition-all ${
              c.country === 'Slovensko' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/[0.02] border-white/5'
            }`}>
              <span className="text-sm">{c.flag}</span>
              <span className={`flex-1 text-[11px] font-medium ${c.country === 'Slovensko' ? 'text-orange-300' : 'text-slate-300'}`}>{c.country}</span>
              <span className="w-16 text-center text-[11px] font-bold text-white tabular-nums">{c.petrol.toFixed(3)}</span>
              <span className="w-16 text-center text-[11px] font-bold text-white tabular-nums">{c.diesel.toFixed(3)}</span>
            </div>
          ))}
          <p className="text-[9px] text-slate-600 text-center mt-2">€/l · Zdroj: European Commission Oil Bulletin</p>
        </div>
      )}

      {/* Price history chart tab */}
      {!loading && tab === 'chart' && data?.history && (
        <div>
          <p className="text-[10px] text-slate-500 mb-2">{lang === 'sk' ? 'Benzín 95 — posledných 12 mesiacov (€/l)' : 'Petrol 95 — last 12 months (€/l)'}</p>
          <div className="relative h-[180px] bg-white/[0.02] rounded-xl border border-white/5 p-3">
            <svg viewBox="0 0 320 130" className="w-full h-full" preserveAspectRatio="none">
              {(() => {
                const pts = data.history
                const minP = Math.min(...pts.map(p => p.price)) - 0.02
                const maxP = Math.max(...pts.map(p => p.price)) + 0.02
                const toX = (i: number) => (i / (pts.length - 1)) * 270 + 35
                const toY = (p: number) => 110 - ((p - minP) / (maxP - minP)) * 100
                const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.price)}`).join(' ')
                const areaPath = linePath + ` L ${toX(pts.length - 1)} 115 L ${toX(0)} 115 Z`
                // Y-axis labels (5 ticks)
                const ySteps = 4
                const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
                  const price = minP + ((maxP - minP) * i) / ySteps
                  return { price, y: toY(price) }
                })
                return (
                  <>
                    <defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity="0.3" /><stop offset="100%" stopColor="#f97316" stopOpacity="0" /></linearGradient></defs>
                    {/* Y-axis grid lines and labels */}
                    {yLabels.map((yl, i) => (
                      <g key={i}>
                        <line x1="35" y1={yl.y} x2="305" y2={yl.y} stroke="white" strokeOpacity="0.06" strokeWidth="0.5" />
                        <text x="30" y={yl.y + 3} textAnchor="end" fill="#64748b" fontSize="7" fontFamily="monospace">{yl.price.toFixed(2)}</text>
                      </g>
                    ))}
                    <path d={areaPath} fill="url(#fg)" />
                    <path d={linePath} fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => (
                      <g key={i}>
                        <circle cx={toX(i)} cy={toY(p.price)} r="3" fill="#f97316" stroke="#1e1e2e" strokeWidth="1.5" />
                        <text x={toX(i)} y={toY(p.price) - 6} textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="monospace">{p.price.toFixed(2)}</text>
                      </g>
                    ))}
                    {/* Y-axis label */}
                    <text x="4" y="60" fill="#64748b" fontSize="6" transform="rotate(-90, 8, 60)" textAnchor="middle">€/liter</text>
                  </>
                )
              })()}
            </svg>
          </div>
          <div className="flex justify-between text-[8px] text-slate-600 mt-1 px-1">
            {data.history.filter((_, i) => i % 3 === 0 || i === data.history.length - 1).map((p, i) => (
              <span key={i}>{p.month}</span>
            ))}
          </div>
        </div>
      )}

      {/* Sources footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          {(data?.sources ?? []).map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[8px] text-slate-600 hover:text-orange-400 transition-colors">
              {s.name} ↗
            </a>
          ))}
        </div>
        {data?.updatedAt && <p className="text-[9px] text-slate-600 shrink-0 ml-2">{data.updatedAt}</p>}
      </div>
    </WidgetCard>
  )
}
