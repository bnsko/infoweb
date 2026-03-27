'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface PriceItem {
  name: string
  nameSk: string
  price: string
  unit: string
  change: number
  emoji: string
  category: 'fuel' | 'energy' | 'other'
}

type Tab = 'fuel' | 'energy'

export default function FuelPricesWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('fuel')
  const { data, loading, refetch } = useWidget<{
    prices: PriceItem[]
    updatedAt: string
    source: string
  }>('/api/fuelprices', 60 * 60 * 1000)

  const items = (data?.prices ?? []).filter(p => p.category === tab)

  return (
    <WidgetCard accent="orange" title={lang === 'sk' ? '⛽ Ceny energií' : '⛽ Energy Prices'} icon="" onRefresh={refetch}>
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        <button onClick={() => setTab('fuel')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
            tab === 'fuel' ? 'bg-orange-500/15 text-orange-300' : 'text-slate-500 hover:text-slate-300'
          }`}>
          ⛽ {lang === 'sk' ? 'Pohonné hmoty' : 'Fuel'}
        </button>
        <button onClick={() => setTab('energy')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
            tab === 'energy' ? 'bg-yellow-500/15 text-yellow-300' : 'text-slate-500 hover:text-slate-300'
          }`}>
          ⚡ {lang === 'sk' ? 'Energie' : 'Energy'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3 border border-white/5 hover:border-orange-500/15 transition-all">
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium text-slate-200">
                  {lang === 'sk' ? item.nameSk : item.name}
                </div>
                <div className="text-[10px] text-slate-500">{item.unit}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white tabular-nums">{item.price} €</div>
                <div className={`text-[10px] font-semibold tabular-nums ${
                  item.change > 0 ? 'text-red-400' : item.change < 0 ? 'text-green-400' : 'text-slate-500'
                }`}>
                  {item.change > 0 ? '▲' : item.change < 0 ? '▼' : '─'} {Math.abs(item.change)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[9px] text-slate-600 mt-2 text-center">{data?.source ?? 'ÚRSO · ŠÚ SR'}</p>
    </WidgetCard>
  )
}
