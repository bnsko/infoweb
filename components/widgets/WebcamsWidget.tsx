'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useState, useEffect, useCallback } from 'react'

interface Webcam {
  id: string
  name: string
  city: string
  image: string
  url: string
  region: string
}

interface WebcamData {
  webcams: Webcam[]
}

const REGION_LABELS: Record<string, { sk: string; color: string }> = {
  ba: { sk: 'Bratislava', color: 'bg-blue-500/15 text-blue-300' },
  tatry: { sk: 'Tatry', color: 'bg-emerald-500/15 text-emerald-300' },
  east: { sk: 'Východ', color: 'bg-amber-500/15 text-amber-300' },
  west: { sk: 'Západ', color: 'bg-violet-500/15 text-violet-300' },
}

export default function WebcamsWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<WebcamData>('/api/webcams', 30 * 1000)
  const [selected, setSelected] = useState<Webcam | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [regionFilter, setRegionFilter] = useState<string>('all')

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const iv = setInterval(() => {
      setRefreshKey(k => k + 1)
      refetch()
    }, 30 * 1000)
    return () => clearInterval(iv)
  }, [refetch])

  const cams = data?.webcams ?? []
  const filtered = regionFilter === 'all' ? cams : cams.filter(c => c.region === regionFilter)

  const imgSrc = useCallback((src: string) => {
    return src.includes('?') ? `${src}&_t=${refreshKey}` : `${src}?_t=${refreshKey}`
  }, [refreshKey])

  return (
    <WidgetCard accent="cyan" title={lang === 'sk' ? 'Webkamery SK' : 'Slovak Webcams'} icon="📷" onRefresh={refetch}
      badge={cams.length > 0 ? `${cams.length} kamier` : undefined}>
      {loading && !data && <SkeletonRows rows={4} />}
      {!loading && error && !data && <p className="text-xs text-slate-500">Chyba načítania</p>}
      {cams.length > 0 && (
        <>
          {/* Live indicator + region filter */}
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[9px] text-red-400 font-semibold">LIVE</span>
            <span className="text-[8px] text-slate-600">· 30s</span>
            <div className="ml-auto flex gap-1">
              <button onClick={() => setRegionFilter('all')}
                className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold transition-colors ${
                  regionFilter === 'all' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-500 hover:text-slate-300'
                }`}>Všetky</button>
              {Object.entries(REGION_LABELS).map(([key, val]) => (
                <button key={key} onClick={() => setRegionFilter(key)}
                  className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold transition-colors ${
                    regionFilter === key ? 'bg-sky-500/20 text-sky-300' : 'text-slate-500 hover:text-slate-300'
                  }`}>{val.sk}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(cam => {
              const reg = REGION_LABELS[cam.region]
              return (
                <button key={cam.id} onClick={() => setSelected(cam)}
                  className="rounded-lg overflow-hidden border border-white/5 hover:border-sky-500/30 transition-all group text-left relative">
                  <div className="relative aspect-video bg-black/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgSrc(cam.image)} alt={cam.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-1 left-1 right-1">
                      <p className="text-[9px] text-white font-medium leading-tight truncate">{cam.name}</p>
                      <p className="text-[7px] text-slate-400">{cam.city}</p>
                    </div>
                    {reg && (
                      <span className={`absolute top-1 right-1 text-[7px] px-1 py-0.5 rounded-full font-bold ${reg.color}`}>
                        {reg.sk}
                      </span>
                    )}
                    <span className="absolute top-1 left-1 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
             onClick={() => setSelected(null)}>
          <div className="bg-[#181a20] rounded-2xl overflow-hidden max-w-3xl w-full border border-white/10 shadow-2xl"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-50" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-sm font-bold text-white">{selected.name}</span>
                <span className="text-[9px] text-slate-500">{selected.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <a href={selected.url} target="_blank" rel="noopener noreferrer"
                   className="text-[10px] text-sky-400 hover:text-sky-300 px-2 py-1 rounded-lg bg-sky-500/10">
                  {lang === 'sk' ? 'Otvoriť' : 'Open'} ↗
                </a>
                <button onClick={() => setSelected(null)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc(selected.image)} alt={selected.name} className="w-full aspect-video object-cover" />
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
