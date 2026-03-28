'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface StationRow { station: string; logo: string; price: number; change: number }
interface FuelData { fuel: string; fuelSk: string; emoji: string; unit: string; stations: StationRow[]; avgPrice: number; change: number }
interface ApiData { fuels: FuelData[]; energy: FuelData[]; updatedAt: string; source: string }

type Tab = 'fuel' | 'energy'

export default function FuelPricesWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('fuel')
  const [selectedFuel, setSelectedFuel] = useState(0)
  const { data, loading, refetch } = useWidget<ApiData>('/api/fuelprices', 60 * 60 * 1000)

  const items = tab === 'fuel' ? (data?.fuels ?? []) : (data?.energy ?? [])
  const current = items[selectedFuel] ?? items[0]

  return (
    <WidgetCard accent="orange" title={lang === 'sk' ? '⛽ Ceny pohonných hmôt' : '⛽ Fuel & Energy Prices'} icon="" onRefresh={refetch}>
      {/* Fuel/Energy switcher */}
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        <button onClick={() => { setTab('fuel'); setSelectedFuel(0) }}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${tab === 'fuel' ? 'bg-orange-500/15 text-orange-300' : 'text-slate-500 hover:text-slate-300'}`}>
          ⛽ {lang === 'sk' ? 'Pohonné hmoty' : 'Fuel'}
        </button>
        <button onClick={() => { setTab('energy'); setSelectedFuel(0) }}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${tab === 'energy' ? 'bg-yellow-500/15 text-yellow-300' : 'text-slate-500 hover:text-slate-300'}`}>
          ⚡ {lang === 'sk' ? 'Energie' : 'Energy'}
        </button>
      </div>

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

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
      ) : current ? (
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
            <div className="space-y-1.5">
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
      ) : null}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
        <p className="text-[9px] text-slate-600">{data?.source ?? 'ÚRSO · ŠÚ SR'}</p>
        {data?.updatedAt && (
          <p className="text-[9px] text-slate-600">
            {lang === 'sk' ? 'Aktualizované' : 'Updated'}: {data.updatedAt}
          </p>
        )}
      </div>
    </WidgetCard>
  )
}
