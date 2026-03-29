'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useState } from 'react'

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
  const { data, loading, error, refetch } = useWidget<WebcamData>('/api/webcams', 5 * 60 * 1000)
  const [selected, setSelected] = useState<Webcam | null>(null)

  const cams = data?.webcams ?? []

  return (
    <WidgetCard
      accent="cyan"
      title={lang === 'sk' ? 'Webkamery SK' : 'Slovak Webcams'}
      icon="📷"
      onRefresh={refetch}
    >
      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && cams.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {cams.map(cam => {
            const reg = REGION_LABELS[cam.region]
            return (
              <button
                key={cam.id}
                onClick={() => setSelected(cam)}
                className="rounded-lg overflow-hidden border border-white/5 hover:border-sky-500/30 transition-all group text-left"
              >
                <div className="relative aspect-video bg-black/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cam.image}
                    alt={cam.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-1 left-1 right-1">
                    <p className="text-[9px] text-white font-medium leading-tight truncate">{cam.name}</p>
                  </div>
                  {reg && (
                    <span className={`absolute top-1 right-1 text-[7px] px-1 py-0.5 rounded-full font-bold ${reg.color}`}>
                      {reg.sk}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Full-screen modal */}
      {selected && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
             onClick={() => setSelected(null)}>
          <div className="bg-[#181a20] rounded-2xl overflow-hidden max-w-3xl w-full border border-white/10 shadow-2xl"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-base">📷</span>
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
            <img src={selected.image} alt={selected.name} className="w-full aspect-video object-cover" />
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
