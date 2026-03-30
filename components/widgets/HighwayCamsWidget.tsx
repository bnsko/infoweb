'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useState } from 'react'

interface Camera {
  id: string
  name: string
  location: string
  image: string
  road: string
  link?: string
}

interface CamData {
  cameras: Camera[]
  timestamp: number
}

export default function HighwayCamsWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<CamData>('/api/highwaycams', 5 * 60 * 1000)
  const [selected, setSelected] = useState<Camera | null>(null)

  const cameras = data?.cameras ?? []

  return (
    <WidgetCard accent="cyan" title={lang === 'sk' ? 'Diaľničné kamery' : 'Highway Cameras'} icon="🎥" onRefresh={refetch}>
      {loading && <SkeletonRows rows={3} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && cameras.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {cameras.slice(0, 9).map(cam => (
            <button key={cam.id} onClick={() => setSelected(cam)}
              className="rounded-lg overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all group text-left">
              <div className="relative aspect-video bg-black/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cam.image} alt={cam.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0.5 left-1 right-1">
                  <p className="text-[7px] text-white font-medium truncate">{cam.name}</p>
                </div>
                <span className="absolute top-0.5 right-0.5 text-[6px] px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">{cam.road}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#181a20] rounded-2xl overflow-hidden max-w-3xl w-full border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span>🎥</span>
                <span className="text-sm font-bold text-white">{selected.name}</span>
                <span className="text-[9px] text-slate-500">{selected.road}</span>
              </div>
              <div className="flex items-center gap-2">
                {selected.link && (
                  <a href={selected.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded-lg bg-cyan-500/10">Živý obraz ↗</a>
                )}
                <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white">✕</button>
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
