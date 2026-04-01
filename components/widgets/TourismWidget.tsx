'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useState } from 'react'

interface Chalet {
  name: string
  mountains: string
  altitude: number
  capacity: number
  status: string
  phone: string
  services: string[]
}

interface SkiLift {
  name: string
  resort: string
  type: string
  open: boolean
  snowDepth: number
}

interface TourismData {
  chalets: Chalet[]
  lifts: SkiLift[]
  openLifts: number
  season: string
  source: string
}

function Stars({ n }: { n: number }) {
  const rounded = Math.round(n ?? 0)
  return <span className="text-yellow-400 text-[10px]">{'\u2605'.repeat(Math.min(5, Math.max(0, rounded)))}{'\u2606'.repeat(Math.max(0, 5 - Math.min(5, rounded)))}</span>
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
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${c.status === 'open' ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] text-slate-200 font-medium">{c.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">{c.mountains} · {c.altitude}m n.m. · {c.status === 'open' ? 'Otvorené' : 'Zatvorené'}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 shrink-0">{c.capacity} m.</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {data.lifts.map(l => (
                <div key={l.name} className="flex items-start gap-2 bg-slate-700/30 rounded-lg p-2.5">
                  <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${l.open ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[12px] text-slate-200 font-medium">{l.name}</span>
                    <div className="text-[10px] text-slate-500">{l.resort} · {l.type}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-blue-400 font-medium">{l.snowDepth} cm</div>
                    <div className="text-[9px] text-slate-500">{l.open ? 'Ide' : 'Nejíde'}</div>
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
