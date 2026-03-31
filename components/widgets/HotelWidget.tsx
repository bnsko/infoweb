'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Hotel {
  name: string; stars: number; area: string; pricePerNight: number; rating: number
  reviews: number; availability: boolean; freeCancel: boolean; deal: string | null; amenities: string[]
}
interface HotelData { hotels: Hotel[]; city: string; timestamp: number }

export default function HotelWidget() {
  const { data, loading, refetch } = useWidget<HotelData>('/api/hotels', 60 * 60 * 1000)

  return (
    <WidgetCard accent="cyan" title="Hotely BA – najlepšie ceny" icon="🏨" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} />}
      {!loading && data && (
        <div className="space-y-1">
          {data.hotels.slice(0, 8).map((h, i) => (
            <div key={i} className={`flex items-start gap-2 px-2 py-2 rounded-xl border transition ${h.availability ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-red-500/5 border-red-500/10 opacity-50'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-white">{h.name}</span>
                  <span className="text-[8px] text-yellow-400">{'★'.repeat(h.stars)}</span>
                </div>
                <div className="text-[8px] text-slate-500 mt-0.5">📍 {h.area}</div>
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  {h.amenities.slice(0, 3).map((a, j) => (
                    <span key={j} className="text-[7px] bg-white/[0.03] text-slate-400 px-1 py-0.5 rounded">{a}</span>
                  ))}
                  {h.freeCancel && <span className="text-[7px] bg-green-500/10 text-green-300 px-1 py-0.5 rounded">Zrušenie zadarmo</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[15px] font-bold text-green-400">{h.pricePerNight} €</div>
                <div className="text-[7px] text-slate-600">za noc</div>
                <div className="text-[9px] text-cyan-400 font-bold mt-0.5">{h.rating}/10</div>
                <div className="text-[7px] text-slate-600">{h.reviews.toLocaleString('sk-SK')} rec.</div>
                {h.deal && <span className="text-[7px] bg-red-500/15 text-red-300 px-1 py-0.5 rounded-full font-bold">{h.deal}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">Booking · Simulácia</p>
    </WidgetCard>
  )
}
