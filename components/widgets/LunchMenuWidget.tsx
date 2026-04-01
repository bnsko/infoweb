'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Dish { name: string; cal: number }
interface LunchMenu {
  restaurant: string; area: string; city: string; rating: number; priceRange: string
  cuisine: string; url: string; wolt: string | null; bolt: string | null
  soup: string; dishes: Dish[]; price: number; available: boolean; vegetarian: boolean
}
interface LunchData { menus: LunchMenu[]; isWeekday: boolean; dayName: string; timestamp: number }

const CITIES = ['Bratislava', 'Košice', 'Žilina', 'Nitra']
const CITY_EMOJI: Record<string, string> = { Bratislava: '🏙️', Košice: '🏰', Žilina: '🏔️', Nitra: '🌾' }

function StarRating({ r }: { r: number }) {
  return (
    <span className="text-[8px] text-amber-400 tabular-nums">
      {'★'.repeat(Math.floor(r))}{'☆'.repeat(5 - Math.floor(r))} {r.toFixed(1)}
    </span>
  )
}

function cuisineIcon(c: string) {
  const map: Record<string, string> = {
    Slovenská: '🇸🇰', Talianska: '🇮🇹', Japonská: '🇯🇵', Vietnamská: '🇻🇳', Thajská: '🇹🇭',
    Mexická: '🇲🇽', Indická: '🇮🇳', Francúzska: '🇫🇷', Čínska: '🇨🇳', Americká: '🇺🇸',
    Hamburgery: '🍔', Domáca: '🏠', Vegetariánska: '🌱', Zdravá: '🥗', Kaviareň: '☕',
    Stredoeurópska: '🍽️', Gruzínska: '🍖', Ryby: '🐟', 'Street Food': '🥙', Grill: '🔥',
  }
  return map[c] ?? '🍴'
}

