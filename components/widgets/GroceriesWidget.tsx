'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface StorePrice { store: string; price: number; unit: string }
interface GroceryItem {
  name: string; nameSk: string
  category: string; categorySk: string
  emoji: string; stores: StorePrice[]
  avgPrice: number; unit: string
}
interface Category { key: string; sk: string; en: string }

const STORE_COLORS: Record<string, string> = {
  Lidl: 'text-blue-400',
  Kaufland: 'text-red-400',
  Tesco: 'text-blue-300',
  Billa: 'text-yellow-400',
  COOP: 'text-orange-400',
}

export default function GroceriesWidget() {
  const { lang } = useLang()
  const [category, setCategory] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const { data, loading, refetch } = useWidget<{
    items: GroceryItem[]; categories: Category[]; source: string
  }>(`/api/groceries?category=${category}`, 60 * 60 * 1000)

  const categories = data?.categories ?? []

  return (
    <WidgetCard accent="green" title={lang === 'sk' ? '🛒 Ceny potravín' : '🛒 Grocery Prices'} icon="" onRefresh={refetch}>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 mb-3">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition-all ${
              category === cat.key
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-300 border border-transparent hover:bg-white/5'
            }`}
          >
            {lang === 'sk' ? cat.sk : cat.en}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-1 max-h-[420px] overflow-y-auto scrollbar-hide">
          {(data?.items ?? []).map((item) => {
            const cheapest = item.stores[0]
            const isExpanded = expanded === item.name
            return (
              <div key={item.name}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : item.name)}
                  className="w-full flex items-center gap-2.5 rounded-lg p-2 widget-item-hover text-left"
                >
                  <span className="text-lg shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-slate-200">
                      {lang === 'sk' ? item.nameSk : item.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {lang === 'sk' ? 'Najlacnejšie' : 'Cheapest'}: <span className={STORE_COLORS[cheapest.store] ?? 'text-white'}>{cheapest.store}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[12px] font-bold text-emerald-400 tabular-nums">{cheapest.price.toFixed(2)} €</div>
                    <div className="text-[9px] text-slate-500">{item.unit}</div>
                  </div>
                  <svg className={`w-3 h-3 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                       fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="ml-8 mb-2 bg-white/[0.02] rounded-lg p-2 border border-white/5 anim-scale-in">
                    {item.stores.map((store, j) => (
                      <div key={store.store} className="flex items-center justify-between py-1">
                        <span className={`text-[11px] font-medium ${STORE_COLORS[store.store] ?? 'text-slate-300'}`}>
                          {j === 0 ? '🏆 ' : ''}{store.store}
                        </span>
                        <span className={`text-[11px] tabular-nums ${j === 0 ? 'font-bold text-emerald-400' : 'text-slate-400'}`}>
                          {store.price.toFixed(2)} €
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      <p className="text-[9px] text-slate-600 mt-2 text-center">{data?.source ?? 'cenyhladaj.sk'}</p>
    </WidgetCard>
  )
}
