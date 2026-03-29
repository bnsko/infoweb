'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface TrainDelay {
  train: string
  route: string
  delay: number
  station: string
  carrier: string
  type: string
}

interface TrainData {
  delays: TrainDelay[]
  avgDelay: number
  totalDelayed: number
  timestamp: number
}

const TYPE_STYLE: Record<string, string> = {
  IC: 'bg-red-500/15 text-red-300',
  RJ: 'bg-yellow-500/15 text-yellow-300',
  LE: 'bg-purple-500/15 text-purple-300',
  R: 'bg-blue-500/15 text-blue-300',
  Os: 'bg-slate-500/15 text-slate-300',
}

export default function TrainDelaysWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<TrainData>('/api/trains', 5 * 60 * 1000)

  return (
    <WidgetCard accent="blue" title={lang === 'sk' ? 'Meškanie vlakov' : 'Train Delays'} icon="🚂" onRefresh={refetch}
      badge={data && data.totalDelayed > 0 ? `${data.totalDelayed}` : undefined}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && data && data.delays.length === 0 && (
        <div className="text-center py-4">
          <span className="text-lg">✅</span>
          <p className="text-[11px] text-emerald-400 mt-1">{lang === 'sk' ? 'Žiadne meškania' : 'No delays'}</p>
        </div>
      )}
      {!loading && data && data.delays.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[9px] text-slate-500 mb-2">
            <span>Priemer: <strong className="text-orange-300">{data.avgDelay} min</strong></span>
            <span>·</span>
            <span>{data.totalDelayed} vlakov mešká</span>
          </div>
          {data.delays.map((d, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
              <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${TYPE_STYLE[d.type] ?? 'bg-slate-500/15 text-slate-300'}`}>{d.type}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-medium text-slate-200 truncate block">{d.train} · {d.route}</span>
                <span className="text-[9px] text-slate-500">{d.station}</span>
              </div>
              <span className={`text-[11px] font-bold tabular-nums ${d.delay > 20 ? 'text-red-400' : d.delay > 10 ? 'text-orange-400' : 'text-yellow-400'}`}>
                +{d.delay} min
              </span>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
