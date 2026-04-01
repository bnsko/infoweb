'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useState } from 'react'

interface Chalet {
  name: string
  mountain: string
  altitude: number
  capacity: number
  isOpen: boolean
  openSeason: string
  phone: string
  lat: number
  lng: number
  rating: number
}

interface SkiLift {
  name: string
  resort: string
  type: string
  isRunning: boolean
  snowDepthCm: number
  status: string
}

interface TourismData {
  chalets: Chalet[]
  skiLifts: SkiLift[]
  season: string
  updatedAt: string
}

function Stars({ n }: { n: number }) {
  return <span className="text-yellow-400 text-[10px]">{'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}</span>
}

export default function TourismWidget() {
  const { data, loading, refetch } = useWidget<TourismData>('/api/tourism', 3600 * 1000)
  const [tab, setTab] = useState<'chalets' | 'lifts'>('chalets')

  return (
    <WidgetCard accent="green" title="Turizmus & Lyžovačka" icon="⛰️" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {(['chalets', 'lifts'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-2.5 py-0.5 rounded text-[10px] border transition-colors ${tab === t ? 'bg-green-500/20 border-green-500/40 text-green-300' : 'border-slate-600 text-slate-500 hover:text-slate-300'}`}>
                  {t === 'chalets' ? '🏠 Chaty' : '🎿 Vleky'}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 bg-slate-700/40 px-2 py-0.5 rounded">{data.season}</span>
          </div>

          {tab === 'chalets' ? (
            <div className="space-y-1.5">
              {data.chalets.map(c => (
                <div key={c.name} className="flex items-start gap-2 bg-slate-700/30 rounded-lg p-2.5">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${c.isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] text-slate-200 font-medium">{c.name}</span>
                      <Stars n={c.rating} />
                    </div>
                    <div className="text-[10px] text-slate-500">{c.mountain} · {c.altitude}m n.m. · {c.isOpen ? 'Otvorené' : 'Zatvorené'}</div>
                  </div>
                  <a href={`https://www.google.com/maps?q=${c.lat},${c.lng}`} target="_blank" rel="noopener noreferrer"
                    className="text-[9px] text-slate-600 hover:text-green-400 shrink-0">maps ↗</a>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {data.skiLifts.map(l => (
                <div key={l.name} className="flex items-start gap-2 bg-slate-700/30 rounded-lg p-2.5">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${l.isRunning ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] text-slate-200 font-medium">{l.name}</span>
                    <div className="text-[10px] text-slate-500">{l.resort} · {l.type}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-blue-400 font-medium">{l.snowDepthCm} cm</div>
                    <div className="text-[9px] text-slate-500">{l.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-[9px] text-slate-600 text-right">KST SR · ski-info.sk</div>
        </div>
      )}
    </WidgetCard>
  )
}
