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
  photo?: string
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

const TYPE_PILLS = [
  { key: 'all', sk: 'Všetky', en: 'All', icon: '🏘️' },
  { key: '1-izb', sk: '1-izb', en: '1-room', icon: '🛏️' },
  { key: '2-izb', sk: '2-izb', en: '2-room', icon: '🏠' },
  { key: '3-izb', sk: '3-izb', en: '3-room', icon: '🏡' },
  { key: '4-izb', sk: '4-izb', en: '4-room', icon: '🏰' },
  { key: 'garsonka', sk: 'Garsónka', en: 'Studio', icon: '📦' },
  { key: 'garaz', sk: 'Garáž', en: 'Garage', icon: '🚗' },
]

const TYPE_ICON_MAP: Record<string, string> = {
  '1-izbový byt': '🛏️',
  '2-izbový byt': '🏠',
  '3-izbový byt': '🏡',
  '4-izbový byt': '🏰',
  'Garsónka': '📦',
  'Garáž': '🚗',
}

export default function RealEstateWidget() {
  const [region, setRegion] = useState('bratislava')
  const [propertyType, setPropertyType] = useState('all')
  const { t, lang } = useLang()
  const { data, loading, error, refetch } = useWidget<RealEstateData>(
    `/api/realestate?region=${region}&type=${propertyType}`,
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
      <div className="flex flex-wrap gap-1 mb-2">
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
      {/* Property type pills */}
      <div className="flex flex-wrap gap-1 mb-3">
        {TYPE_PILLS.map(tp => (
          <button
            key={tp.key}
            onClick={() => setPropertyType(tp.key)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
              propertyType === tp.key
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'text-slate-600 hover:text-slate-400 border border-transparent'
            }`}
          >
            {lang === 'sk' ? tp.sk : tp.en}
          </button>
        ))}
      </div>
      {loading && <SkeletonRows rows={6} cols={2} />}
      {!loading && (error || !data) && <p className="text-xs text-slate-500 py-4">{t('error')}</p>}
      {!loading && data && (
        <>
          <div className="space-y-1 max-h-[360px] overflow-y-auto scrollbar-hide">
            {data.listings.map((l, i) => {
              const typeIcon = TYPE_ICON_MAP[l.title.replace(' na predaj', '')] ?? '🏠'
              return (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:bg-white/3 rounded-lg p-2 transition-colors group"
              >
                {l.photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={l.photo} alt={l.title} className="flex-shrink-0 w-16 h-12 rounded-lg object-cover border border-white/10" />
                ) : (
                  <div className="flex-shrink-0 w-16 h-12 flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-lg">
                    {typeIcon}
                  </div>
                )}
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
              )
            })}
          </div>
          <p className="text-[10px] text-slate-600 mt-2">nehnutelnosti.sk · {data.regionName}</p>
        </>
      )}
    </WidgetCard>
  )
}
