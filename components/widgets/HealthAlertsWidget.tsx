'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface HealthAlert {
  title: string
  description: string
  source: string
  date: string
  severity: 'low' | 'medium' | 'high'
  category: string
  link?: string
  region: 'sk' | 'world'
}

interface HealthData {
  sk: HealthAlert[]
  world: HealthAlert[]
  alerts: HealthAlert[]
  timestamp: number
}

const SEV_STYLES = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/25', badge: 'bg-red-500/20 text-red-400', icon: '🔴' },
  medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', badge: 'bg-amber-500/20 text-amber-400', icon: '🟡' },
  low: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', badge: 'bg-emerald-500/20 text-emerald-400', icon: '🟢' },
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3600000)
  if (diff < 1) return 'teraz'
  if (diff < 24) return `${diff}h`
  if (diff < 48) return 'včera'
  return `${Math.floor(diff / 24)}d`
}

export default function HealthAlertsWidget() {
  const { lang } = useLang()
  const [region, setRegion] = useState<'sk' | 'world'>('sk')
  const { data, loading, error, refetch } = useWidget<HealthData>('/api/health', 30 * 60 * 1000)

  const alerts = data ? (region === 'sk' ? (data.sk?.length > 0 ? data.sk : data.alerts) : (data.world?.length > 0 ? data.world : data.alerts)) : []

  return (
    <WidgetCard
      accent="rose"
      title={lang === 'sk' ? 'Zdravotné varovania' : 'Health Alerts'}
      icon="🏥"
      onRefresh={refetch}
    >
      {/* Region toggle */}
      <div className="flex items-center gap-1 mb-3">
        <button onClick={() => setRegion('sk')}
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all ${region === 'sk' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'}`}>
          🇸🇰 Slovensko
        </button>
        <button onClick={() => setRegion('world')}
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all ${region === 'world' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'}`}>
          🌍 Svet
        </button>
      </div>

      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">{lang === 'sk' ? 'Chyba' : 'Error'}</p>}
      {!loading && data && alerts.length === 0 && (
        <div className="text-center py-6">
          <span className="text-2xl block mb-1">✅</span>
          <p className="text-xs text-slate-500">{lang === 'sk' ? 'Žiadne aktívne varovania' : 'No active alerts'}</p>
        </div>
      )}
      {!loading && data && alerts.length > 0 && (
        <div className="space-y-1.5 max-h-[380px] overflow-y-auto scrollbar-hide">
          {alerts.map((alert, i) => {
            const sev = SEV_STYLES[alert.severity]
            return (
              <a key={i} href={alert.link} target="_blank" rel="noopener noreferrer"
                className={`block rounded-xl p-2.5 border ${sev.border} ${sev.bg} hover:scale-[1.01] transition-all`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm shrink-0">{sev.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-200 leading-snug line-clamp-2 font-medium">{alert.title}</p>
                    {alert.description && <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">{alert.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${sev.badge}`}>{alert.category}</span>
                      <span className="text-[9px] text-slate-600">{alert.source}</span>
                      <span className="text-[9px] text-slate-600">{timeAgo(alert.date)}</span>
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">WHO · ECDC · ÚVZSR · ProMED</p>
    </WidgetCard>
  )
}
