'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Restaurant {
  name: string
  cuisine: string
  rating: number
  priceRange: string
  location: string
  description: string
  url: string
  city: string
}

interface Data {
  restaurants: Restaurant[]
  city: string
  cityName: string
}

const CITIES = [
  { key: 'bratislava', label: 'BA' },
  { key: 'kosice', label: 'KE' },
  { key: 'zilina', label: 'ZA' },
  { key: 'presov', label: 'PO' },
  { key: 'nitra', label: 'NR' },
  { key: 'bystrica', label: 'BB' },
  { key: 'trnava', label: 'TT' },
  { key: 'trencin', label: 'TN' },
]

const PRICE_FILTERS = [
  { key: 'all', label: 'Všetky' },
  { key: '€', label: '€' },
  { key: '€€', label: '€€' },
  { key: '€€€', label: '€€€' },
]

function ratingStars(rating: number): string {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5 ? '½' : ''
  return '★'.repeat(full) + half
}

export default function RestaurantsWidget() {
  const [city, setCity] = useState('bratislava')
  const [price, setPrice] = useState('all')
  const { data, loading, refetch } = useWidget<Data>(`/api/restaurants?city=${city}&price=${encodeURIComponent(price)}`, 60 * 60 * 1000)
  const { t, lang } = useLang()

  return (
    <WidgetCard accent="orange" className="h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="widget-title mb-0">
          <span>🍽️</span>
          <span>{t('restaurants.title')}</span>
        </div>
      </div>
      {/* City pills */}
      <div className="flex flex-wrap gap-1 mb-2">
        {CITIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCity(c.key)}
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
      <div className="flex items-center gap-1 mb-3">
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
      {loading && <SkeletonRows rows={6} />}
      {!loading && data && data.restaurants.length > 0 && (
        <div className="space-y-1 max-h-[360px] overflow-y-auto scrollbar-hide">
          {data.restaurants.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 hover:bg-white/3 rounded-lg p-2 transition-colors group"
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm font-bold text-orange-300">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-200 group-hover:text-white font-semibold line-clamp-1">{r.name}</span>
                  <span className="text-[10px] text-slate-600 shrink-0">{r.priceRange}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-amber-400">{ratingStars(r.rating)} {r.rating}</span>
                  <span className="text-[10px] text-slate-600">·</span>
                  <span className="text-[10px] text-slate-500">{r.cuisine}</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{r.description}</p>
              </div>
            </a>
          ))}
        </div>
      )}
      {!loading && data && data.restaurants.length === 0 && (
        <p className="text-xs text-slate-500 py-4 text-center">{t('noData')}</p>
      )}
      <p className="text-[10px] text-slate-600 mt-2">{lang === 'sk' ? 'Odporúčania' : 'Recommendations'} · {data?.cityName ?? 'Bratislava'}</p>
    </WidgetCard>
  )
}
