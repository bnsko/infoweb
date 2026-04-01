'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Dish { name: string; cal: number }
interface LunchMenu {
  restaurant: string; area: string; rating: number; priceRange: string
  soup: string; dishes: Dish[]; price: number; available: boolean; vegetarian: boolean
}
interface LunchData { menus: LunchMenu[]; isWeekday: boolean; dayName: string; timestamp: number }

export default function LunchMenuWidget() {
  const { data, loading, refetch } = useWidget<LunchData>('/api/lunchmenu', 60 * 60 * 1000)

  return (
    <WidgetCard accent="orange" title="Obedové menú" icon="🍽️" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} />}
      {!loading && data && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[9px] text-slate-500">
            <span>{data.dayName}</span>
            {!data.isWeekday && <span className="text-amber-400 font-bold">Víkend — obmedzené menu</span>}
          </div>
          {data.menus.map((m, i) => (
            <div key={i} className={`px-3 py-2.5 rounded-xl border transition-colors ${m.available ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-red-500/5 border-red-500/10 opacity-60'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-[11px] font-bold text-white">{m.restaurant}</span>
                  <span className="text-[8px] text-slate-500 ml-1.5">{m.area}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {m.vegetarian && <span className="text-[7px] bg-green-500/15 text-green-300 px-1.5 py-0.5 rounded-full font-bold">🌱</span>}
                  <span className="text-[8px] text-amber-400">{'⭐'.repeat(Math.floor(m.rating))}</span>
                  <span className="text-[13px] font-bold text-green-400">{m.price.toFixed(1)} €</span>
                </div>
              </div>
              <div className="text-[9px] text-cyan-300 mb-1">🥣 {m.soup}</div>
              {m.dishes.map((d, j) => (
                <div key={j} className="flex items-center justify-between text-[9px]">
                  <span className="text-slate-300">{j === 0 ? '🅰️' : '🅱️'} {d.name}</span>
                  <span className="text-[7px] text-slate-600">{d.cal} kcal</span>
                </div>
              ))}
              {!m.available && <div className="text-[8px] text-red-400 font-bold mt-1">❌ Vypredané</div>}
            </div>
          ))}
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">Simulácia · Denne</p>
    </WidgetCard>
  )
}
