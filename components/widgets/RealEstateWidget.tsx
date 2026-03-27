'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Listing {
  title: string
  price: string
  location: string
  rooms: string
  area: string
  url: string
}

interface RealEstateData {
  listings: Listing[]
  fallback?: boolean
}

export default function RealEstateWidget() {
  const { data, loading, error, refetch } = useWidget<RealEstateData>('/api/realestate', 30 * 60 * 1000)

  return (
    <WidgetCard accent="green" title="Nehnuteľnosti · Bratislava" icon="🏠" className="h-full" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} cols={2} />}
      {!loading && (error || !data) && <WidgetError />}
      {!loading && data && (
        <>
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto scrollbar-hide">
            {data.listings.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:bg-white/3 rounded-lg p-2 transition-colors group"
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-lg">🏠</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-200 group-hover:text-white leading-snug line-clamp-1 transition-colors font-medium">
                    {l.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px] font-bold text-emerald-400">{l.price}</span>
                    {l.area && <span className="text-[10px] text-slate-500">{l.area}</span>}
                  </div>
                  <span className="text-[10px] text-slate-500">{l.location}</span>
                </div>
              </a>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-2">
            {data.fallback ? 'Ukážkové dáta' : 'Sreality.cz'} · obnova 30 min
          </p>
        </>
      )}
    </WidgetCard>
  )
}
