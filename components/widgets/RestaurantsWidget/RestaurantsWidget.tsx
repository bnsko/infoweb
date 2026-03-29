'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Restaurant {
  name: string; cuisine: string; rating: number; priceRange: string
  location: string; description: string; url: string; city: string
  tags?: string[]; distance?: number; photoUrl?: string
}

interface Data { restaurants: Restaurant[]; city: string; cityName: string }

// City centres (lat, lon) for nearest-city detection
const CITY_COORDS: Record<string, { lat: number; lon: number; label: string }> = {
  bratislava: { lat: 48.1486, lon: 17.1077, label: 'Bratislava' },
  kosice:     { lat: 48.7163, lon: 21.2611, label: 'Košice' },
  zilina:     { lat: 49.2231, lon: 18.7394, label: 'Žilina' },
  presov:     { lat: 49.0017, lon: 21.2391, label: 'Prešov' },
  nitra:      { lat: 48.3069, lon: 18.0869, label: 'Nitra' },
  bystrica:   { lat: 48.7356, lon: 19.1503, label: 'B. Bystrica' },
  trnava:     { lat: 48.3774, lon: 17.5872, label: 'Trnava' },
  trencin:    { lat: 48.8947, lon: 18.0435, label: 'Trenčín' },
}

function nearestCity(lat: number, lon: number): string {
  let best = 'bratislava'
  let bestDist = Infinity
  for (const [key, c] of Object.entries(CITY_COORDS)) {
    const d = Math.sqrt((lat - c.lat) ** 2 + (lon - c.lon) ** 2)
    if (d < bestDist) { bestDist = d; best = key }
  }
  return best
}

const CITIES = [
  { key: 'bratislava', label: 'Bratislava' },
  { key: 'kosice', label: 'Košice' },
  { key: 'zilina', label: 'Žilina' },
  { key: 'presov', label: 'Prešov' },
  { key: 'nitra', label: 'Nitra' },
  { key: 'bystrica', label: 'B. Bystrica' },
  { key: 'trnava', label: 'Trnava' },
  { key: 'trencin', label: 'Trenčín' },
]

const PRICE_FILTERS = [
  { key: 'all', label: 'Všetky' },
  { key: '€', label: '€' },
  { key: '€€', label: '€€' },
  { key: '€€€', label: '€€€' },
]

const PRICE_RANK: Record<string, number> = { '€': 1, '€€': 2, '€€€': 3 }

type SortKey = 'rating' | 'price' | 'distance'

function ratingStars(rating: number): string {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5 ? '½' : ''
  return '★'.repeat(full) + half
}

