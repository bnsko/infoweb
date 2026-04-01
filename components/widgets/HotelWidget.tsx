'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Hotel {
  name: string; stars: number; area: string; pricePerNight: number; rating: number
  reviews: number; availability: boolean; freeCancel: boolean; deal: string | null
  amenities: string[]; bookingUrl: string
}
interface HotelData { hotels: Hotel[]; city: string; timestamp: number }

const STAR_FILTERS = [0, 2, 3, 4, 5]

export default function HotelWidget() {
  const { data, loading, refetch } = useWidget<HotelData>('/api/hotels', 60 * 60 * 1000)
  const [minStars, setMinStars] = useState(0)
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('price')

  const hotels = (data?.hotels ?? [])
    .filter(h => minStars === 0 || h.stars >= minStars)
    .sort((a, b) => sortBy === 'price' ? a.pricePerNight - b.pricePerNight : b.rating - a.rating)

  const cheapest = hotels.filter(h => h.availability)[0]
  const topRated = hotels.filter(h => h.availability).sort((a, b) => b.rating - a.rating)[0]

  return (
    <WidgetCard accent="cyan" title="Hotely Bratislava" icon="🏨" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={6} /> : (
        <div className="space-y-3">
          {/* Quick stats */}
          {cheapest && topRated && (
            <div className="grid grid-cols-2 gap-2">
              <a href={cheapest.bookingUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-0.5 px-3 py-2 rounded-xl bg-green-500/5 border border-green-500/10 hover:bg-green-500/8 transition-colors">
                <span className="text-[7px] text-slate-500 uppercase tracking-wider">💰 Najlacnejší</span>
                <span className="text-[11px] font-bold text-white truncate">{cheapest.name}</span>
                <span className="text-[13px] font-bold text-green-400">{cheapest.pricePerNight} €<span className="text-[8px] text-slate-500 font-normal">/noc</span></span>
              </a>
              <a href={topRated.bookingUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-0.5 px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/8 transition-colors">
                <span className="text-[7px] text-slate-500 uppercase tracking-wider">⭐ Najlepší</span>
                <span className="text-[11px] font-bold text-white truncate">{topRated.name}</span>
                <span className="text-[13px] font-bold text-amber-400">{topRated.rating}<span className="text-[8px] text-slate-500 font-normal">/10 · {topRated.reviews.toLocaleString('sk-SK')} rec.</span></span>
              </a>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {STAR_FILTERS.map(s => (
                <button key={s} onClick={() => setMinStars(s)} className={`text-[8px] px-2 py-0.5 rounded-full border transition-all ${minStars === s ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20' : 'bg-white/[0.02] text-slate-500 border-white/5 hover:text-slate-300'}`}>
                  {s === 0 ? 'Všetky' : `${s}★+`}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setSortBy('price')} className={`text-[8px] px-2 py-0.5 rounded-full border transition-all ${sortBy === 'price' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20' : 'bg-white/[0.02] text-slate-500 border-white/5'}`}>💰 Cena</button>
              <button onClick={() => setSortBy('rating')} className={`text-[8px] px-2 py-0.5 rounded-full border transition-all ${sortBy === 'rating' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20' : 'bg-white/[0.02] text-slate-500 border-white/5'}`}>⭐ Rating</button>
            </div>
          </div>

          {/* Hotel list */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto scrollbar-hide">
            {hotels.map((h, i) => (
              <a key={i} href={h.bookingUrl} target="_blank" rel="noopener noreferrer" className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-all hover:scale-[1.01] ${h.availability ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-red-500/5 border-red-500/8 opacity-50'}`}>
                {/* Stars + rating */}
                <div className="shrink-0 text-center min-w-[36px]">
                  <div className="text-[14px] font-bold text-cyan-400">{h.rating}</div>
                  <div className="text-[7px] text-slate-500">/10</div>
                  <div className="text-[8px] text-yellow-400 mt-0.5">{'★'.repeat(Math.min(h.stars, 5))}</div>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-white">{h.name}</span>
                    {h.deal && <span className="text-[7px] bg-red-500/12 text-red-300 px-1.5 py-0.5 rounded-full font-bold border border-red-500/15">{h.deal}</span>}
                  </div>
                  <div className="text-[8px] text-slate-500 mb-1">📍 {h.area}</div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {h.amenities.slice(0, 3).map((a, j) => (
                      <span key={j} className="text-[7px] bg-white/[0.03] text-slate-400 px-1.5 py-0.5 rounded border border-white/5">{a}</span>
                    ))}
                    {h.freeCancel && <span className="text-[7px] bg-green-500/8 text-green-300 px-1.5 py-0.5 rounded border border-green-500/12">✓ Zrušenie zadarmo</span>}
                  </div>
                </div>
                {/* Price + link */}
                <div className="text-right shrink-0">
                  <div className="text-[16px] font-bold text-green-400">{h.pricePerNight} €</div>
                  <div className="text-[7px] text-slate-600">za noc</div>
                  <div className="text-[7px] text-slate-600 mt-0.5">{h.reviews.toLocaleString('sk-SK')} rec.</div>
                  <div className="text-[7px] text-cyan-400 mt-1 font-semibold">Booking →</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">Booking.com · Expedia · 1 hod.</p>
    </WidgetCard>
  )
}

