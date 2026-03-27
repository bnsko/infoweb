'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Webcam {
  id: string
  name: string
  city: string
  image: string
  url: string
  region: string
}

interface WebcamsData {
  webcams: Webcam[]
}

const FILTERS = [
  { key: 'all', sk: 'Všetky', en: 'All' },
  { key: 'ba', sk: 'BA', en: 'BA' },
  { key: 'tatry', sk: 'Tatry', en: 'Tatras' },
  { key: 'east', sk: 'Východ', en: 'East' },
  { key: 'west', sk: 'Západ', en: 'West' },
]

export default function WebcamsWidget() {
  const { data, loading, refetch } = useWidget<WebcamsData>('/api/webcams', 5 * 60 * 1000)
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(0)
  const { t, lang } = useLang()

  const cams = data?.webcams?.filter(c => filter === 'all' || c.region === filter) ?? []
  const cam = cams[active] ?? cams[0]

  return (
    <WidgetCard accent="cyan" className="h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="widget-title mb-0">
          <span>📹</span>
          <span>{t('webcams.title')}</span>
        </div>
      </div>

      {/* Region filter */}
      <div className="flex flex-wrap gap-1 mb-3">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setActive(0) }}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
              filter === f.key
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            {lang === 'sk' ? f.sk : f.en}
          </button>
        ))}
      </div>

      {loading && <SkeletonRows rows={4} />}

      {!loading && cam && (
        <>
          {/* Active cam image */}
          <div className="rounded-xl overflow-hidden bg-black/40 border border-white/5 mb-2 relative aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cam.image}
              alt={cam.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-white font-semibold">{cam.name}</span>
              </div>
              <span className="text-[9px] text-slate-300">{cam.city}</span>
            </div>
          </div>

          {/* Cam selector thumbnails */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {cams.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActive(i)}
                className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  i === active ? 'border-cyan-400 opacity-100' : 'border-white/10 opacity-50 hover:opacity-80'
                }`}
                style={{ width: 52, height: 36 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </button>
            ))}
          </div>
        </>
      )}

      {!loading && cams.length === 0 && (
        <p className="text-xs text-slate-500 py-4 text-center">{t('noData')}</p>
      )}
    </WidgetCard>
  )
}
