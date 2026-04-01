'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'

interface NBUAlert {
  id: string
  title: string
  type: string
  level: string
  date: string
  description: string
  url: string
}

type ThreatLevelColor = 'red' | 'orange' | 'yellow' | 'green'

interface NBUData {
  threatLevel: ThreatLevelColor
  alerts: NBUAlert[]
  source: string
  disclaimer: string
}

const LEVEL_STYLE: Record<ThreatLevelColor, { bg: string; border: string; text: string; dot: string; label: string }> = {
  red: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400', dot: 'bg-red-500', label: 'Kritická hrozba' },
  orange: { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', dot: 'bg-orange-500', label: 'Vysoká hrozba' },
  yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', dot: 'bg-yellow-500', label: 'Zvýšená hrozba' },
  green: { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-400', dot: 'bg-green-500', label: 'Bežná situácia' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  if (d > 0) return `pred ${d}d`
  if (h > 0) return `pred ${h}h`
  return 'práve teraz'
}

export default function NBUAlertsWidget() {
  const { data, loading, refetch } = useWidget<NBUData>('/api/nbu-alerts', 3600 * 1000)

  return (
    <WidgetCard accent="orange" title="NBÚ Národná bezpečnosť" icon="🔒" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {/* Threat level indicator */}
          {(() => {
            const level: ThreatLevelColor = (data.threatLevel as ThreatLevelColor) in LEVEL_STYLE ? data.threatLevel as ThreatLevelColor : 'green'
            const s = LEVEL_STYLE[level]
            return (
              <div className={`flex items-center gap-3 rounded-xl p-3 border ${s.bg} ${s.border}`}>
                <div className={`w-3 h-3 rounded-full shrink-0 ${s.dot} animate-pulse`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${s.text}`}>{s.label}</div>
                  <div className="text-[10px] text-slate-400">Stupeň ohrozenia: {level.toUpperCase()}</div>
                </div>
              </div>
            )
          })()}

          <div className="space-y-1.5">
            {data.alerts.slice(0, 3).map(a => (
              <div key={a.id} className="flex items-start gap-2 bg-slate-700/30 rounded-lg p-2">
                <span className="text-xs shrink-0 mt-0.5">⚠️</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-200 font-medium leading-tight">{a.title}</div>
                  <div className="text-[10px] text-slate-500">{a.type} · {timeAgo(a.date)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-[10px] text-slate-500">Aktívne upozornenia: <span className="text-white font-bold">{data.alerts.length}</span></div>
            <a href="https://www.nbu.gov.sk" target="_blank" rel="noopener noreferrer" className="text-[9px] text-slate-600 hover:text-slate-400">nbu.gov.sk</a>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
