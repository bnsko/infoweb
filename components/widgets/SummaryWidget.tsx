'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

/* ── Traffic ── */
interface TrafficItem { title: string; link: string; description: string; pubDate: string; source: string }
interface TrafficStats { accidents: number; jams: number; closures: number; total: number; congestion: string }
interface TrafficData { items: TrafficItem[]; restrictions: TrafficItem[]; speedCameras: { road: string; location: string; type: string; limit: number }[]; stats?: TrafficStats }

/* ── Health Alerts ── */
interface HealthAlert { title: string; description: string; source: string; date: string; severity: 'low' | 'medium' | 'high'; category: string; link: string; region: 'sk' | 'world' }
interface HealthData { sk: HealthAlert[]; world: HealthAlert[]; alerts: HealthAlert[]; timestamp: number }

/* ── Emergency ── */
interface Dispatch { type: 'ambulance' | 'fire' | 'police'; event: string; location: string; time: string; status: string }
interface EmergencyData { dispatches: Dispatch[]; counts: Record<string, number>; timestamp: number }

/* ── Local Outages ── */
interface LocalOutage { type: string; title: string; location: string; city: string; since: string; until: string; provider: string; note: string }
interface LocalOutagesData { outages: LocalOutage[]; timestamp: number }

function formatTime(iso: string): string {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString('sk-SK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

export default function SummaryWidget() {
  const { lang } = useLang()

  const traffic = useWidget<TrafficData>('/api/traffic', 2 * 60 * 1000)
  const health = useWidget<HealthData>('/api/health', 30 * 60 * 1000)
  const emergency = useWidget<EmergencyData>('/api/emergency', 5 * 60 * 1000)
  const localOutages = useWidget<LocalOutagesData>('/api/localoutages', 10 * 60 * 1000)

  const refetchAll = () => { traffic.refetch(); health.refetch(); emergency.refetch(); localOutages.refetch() }

  const trafficCount = traffic.data?.items?.length ?? 0
  const healthAlerts = [...(health.data?.sk ?? []), ...(health.data?.world ?? [])]
  const emergencyDispatches = emergency.data?.dispatches ?? []
  const outagesList = localOutages.data?.outages ?? []

  return (
    <WidgetCard accent="rose" title={lang === 'sk' ? 'Súhrnný prehľad' : 'Summary'} icon="📋" onRefresh={refetchAll}>
      <div className="grid grid-cols-2 gap-2">
        {/* Tile 1: Traffic */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">🚗</span>
            <span className="text-[10px] font-bold text-rose-300">{lang === 'sk' ? 'Doprava' : 'Traffic'}</span>
            {trafficCount > 0 && <span className="text-[8px] text-slate-500 ml-auto">({trafficCount})</span>}
          </div>
          {traffic.loading ? <SkeletonRows rows={2} /> : (
            <>
              {traffic.data?.stats && (
                <CongestionBadge level={traffic.data.stats.congestion} lang={lang} />
              )}
              <div className="space-y-0.5 max-h-[120px] overflow-y-auto scrollbar-hide">
                {(traffic.data?.items ?? []).length === 0 ? (
                  <p className="text-[9px] text-emerald-400 text-center py-2">✅ Bez udalostí</p>
                ) : (traffic.data?.items ?? []).slice(0, 4).map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="block text-[9px] text-slate-400 hover:text-white line-clamp-1 transition-colors">
                    ⚠️ {item.title}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Tile 2: Health Alerts */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">⚕️</span>
            <span className="text-[10px] font-bold text-amber-300">{lang === 'sk' ? 'Výstrahy' : 'Alerts'}</span>
            {healthAlerts.length > 0 && <span className="text-[8px] text-slate-500 ml-auto">({healthAlerts.length})</span>}
          </div>
          {health.loading ? <SkeletonRows rows={2} /> : (
            <div className="space-y-0.5 max-h-[120px] overflow-y-auto scrollbar-hide">
              {healthAlerts.length === 0 ? (
                <p className="text-[9px] text-emerald-400 text-center py-2">✅ Žiadne výstrahy</p>
              ) : healthAlerts.slice(0, 4).map((alert, i) => (
                <a key={i} href={alert.link} target="_blank" rel="noopener noreferrer" className="block text-[9px] text-slate-400 hover:text-white line-clamp-1 transition-colors">
                  <span className={alert.severity === 'high' ? 'text-red-400' : alert.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400'}>
                    {alert.severity === 'high' ? '‼️' : alert.severity === 'medium' ? '⚠️' : 'ℹ️'}
                  </span> {alert.title}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Tile 3: Emergency */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">🚨</span>
            <span className="text-[10px] font-bold text-orange-300">{lang === 'sk' ? 'Zásahy' : 'Emergency'}</span>
            {emergencyDispatches.length > 0 && <span className="text-[8px] text-slate-500 ml-auto">({emergencyDispatches.length})</span>}
          </div>
          {emergency.loading ? <SkeletonRows rows={2} /> : (
            <div className="space-y-0.5 max-h-[120px] overflow-y-auto scrollbar-hide">
              {emergencyDispatches.length === 0 ? (
                <p className="text-[9px] text-emerald-400 text-center py-2">✅ Žiadne zásahy</p>
              ) : emergencyDispatches.slice(0, 4).map((d, i) => {
                const icon = d.type === 'ambulance' ? '🚑' : d.type === 'fire' ? '🚒' : '🚔'
                return (
                  <div key={i} className="text-[9px] text-slate-400 line-clamp-1">
                    {icon} {d.event} <span className="text-slate-600">· {d.location}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Tile 4: Outages */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">⚡</span>
            <span className="text-[10px] font-bold text-cyan-300">{lang === 'sk' ? 'Výpadky' : 'Outages'}</span>
            {outagesList.length > 0 && <span className="text-[8px] text-slate-500 ml-auto">({outagesList.length})</span>}
          </div>
          {localOutages.loading ? <SkeletonRows rows={2} /> : (
            <div className="space-y-0.5 max-h-[120px] overflow-y-auto scrollbar-hide">
              {outagesList.length === 0 ? (
                <p className="text-[9px] text-emerald-400 text-center py-2">✅ Žiadne výpadky</p>
              ) : outagesList.slice(0, 4).map((o, i) => {
                const icon = o.type === 'electricity' ? '⚡' : o.type === 'construction' ? '🚧' : '🔇'
                return (
                  <div key={i} className="text-[9px] text-slate-400 line-clamp-1">
                    {icon} {o.title} <span className="text-slate-600">· {o.city}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <p className="text-[10px] text-slate-600 mt-2">Waze · RÚVZ · HaZZ · SSE/ZSE/VSE</p>
    </WidgetCard>
  )
}

function CongestionBadge({ level, lang }: { level: string; lang: string }) {
  const map: Record<string, { color: string; label: string }> = {
    low: { color: '#22c55e', label: 'Nízka' }, moderate: { color: '#eab308', label: 'Stredná' },
    high: { color: '#f97316', label: 'Vysoká' }, severe: { color: '#ef4444', label: 'Kritická' },
  }
  const info = map[level] ?? map.low
  return (
    <span className="flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: info.color + '20', color: info.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: info.color }} />
      {info.label}
    </span>
  )
}
