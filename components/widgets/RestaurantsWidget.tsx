'use client'

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
}

interface Data {
  restaurants: Restaurant[]
}

function ratingStars(rating: number): string {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5 ? '½' : ''
  return '★'.repeat(full) + half
}

export default function RestaurantsWidget() {
  const { data, loading, refetch } = useWidget<Data>('/api/restaurants', 60 * 60 * 1000)
  const { t } = useLang()

  return (
    <WidgetCard accent="orange" className="h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="widget-title mb-0">
          <span>🍽️</span>
          <span>{t('restaurants.title')}</span>
        </div>
      </div>
      {loading && <SkeletonRows rows={6} />}
      {!loading && data && (
        <div className="space-y-1 max-h-[420px] overflow-y-auto scrollbar-hide">
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
      <p className="text-[10px] text-slate-600 mt-2">Odporúčania · Bratislava</p>
    </WidgetCard>
  )
}
