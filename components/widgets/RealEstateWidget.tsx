'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Listing {
  title: string
  price: string
  location: string
  rooms: string
  area: string
  url: string
  source: string
}

interface RealEstateData {
  listings: Listing[]
  region: string
  regionName: string
  regions: { key: string; name: string }[]
}

const REGION_PILLS = [
  { key: 'bratislava', label: 'BA' },
  { key: 'kosice', label: 'KE' },
  { key: 'zilina', label: 'ZA' },
  { key: 'presov', label: 'PO' },
  { key: 'nitra', label: 'NR' },
  { key: 'banska-bystrica', label: 'BB' },
  { key: 'trnava', label: 'TT' },
  { key: 'trencin', label: 'TN' },
]

export default function RealEstateWidget() {
  const [region, setRegion] = useState('bratislava')
  const { t } = useLang()
  const { data, loading, error, refetch } = useWidget<RealEstateData>(
    `/api/realestate?region=${region}`,
    30 * 60 * 1000
  )

  return (
    <WidgetCard accent="green" className="h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="widget-title mb-0">
          <span>🏠</span>
          <span>{t('realestate.title')}</span>
        </div>
      </div>
      {/* Region pills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {REGION_PILLS.map(r => (
          <button
            key={r.key}
            onClick={() => setRegion(r.key)}
            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
              region === r.key
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      {loading && <SkeletonRows rows={6} cols={2} />}
      {!loading && (error || !data) && <p className="text-xs text-slate-500 py-4">{t('error')}</p>}
      {!loading && data && (
        <>
          <div className="space-y-1 max-h-[360px] overflow-y-auto scrollbar-hide">
            {data.listings.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:bg-white/3 rounded-lg p-2 transition-colors group"
              >
                <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
                  🏠
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-200 group-hover:text-white leading-snug line-clamp-1 font-medium">
                    {l.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold text-emerald-400">{l.price}</span>
                    {l.area && <span className="text-[10px] text-slate-500">{l.area}</span>}
                    {l.rooms && <span className="text-[10px] text-slate-600">{l.rooms} {t('realestate.rooms')}</span>}
                  </div>
                  <span className="text-[10px] text-slate-500">{l.location}</span>
                </div>
              </a>
            ))}
          </div>
          <p className="text-[10px] text-slate-600 mt-2">nehnutelnosti.sk · {data.regionName}</p>
        </>
      )}
    </WidgetCard>
  )
}
