'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Dish { name: string; cal: number }
interface LunchMenu {
  restaurant: string; area: string; city: string; rating: number; priceRange: string; url: string
  soup: string; dishes: Dish[]; price: number; available: boolean; vegetarian: boolean
}
interface LunchData { menus: LunchMenu[]; isWeekday: boolean; dayName: string; timestamp: number }

const CITIES = ['Bratislava', 'Košice', 'Žilina', 'Nitra']

export default function LunchMenuWidget() {
  const { data, loading, refetch } = useWidget<LunchData>('/api/lunchmenu', 60 * 60 * 1000)
  const [city, setCity] = useState('Bratislava')

  // Auto-detect city based on rough geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords
        const cityCoords = [
          { city: 'Bratislava', lat: 48.148, lng: 17.107 },
          { city: 'Košice', lat: 48.721, lng: 21.261 },
          { city: 'Žilina', lat: 49.221, lng: 18.740 },
          { city: 'Nitra', lat: 48.307, lng: 18.086 },
        ]
        let nearest = 'Bratislava'
        let minDist = Infinity
        for (const c of cityCoords) {
          const d = Math.sqrt((c.lat - latitude) ** 2 + (c.lng - longitude) ** 2)
          if (d < minDist) { minDist = d; nearest = c.city }
        }
        setCity(nearest)
      }, () => {}, { timeout: 4000 })
    }
  }, [])

  const menus = (data?.menus ?? []).filter(m => m.city === city)
  const availableCount = menus.filter(m => m.available).length

  return (
    <WidgetCard accent="orange" title="Obedové menú" icon="🍽️" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={6} /> : (
        <div className="space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-[9px] text-slate-500">
              {data?.dayName} · <span className="text-green-400 font-semibold">{availableCount} podnikov</span>
              {!data?.isWeekday && <span className="ml-2 text-amber-400 font-bold">Víkend</span>}
            </div>
          </div>

          {/* City tabs */}
          <div className="flex gap-1">
            {CITIES.map(c => (
              <button key={c} onClick={() => setCity(c)} className={`text-[8px] px-2 py-1 rounded-full font-semibold border transition-all ${city === c ? 'bg-orange-500/15 text-orange-300 border-orange-500/20' : 'bg-white/[0.02] text-slate-500 border-white/5 hover:text-slate-300'}`}>
                {c === 'Bratislava' ? '🏙️ BA' : c === 'Košice' ? '🏰 KE' : c === 'Žilina' ? '🏔️ ZA' : '🌾 NR'}
              </button>
            ))}
          </div>

          {/* Menus */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-hide">
            {menus.length === 0 && <div className="text-center py-6 text-[11px] text-slate-500">Žiadne menu pre {city}</div>}
            {menus.map((m, i) => (
              <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className={`block px-3 py-2.5 rounded-xl border transition-all hover:scale-[1.01] ${m.available ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-red-500/5 border-red-500/8 opacity-60'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white">{m.restaurant}</span>
                    <span className="text-[8px] text-slate-500">{m.area}</span>
                    {m.vegetarian && <span className="text-[7px] bg-green-500/12 text-green-300 px-1.5 py-0.5 rounded-full font-bold border border-green-500/15">🌱</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] text-amber-400">{'★'.repeat(Math.floor(m.rating))}</span>
                    <span className="text-[8px] text-slate-500">{m.priceRange}</span>
                    <span className="text-[14px] font-bold text-green-400">{m.price.toFixed(1)} €</span>
                  </div>
                </div>
                <div className="text-[9px] text-cyan-300 mb-1.5">🥣 {m.soup}</div>
                <div className="space-y-0.5">
                  {m.dishes.map((d, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-300">{j === 0 ? '🅰' : '🅱'} {d.name}</span>
                      <span className="text-[7px] text-slate-600 shrink-0 ml-2">{d.cal} kcal</span>
                    </div>
                  ))}
                </div>
                {!m.available && <div className="text-[8px] text-red-400 font-bold mt-1.5">❌ Vypredané</div>}
                <div className="flex items-center justify-end mt-1">
                  <span className="text-[7px] text-orange-400/60">Zobraziť →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">Obeduj.sk · Zomato · Google Maps · 1 hod.</p>
    </WidgetCard>
  )
}