export default function RestaurantsWidget() {
  const [city, setCity] = useState('bratislava')
  const [price, setPrice] = useState('all')
  const [diet, setDiet] = useState('all')
  const [sortBy, setSortBy] = useState<SortKey>('rating')
  const [geoStatus, setGeoStatus] = useState<'idle' | 'detecting' | 'found' | 'denied'>('idle')
  const { data, loading, refetch } = useWidget<Data>(`/api/restaurants?city=${city}&price=${encodeURIComponent(price)}&diet=${diet}`, 60 * 60 * 1000)
  const { t, lang } = useLang()

  // Auto-detect on first load
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return
    setGeoStatus('detecting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = nearestCity(pos.coords.latitude, pos.coords.longitude)
        setCity(detected)
        setGeoStatus('found')
      },
      () => setGeoStatus('denied'),
      { timeout: 5000, maximumAge: 5 * 60 * 1000 }
    )
  }, [])

  const sortedRestaurants = [...(data?.restaurants ?? [])].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating
    if (sortBy === 'price') return (PRICE_RANK[a.priceRange] ?? 2) - (PRICE_RANK[b.priceRange] ?? 2)
    if (sortBy === 'distance') return (a.distance ?? 99) - (b.distance ?? 99)
    return 0
  })

  const currentCityLabel = CITY_COORDS[city]?.label ?? city

  return (
    <WidgetCard accent="orange" className="h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="widget-title mb-0">
          <span>🍽️</span>
          <span>{t('restaurants.title')}</span>
        </div>
        {geoStatus === 'detecting' && <span className="text-[10px] text-slate-500 animate-pulse">📍 Zisťujem polohu…</span>}
        {geoStatus === 'found' && <span className="text-[10px] text-blue-400">📍 {currentCityLabel}</span>}
        {geoStatus === 'denied' && (
          <button onClick={() => { setGeoStatus('detecting'); navigator.geolocation?.getCurrentPosition(p => { setCity(nearestCity(p.coords.latitude, p.coords.longitude)); setGeoStatus('found') }, () => setGeoStatus('denied')) }}
            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">📍 Detekuj polohu</button>
        )}
        {geoStatus === 'idle' && typeof window !== 'undefined' && navigator.geolocation && (
          <button onClick={() => { setGeoStatus('detecting'); navigator.geolocation.getCurrentPosition(p => { setCity(nearestCity(p.coords.latitude, p.coords.longitude)); setGeoStatus('found') }, () => setGeoStatus('denied'), { timeout: 5000 }) }}
            className="text-[10px] text-slate-500 hover:text-blue-400 transition-colors border border-white/8 rounded-lg px-2 py-0.5">
            📍 {lang === 'sk' ? 'Moja poloha' : 'My location'}
          </button>
        )}
      </div>
      {/* City pills */}
      <div className="flex flex-wrap gap-1 mb-2">
        {CITIES.map(c => (
          <button
            key={c.key}
            onClick={() => { setCity(c.key); setGeoStatus('idle') }}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
              city === c.key
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      {/* Price filter */}
      <div className="flex items-center gap-1 mb-2">
        {PRICE_FILTERS.map(p => (
          <button
            key={p.key}
            onClick={() => setPrice(p.key)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
              price === p.key
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-600 hover:text-slate-400 border border-transparent'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {/* Diet filter */}
      <div className="flex items-center gap-1 mb-2">
        <button onClick={() => setDiet('all')}
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${diet === 'all' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-600 hover:text-slate-400 border border-transparent'}`}>
          🍴 {lang === 'sk' ? 'Všetky' : 'All'}
        </button>
        <button onClick={() => setDiet('vegetarian')}
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${diet === 'vegetarian' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-600 hover:text-slate-400 border border-transparent'}`}>
          🥬 Vegetarian
        </button>
        <button onClick={() => setDiet('vegan')}
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${diet === 'vegan' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-600 hover:text-slate-400 border border-transparent'}`}>
          🌱 Vegan
        </button>
      </div>
      {/* Sort controls */}
      <div className="flex items-center gap-1 mb-3">
        <span className="text-[9px] text-slate-600 uppercase font-semibold mr-1">{lang === 'sk' ? 'Zoradiť' : 'Sort'}:</span>
        {([['rating', '⭐ ' + (lang === 'sk' ? 'Hodnotenie' : 'Rating')], ['price', '€ ' + (lang === 'sk' ? 'Cena' : 'Price')], ['distance', '📍 ' + (lang === 'sk' ? 'Vzdialenosť' : 'Distance')]] as [SortKey, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setSortBy(key)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${sortBy === key ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-slate-600 hover:text-slate-400 border border-transparent'}`}>
            {label}
          </button>
        ))}
      </div>
      {loading && <SkeletonRows rows={6} />}
      {!loading && data && sortedRestaurants.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto scrollbar-hide">
          {sortedRestaurants.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-white/5 hover:border-orange-500/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all group overflow-hidden"
            >
              {/* Food image */}
              {r.photoUrl && (
                <div className="relative h-28 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.photoUrl} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-amber-400 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
                      ★ {r.rating}
                    </span>
                    <span className="text-[10px] font-bold text-white/80 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded">
                      {r.priceRange}
                    </span>
                  </div>
                  {r.tags?.includes('vegan') && (
                    <span className="absolute top-1.5 right-2 text-[9px] bg-green-500/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-full font-bold">🌱 Vegan</span>
                  )}
                </div>
              )}
              {/* Info */}
              <div className="p-2.5">
                <p className="text-[12px] text-slate-200 group-hover:text-white font-bold line-clamp-1">{r.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{r.cuisine} · {r.location}</p>
                <p className="text-[10px] text-slate-600 line-clamp-1 mt-0.5">{r.description}</p>
                {r.distance != null && (
                  <p className="text-[9px] text-slate-600 mt-1">📍 {r.distance} km od centra</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
      {!loading && data && sortedRestaurants.length === 0 && (
        <p className="text-xs text-slate-500 py-4 text-center">{t('noData')}</p>
      )}
      <p className="text-[10px] text-slate-600 mt-2">{lang === 'sk' ? 'Odporúčania' : 'Recommendations'} · {data?.cityName ?? 'Bratislava'}</p>
    </WidgetCard>
  )
}
