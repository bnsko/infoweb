'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Dispatch {
  type: 'ambulance' | 'fire' | 'police'
  event: string
  location: string
  time: string
  status: string
}

interface EmergencyData {
  dispatches: Dispatch[]
  counts: { ambulance: number; fire: number; police: number }
  timestamp: number
}

const TYPE_STYLE: Record<string, { emoji: string; bg: string; text: string }> = {
  ambulance: { emoji: '🚑', bg: 'bg-red-500/10', text: 'text-red-300' },
  fire: { emoji: '🚒', bg: 'bg-orange-500/10', text: 'text-orange-300' },
  police: { emoji: '🚔', bg: 'bg-blue-500/10', text: 'text-blue-300' },
}

export default function EmergencyWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<EmergencyData>('/api/emergency', 5 * 60 * 1000)

  return (
    <WidgetCard accent="rose" title={lang === 'sk' ? 'Záchranné zložky' : 'Emergency Services'} icon="🚨" onRefresh={refetch}
      badge={data ? `${data.dispatches.length}` : undefined}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && data && (
        <div className="space-y-1">
          <div className="flex gap-3 text-[9px] text-slate-500 mb-2 px-2">
            <span>🚑 {data.counts.ambulance}</span>
            <span>🚒 {data.counts.fire}</span>
            <span>🚔 {data.counts.police}</span>
          </div>
          {data.dispatches.map((d, i) => {
            const s = TYPE_STYLE[d.type] ?? TYPE_STYLE.police
            return (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                <span className="text-sm">{s.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-medium text-slate-200 block truncate">{d.event}</span>
                  <span className="text-[9px] text-slate-500">{d.location}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] text-slate-400 tabular-nums block">{d.time}</span>
                  <span className={`text-[7px] px-1 py-0.5 rounded-full font-bold ${d.status === 'aktívny' ? 'bg-red-500/15 text-red-300' : d.status === 'na ceste' ? 'bg-yellow-500/15 text-yellow-300' : 'bg-green-500/15 text-green-300'}`}>
                    {d.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </WidgetCard>
  )
}
