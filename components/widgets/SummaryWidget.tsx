'use client'

import { useState } from 'react'
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

/* ── Internet / Social Outages ── */
interface ServiceStatus { name: string; icon: string; status: 'up' | 'issues' | 'down'; category: string; reports: number; lastIssue: string }
interface InternetOutagesData { services: ServiceStatus[]; issueCount: number; allGood: boolean; timestamp: number }

type Tab = 'traffic' | 'alerts' | 'emergency' | 'outages' | 'internet'

export default function SummaryWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('traffic')
  const [showAllTraffic, setShowAllTraffic] = useState(false)

  const traffic = useWidget<TrafficData>('/api/traffic', 2 * 60 * 1000)
  const health = useWidget<HealthData>('/api/health', 30 * 60 * 1000)
  const emergency = useWidget<EmergencyData>('/api/emergency', 5 * 60 * 1000)
  const localOutages = useWidget<LocalOutagesData>('/api/localoutages', 10 * 60 * 1000)
  const internet = useWidget<InternetOutagesData>('/api/internetoutages', 5 * 60 * 1000)

  const refetchAll = () => { traffic.refetch(); health.refetch(); emergency.refetch(); localOutages.refetch(); internet.refetch() }

  const trafficItems = traffic.data?.items ?? []
  const healthAlerts = [...(health.data?.sk ?? []), ...(health.data?.world ?? [])]
  const emergencyDispatches = emergency.data?.dispatches ?? []
  const outagesList = localOutages.data?.outages ?? []
  const internetServices = internet.data?.services ?? []
  const internetIssues = internetServices.filter(s => s.status !== 'up')

  const TABS: { key: Tab; icon: string; label: string; count: number; color: string }[] = [
    { key: 'traffic', icon: '🚗', label: 'Doprava', count: trafficItems.length, color: 'rose' },
    { key: 'alerts', icon: '⚕️', label: 'Výstrahy', count: healthAlerts.length, color: 'amber' },
    { key: 'emergency', icon: '🚨', label: 'Zásahy', count: emergencyDispatches.length, color: 'orange' },
    { key: 'outages', icon: '⚡', label: 'Výpadky', count: outagesList.length, color: 'cyan' },
    { key: 'internet', icon: '🌐', label: 'Internet', count: internetIssues.length, color: 'violet' },
  ]

  return (
    <WidgetCard accent="rose" title={lang === 'sk' ? 'Súhrnný prehľad' : 'Summary'} icon="📋" onRefresh={refetchAll}>
      {/* Tab bar */}
      <div className="flex gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[9px] font-semibold py-1.5 rounded-md transition-all relative ${
              tab === t.key ? `bg-${t.color}-500/15 text-${t.color}-300` : 'text-slate-500 hover:text-slate-300'
            }`}
            style={tab === t.key ? { backgroundColor: `rgb(var(--color-${t.color}-500) / 0.15)` } : undefined}>
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
            {t.count > 0 && (
              <span className={`text-[7px] min-w-[14px] h-[14px] flex items-center justify-center rounded-full font-bold ${
                tab === t.key ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-500'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Traffic */}
      {tab === 'traffic' && (
        <div className="space-y-2">
          {traffic.loading ? <SkeletonRows rows={4} /> : (
            <>
              {traffic.data?.stats && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <CongestionBadge level={traffic.data.stats.congestion} />
                  <div className="grid grid-cols-3 gap-3 flex-1 text-center">
                    <div>
                      <div className="text-[14px] font-bold text-red-400">{traffic.data.stats.accidents}</div>
                      <div className="text-[8px] text-slate-500">Nehody</div>
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-amber-400">{traffic.data.stats.jams}</div>
                      <div className="text-[8px] text-slate-500">Zápchy</div>
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-orange-400">{traffic.data.stats.closures}</div>
                      <div className="text-[8px] text-slate-500">Uzávierky</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-0.5 max-h-[300px] overflow-y-auto scrollbar-hide">
                {trafficItems.length === 0 ? (
                  <p className="text-[10px] text-emerald-400 text-center py-4">✅ Bez dopravných udalostí</p>
                ) : (showAllTraffic ? trafficItems : trafficItems.slice(0, 8)).map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.03] transition-colors">
                    <span className="text-[10px] mt-0.5">
                      {item.title.toLowerCase().includes('nehod') || item.title.toLowerCase().includes('kolíz') ? '💥' :
                       item.title.toLowerCase().includes('zápch') || item.title.toLowerCase().includes('zdržan') ? '🚧' : '⚠️'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-200 font-medium line-clamp-2">{item.title}</p>
                      {item.description && <p className="text-[8px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>}
                    </div>
                    <span className="text-[8px] text-slate-600 shrink-0">{item.source}</span>
                  </a>
                ))}
                {trafficItems.length > 8 && !showAllTraffic && (
                  <button onClick={() => setShowAllTraffic(true)} className="w-full text-center text-[9px] text-rose-400 hover:text-rose-300 py-1">
                    Zobraziť všetky ({trafficItems.length}) ▼
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Health Alerts */}
      {tab === 'alerts' && (
        <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-hide">
          {health.loading ? <SkeletonRows rows={4} /> : healthAlerts.length === 0 ? (
            <p className="text-[10px] text-emerald-400 text-center py-4">✅ Žiadne zdravotné výstrahy</p>
          ) : healthAlerts.map((alert, i) => (
            <a key={i} href={alert.link} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5">
              <span className={`text-[10px] mt-0.5 ${alert.severity === 'high' ? 'text-red-400' : alert.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {alert.severity === 'high' ? '‼️' : alert.severity === 'medium' ? '⚠️' : 'ℹ️'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-200 font-medium line-clamp-2">{alert.title}</p>
                {alert.description && <p className="text-[8px] text-slate-500 line-clamp-1 mt-0.5">{alert.description}</p>}
              </div>
              <div className="shrink-0 text-right">
                <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold ${
                  alert.region === 'sk' ? 'bg-blue-500/15 text-blue-300' : 'bg-purple-500/15 text-purple-300'
                }`}>{alert.region === 'sk' ? '🇸🇰' : '🌍'}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Emergency */}
      {tab === 'emergency' && (
        <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-hide">
          {emergency.loading ? <SkeletonRows rows={4} /> : (
            <>
              {emergency.data?.counts && Object.keys(emergency.data.counts).length > 0 && (
                <div className="flex gap-2 mb-2">
                  {Object.entries(emergency.data.counts).map(([type, count]) => (
                    <div key={type} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5">
                      <span className="text-sm">{type === 'ambulance' ? '🚑' : type === 'fire' ? '🚒' : '🚔'}</span>
                      <span className="text-[12px] font-bold text-orange-300">{count}</span>
                    </div>
                  ))}
                </div>
              )}
              {emergencyDispatches.length === 0 ? (
                <p className="text-[10px] text-emerald-400 text-center py-4">✅ Žiadne aktívne zásahy</p>
              ) : emergencyDispatches.map((d, i) => {
                const icon = d.type === 'ambulance' ? '🚑' : d.type === 'fire' ? '🚒' : '🚔'
                return (
                  <div key={i} className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-white/[0.03] transition-colors">
                    <span className="text-sm mt-0.5">{icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-200 font-medium">{d.event}</p>
                      <p className="text-[8px] text-slate-500">📍 {d.location} · {d.time}</p>
                    </div>
                    <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                      d.status === 'active' ? 'bg-red-500/15 text-red-300' : 'bg-green-500/15 text-green-300'
                    }`}>{d.status === 'active' ? '🔴 Aktívny' : '✅ Vyriešený'}</span>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* Local Outages */}
      {tab === 'outages' && (
        <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-hide">
          {localOutages.loading ? <SkeletonRows rows={4} /> : outagesList.length === 0 ? (
            <p className="text-[10px] text-emerald-400 text-center py-4">✅ Žiadne lokálne výpadky</p>
          ) : outagesList.map((o, i) => {
            const icon = o.type === 'electricity' ? '⚡' : o.type === 'gas' ? '🔥' : o.type === 'water' ? '💧' : o.type === 'construction' ? '🚧' : '🔇'
            return (
              <div key={i} className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-white/[0.03] transition-colors">
                <span className="text-sm mt-0.5">{icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-200 font-medium line-clamp-1">{o.title}</p>
                  <p className="text-[8px] text-slate-500">📍 {o.city} · {o.provider}</p>
                  {o.until && <p className="text-[8px] text-amber-400/60">Do: {o.until}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Internet & Social Media Outages */}
      {tab === 'internet' && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
          {internet.loading ? <SkeletonRows rows={4} /> : (
            <>
              {internet.data?.allGood && (
                <div className="px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/10 text-[10px] text-green-300 text-center">
                  ✅ Všetky hlavné služby fungujú normálne
                </div>
              )}
              {/* Services with issues first */}
              {internetIssues.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[9px] text-red-400 font-semibold uppercase tracking-wider px-1">Služby s problémami</div>
                  {internetIssues.map((s, i) => (
                    <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
                      s.status === 'down' ? 'bg-red-500/8 border-red-500/15' : 'bg-amber-500/8 border-amber-500/15'
                    }`}>
                      <span className="text-base">{s.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold text-white">{s.name}</span>
                        <span className="text-[8px] text-slate-500 ml-2">{s.reports} hlásení</span>
                      </div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                        s.status === 'down' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>{s.status === 'down' ? '🔴 Nefunguje' : '🟡 Problémy'}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* All services grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {internetServices.map((s, i) => (
                  <div key={i} className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 border transition-colors ${
                    s.status === 'up' ? 'bg-white/[0.02] border-white/5' :
                    s.status === 'issues' ? 'bg-amber-500/5 border-amber-500/15' :
                    'bg-red-500/5 border-red-500/15'
                  }`}>
                    <span className="text-sm">{s.icon}</span>
                    <div className="min-w-0">
                      <div className="text-[8px] text-slate-300 font-medium truncate">{s.name}</div>
                      <div className={`text-[7px] font-bold ${
                        s.status === 'up' ? 'text-green-400' : s.status === 'issues' ? 'text-amber-400' : 'text-red-400'
                      }`}>{s.status === 'up' ? '✅ OK' : s.status === 'issues' ? '⚠️' : '🔴'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <p className="text-[9px] text-slate-600 mt-2">Zdroje: Waze · RÚVZ · HaZZ · SSE/ZSE/VSE · DownDetector</p>
    </WidgetCard>
  )
}

function CongestionBadge({ level }: { level: string }) {
  const map: Record<string, { color: string; label: string }> = {
    low: { color: '#22c55e', label: 'Nízka' }, moderate: { color: '#eab308', label: 'Stredná' },
    high: { color: '#f97316', label: 'Vysoká' }, severe: { color: '#ef4444', label: 'Kritická' },
  }
  const info = map[level] ?? map.low
  return (
    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: info.color + '20', color: info.color }}>
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info.color }} />
      {info.label}
    </span>
  )
}