export default function LunchMenuWidget() {
  const { data, loading, refetch } = useWidget<LunchData>('/api/lunchmenu', 60 * 60 * 1000)
  const [city, setCity] = useState('Bratislava')
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'price'>('default')
  const [filterVeg, setFilterVeg] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) return
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
  }, [])

  let menus = (data?.menus ?? []).filter(m => m.city === city)
  if (filterVeg) menus = menus.filter(m => m.vegetarian)
  if (sortBy === 'rating') menus = [...menus].sort((a, b) => b.rating - a.rating)
  if (sortBy === 'price') menus = [...menus].sort((a, b) => a.price - b.price)
  const availableCount = menus.filter(m => m.available).length

  return (
    <WidgetCard accent="orange" title="Obedové menú" icon="🍽️" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={6} /> : (
        <div className="space-y-2.5">
          {/* Day header */}
          <div className="flex items-center justify-between">
            <div className="text-[9px] text-slate-500">
              {data?.dayName}
              {!data?.isWeekday && <span className="ml-2 text-amber-400 font-bold">Víkend</span>}
            </div>
            <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/15 rounded-full px-2 py-0.5 font-bold">
              {availableCount} / {menus.length} otvorené
            </span>
          </div>

          {/* City + filter controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex gap-0.5">
              {CITIES.map(c => (
                <button key={c} onClick={() => setCity(c)}
                  className={`text-[8px] px-2 py-1 rounded-lg font-semibold border transition-all ${city === c ? 'bg-orange-500/15 text-orange-300 border-orange-500/20' : 'bg-white/[0.02] text-slate-500 border-white/5 hover:text-slate-300'}`}>
                  {CITY_EMOJI[c]} {c === 'Bratislava' ? 'BA' : c === 'Košice' ? 'KE' : c === 'Žilina' ? 'ZA' : 'NR'}
                </button>
              ))}
            </div>
            <div className="flex gap-0.5 ml-auto">
              <button onClick={() => setSortBy(sortBy === 'rating' ? 'default' : 'rating')}
                className={`text-[7px] px-1.5 py-1 rounded-md border transition-all ${sortBy === 'rating' ? 'bg-amber-500/15 text-amber-300 border-amber-500/20' : 'bg-white/[0.02] text-slate-600 border-white/5'}`}>
                ★ Hodnotenie
              </button>
              <button onClick={() => setSortBy(sortBy === 'price' ? 'default' : 'price')}
                className={`text-[7px] px-1.5 py-1 rounded-md border transition-all ${sortBy === 'price' ? 'bg-green-500/15 text-green-300 border-green-500/20' : 'bg-white/[0.02] text-slate-600 border-white/5'}`}>
                € Cena
              </button>
              <button onClick={() => setFilterVeg(!filterVeg)}
                className={`text-[7px] px-1.5 py-1 rounded-md border transition-all ${filterVeg ? 'bg-green-500/15 text-green-300 border-green-500/20' : 'bg-white/[0.02] text-slate-600 border-white/5'}`}>
                🌱
              </button>
            </div>
          </div>

          {/* Menu cards */}
          <div className="space-y-2 max-h-[480px] overflow-y-auto scrollbar-hide">
            {menus.length === 0 && (
              <div className="text-center py-8 text-[11px] text-slate-500">
                {filterVeg ? 'Žiadne vegetariánske menu' : `Žiadne menu pre ${city}`}
              </div>
            )}
            {menus.map((m, i) => (
              <div key={i} className={`rounded-xl border transition-all ${m.available ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-red-500/3 border-red-500/8 opacity-50'}`}>
                {/* Card header */}
                <div className="flex items-start gap-2 px-3 pt-2.5 pb-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-white">{m.restaurant}</span>
                      <span className="text-[7px] bg-white/5 text-slate-500 px-1.5 py-0.5 rounded-full">{cuisineIcon(m.cuisine)} {m.cuisine}</span>
                      {m.vegetarian && <span className="text-[7px] bg-green-500/10 text-green-300 px-1.5 py-0.5 rounded-full border border-green-500/15 font-bold">🌱 Veg</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] text-slate-500">📍 {m.area}</span>
                      <StarRating r={m.rating} />
                      <span className="text-[8px] text-slate-500">{m.priceRange}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[16px] font-black text-green-400">{m.price.toFixed(1)}€</span>
                  </div>
                </div>

                {/* Soup + dishes */}
                <div className="px-3 pb-2 space-y-1">
                  <div className="text-[9px] text-cyan-300 flex items-center gap-1">
                    <span>🥣</span><span className="truncate">{m.soup}</span>
                  </div>
                  {m.dishes.map((d, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <span className="text-[9px] text-slate-300 truncate flex-1">
                        <span className="text-slate-600 mr-1">{j === 0 ? 'A' : 'B'}.</span>{d.name}
                      </span>
                      <span className="text-[7px] text-slate-600 shrink-0 ml-2">{d.cal} kcal</span>
                    </div>
                  ))}
                </div>

                {/* Links footer */}
                <div className="flex items-center gap-1.5 px-3 pb-2 border-t border-white/5 pt-1.5">
                  <a href={m.url} target="_blank" rel="noopener noreferrer"
                    className="text-[8px] text-orange-400 hover:text-orange-300 transition-colors">
                    📍 Mapa →
                  </a>
                  {m.wolt && <a href={m.wolt} target="_blank" rel="noopener noreferrer"
                    className="text-[8px] bg-teal-600/15 text-teal-400 hover:bg-teal-600/25 px-1.5 py-0.5 rounded-md transition-colors font-bold border border-teal-500/15">
                    wolt
                  </a>}
                  {m.bolt && <a href={m.bolt} target="_blank" rel="noopener noreferrer"
                    className="text-[8px] bg-green-600/15 text-green-400 hover:bg-green-600/25 px-1.5 py-0.5 rounded-md transition-colors font-bold border border-green-500/15">
                    bolt
                  </a>}
                  {!m.available && <span className="text-[8px] text-red-400 font-bold ml-auto">❌ Vypredané</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2 text-right">Obeduj.sk · Google Maps · Wolt · Bolt · 1 hod.</p>
    </WidgetCard>
  )
}
