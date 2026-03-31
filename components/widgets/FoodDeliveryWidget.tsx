'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Restaurant {
  name: string; icon: string; platform: string; category: string
  isOpen: boolean; deliveryTime: number; deliveryFee: number; rating: number
  promoOffer: string | null; popularDish: string; popularDishPrice: number; minOrder: number
}
interface FoodData { restaurants: Restaurant[]; recommendations: Restaurant[]; isLunchTime: boolean; isDinnerTime: boolean; isOpen: boolean; timestamp: number }

export default function FoodDeliveryWidget() {
  const { data, loading, refetch } = useWidget<FoodData>('/api/fooddelivery', 10 * 60 * 1000)

  return (
    <WidgetCard accent="rose" title="Wolt & Bolt Food" icon="🛵" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} />}
      {!loading && data && (
        <div className="space-y-3">
          {/* Time context */}
          <div className="flex items-center gap-2 text-[9px]">
            {data.isLunchTime && <span className="bg-orange-500/15 text-orange-300 px-2 py-0.5 rounded-full font-bold">🕐 Obed</span>}
            {data.isDinnerTime && <span className="bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full font-bold">🕗 Večera</span>}
            {!data.isOpen && <span className="text-red-400 font-bold">Zatvorené</span>}
            <span className="text-slate-500">{data.restaurants.filter(r => r.isOpen).length}/{data.restaurants.length} otvorených</span>
          </div>

          {/* Recommendations */}
          {data.recommendations.length > 0 && (
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1">⭐ Odporúčame</div>
              <div className="grid grid-cols-3 gap-1">
                {data.recommendations.map((r, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-gradient-to-b from-rose-500/[0.06] to-transparent border border-rose-500/10">
                    <span className="text-xl">{r.icon}</span>
                    <span className="text-[9px] font-bold text-white text-center">{r.name}</span>
                    <span className="text-[7px] text-slate-400">{r.popularDish}</span>
                    <span className="text-[10px] font-bold text-green-400">{r.popularDishPrice.toFixed(1)} €</span>
                    <span className="text-[7px] text-slate-500">~{r.deliveryTime} min</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All restaurants */}
          <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-hide">
            {data.restaurants.filter(r => r.isOpen).map((r, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition">
                <span className="text-lg shrink-0">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-white">{r.name}</span>
                    <span className={`text-[7px] px-1 py-0.5 rounded ${r.platform === 'Wolt' ? 'bg-blue-500/15 text-blue-300' : 'bg-green-500/15 text-green-300'}`}>{r.platform}</span>
                  </div>
                  <div className="text-[8px] text-slate-500">{r.category} · min. {r.minOrder} € · donáška {r.deliveryFee.toFixed(1)} €</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[9px] text-amber-400">⭐ {r.rating}</div>
                  <div className="text-[8px] text-slate-500">~{r.deliveryTime}′</div>
                </div>
                {r.promoOffer && <span className="text-[7px] bg-red-500/15 text-red-300 px-1 py-0.5 rounded-full font-bold shrink-0">{r.promoOffer}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">Wolt · Bolt Food · Simulácia</p>
    </WidgetCard>
  )
}
