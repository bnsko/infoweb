'use client'

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
}

interface HealthData {
  alerts: HealthAlert[]
  timestamp: number
}

const SEV_STYLES = {
  high: { bg: 'bg-red-500/10', border: 'border-red-500/25', badge: 'bg-red-500/20 text-red-400', icon: '🔴' },
  medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', badge: 'bg-amber-500/20 text-amber-400', icon: '🟡' },
  low: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', badge: 'bg-emerald-500/20 text-emerald-400', icon: '🟢' },
}

export default function HealthAlertsWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<HealthData>('/api/health', 30 * 60 * 1000)

  return (
    <WidgetCard
      accent="rose"
      title={lang === 'sk' ? 'Zdravotné varovania' : 'Health Alerts'}
      icon="🏥"
      onRefresh={refetch}
    >
      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">{lang === 'sk' ? 'Chyba' : 'Error'}</p>}
      {!loading && data && data.alerts.length === 0 && (
        <div className="text-center py-6">
          <span className="text-2xl block mb-1">✅</span>
          <p className="text-xs text-slate-500">{lang === 'sk' ? 'Žiadne aktívne varovania' : 'No active alerts'}</p>
        </div>
      )}
      {!loading && data && data.alerts.length > 0 && (
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto scrollbar-hide">
          {data.alerts.map((alert, i) => {
            const sev = SEV_STYLES[alert.severity]
            return (
              <a
                key={i}
                href={alert.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`block rounded-xl p-2.5 border ${sev.border} ${sev.bg} hover:scale-[1.01] transition-all`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-sm shrink-0">{sev.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-200 leading-snug line-clamp-2 font-medium">{alert.title}</p>
                    {alert.description && (
                      <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-1">{alert.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${sev.badge}`}>{alert.category}</span>
                      <span className="text-[9px] text-slate-600">{alert.source}</span>
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">WHO · ECDC · {lang === 'sk' ? 'obnova 30 min' : 'refresh 30 min'}</p>
    </WidgetCard>
  )
}
