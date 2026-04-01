'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'

interface Alert {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  date: string
  description: string
  url: string
}

interface Stats {
  criticalCount: number
  highCount: number
  totalThisMonth: number
  lastUpdated: string
}

interface SKCertData {
  alerts: Alert[]
  stats: Stats
  source: string
  disclaimer: string
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-slate-400/20 text-slate-400 border-slate-400/30',
}

const SEVERITY_LABEL: Record<string, string> = { critical: 'Kritická', high: 'Vysoká', medium: 'Stredná', low: 'Nízka' }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  if (d > 0) return `pred ${d}d`
  if (h > 0) return `pred ${h}h`
  return 'práve teraz'
}

export default function SKCertWidget() {
  const { data, loading, refetch } = useWidget<SKCertData>('/api/sk-cert', 3600 * 1000)

  return (
    <WidgetCard accent="rose" title="SK-CERT Kybernetické hrozby" icon="🛡️" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2 mb-1">
            {[
              { label: 'Celkom', value: data.alerts.length, color: 'text-white' },
              { label: 'Kritické', value: data.stats.criticalCount, color: 'text-red-400' },
              { label: 'Vysoké', value: data.stats.highCount, color: 'text-orange-400' },
              { label: 'Tento mes.', value: data.stats.totalThisMonth, color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="text-center bg-slate-700/40 rounded-lg p-2">
                <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            {data.alerts.map(a => (
              <div key={a.id} className="flex items-start gap-2 bg-slate-700/30 rounded-lg p-2">
                <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold border ${SEVERITY_COLOR[a.severity]} shrink-0`}>
                  {SEVERITY_LABEL[a.severity]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-200 font-medium truncate">{a.title}</div>
                  <div className="text-[10px] text-slate-500">{a.category} · {timeAgo(a.date)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[9px] text-slate-600 text-right">
            <a href="https://www.sk-cert.sk" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">sk-cert.sk</a>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
