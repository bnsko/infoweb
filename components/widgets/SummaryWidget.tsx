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

export default function SummaryWidget() {
  const { lang } = useLang()
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

  return (
    <WidgetCard accent="rose" title={lang === 'sk' ? 'Súhrnný prehľad' : 'Summary'} icon="📋" onRefresh={refetchAll}>
      <div className="space-y-4">

        {/* ── Traffic ── */}
        <Section icon="🚗" title="Doprava" count={trafficItems.length} color="rose">
          {traffic.loading ? <SkeletonRows rows={3} /> : (
            <>
              {traffic.data?.stats && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 mb-1">
                  <CongestionBadge level={traffic.data.stats.congestion} />
                  <div className="grid grid-cols-3 gap-3 flex-1 text-center">
                    <div><div className="text-[13px] font-bold text-red-400">{traffic.data.stats.accidents}</div><div className="text-[8px] text-slate-500">Nehody</div></div>
                    <div><div className="text-[13px] font-bold text-amber-400">{traffic.data.stats.jams}</div><div className="text-[8px] text-slate-500">Zápchy</div></div>
                    <div><div className="text-[13px] font-bold text-orange-400">{traffic.data.stats.closures}</div><div className="text-[8px] text-slate-500">Uzávierky</div></div>
                  </div>
                </div>
              )}
              <div className="space-y-0.5 max-h-[160px] overflow-y-auto scrollbar-hide">
                {trafficItems.length === 0 ? (
                  <p className="text-[10px] text-emerald-400 text-center py-2">✅ Bez dopravných udalostí</p>
                ) : (showAllTraffic ? trafficItems : trafficItems.slice(0, 5)).map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 rounded-lg px-2 py-1 hover:bg-white/[0.03] transition-colors">
                    <span className="text-[10px] mt-0.5">{item.title.toLowerCase().includes('nehod') || item.title.toLowerCase().includes('kolíz') ? '💥' : item.title.toLowerCase().includes('zápch') || item.title.toLowerCase().includes('zdržan') ? '🚧' : '⚠️'}</span>
                    <div className="min-w-0 flex-1"><p className="text-[10px] text-slate-200 font-medium line-clamp-1">{item.title}</p></div>
                    <span className="text-[8px] text-slate-600 shrink-0">{item.source}</span>
                  </a>
                ))}
                {trafficItems.length > 5 && !showAllTraffic && (
                  <button onClick={() => setShowAllTraffic(true)} className="w-full text-center text-[9px] text-rose-400 hover:text-rose-300 py-0.5">+{trafficItems.length - 5} ďalších ▼</button>
                )}
              </div>
            </>
          )}
        </Section>

        {/* ── Health Alerts ── */}
        <Section icon="⚕️" title="Zdravotné výstrahy" count={healthAlerts.length} color="amber">
          {health.loading ? <SkeletonRows rows={2} /> : healthAlerts.length === 0 ? (
            <p className="text-[10px] text-emerald-400 text-center py-2">✅ Žiadne zdravotné výstrahy</p>
          ) : (
            <div className="space-y-0.5 max-h-[120px] overflow-y-auto scrollbar-hide">
              {healthAlerts.slice(0, 5).map((alert, i) => (
                <a key={i} href={alert.link} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 rounded-lg px-2 py-1 hover:bg-white/[0.03] transition-colors">
                  <span className={`text-[10px] mt-0.5 ${alert.severity === 'high' ? 'text-red-400' : alert.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {alert.severity === 'high' ? '‼️' : alert.severity === 'medium' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div className="min-w-0 flex-1"><p className="text-[10px] text-slate-200 font-medium line-clamp-1">{alert.title}</p></div>
                  <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold ${alert.region === 'sk' ? 'bg-blue-500/15 text-blue-300' : 'bg-purple-500/15 text-purple-300'}`}>{alert.region === 'sk' ? '🇸🇰' : '🌍'}</span>
                </a>
              ))}
            </div>
          )}
        </Section>

        {/* ── Emergency ── */}
        <Section icon="🚨" title="Zásahy IZS" count={emergencyDispatches.length} color="orange">
          {emergency.loading ? <SkeletonRows rows={2} /> : (
            <>
              {emergency.data?.counts && Object.keys(emergency.data.counts).length > 0 && (
                <div className="flex gap-2 mb-1">
                  {Object.entries(emergency.data.counts).map(([type, count]) => (
                    <div key={type} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <span className="text-sm">{type === 'ambulance' ? '🚑' : type === 'fire' ? '🚒' : '🚔'}</span>
                      <span className="text-[11px] font-bold text-orange-300">{count}</span>
                    </div>
                  ))}
                </div>
              )}
              {emergencyDispatches.length === 0 ? (
                <p className="text-[10px] text-emerald-400 text-center py-2">✅ Žiadne aktívne zásahy</p>
              ) : (
                <div className="space-y-0.5 max-h-[120px] overflow-y-auto scrollbar-hide">
                  {emergencyDispatches.slice(0, 5).map((d, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg px-2 py-1 hover:bg-white/[0.03] transition-colors">
                      <span className="text-sm mt-0.5">{d.type === 'ambulance' ? '🚑' : d.type === 'fire' ? '🚒' : '🚔'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-200 font-medium line-clamp-1">{d.event}</p>
                        <p className="text-[8px] text-slate-500">📍 {d.location} · {d.time}</p>
                      </div>
                      <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${d.status === 'active' ? 'bg-red-500/15 text-red-300' : 'bg-green-500/15 text-green-300'}`}>{d.status === 'active' ? '🔴' : '✅'}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Section>

        {/* ── Local Outages ── */}
        <Section icon="⚡" title="Lokálne výpadky" count={outagesList.length} color="cyan">
          {localOutages.loading ? <SkeletonRows rows={2} /> : outagesList.length === 0 ? (
            <p className="text-[10px] text-emerald-400 text-center py-2">✅ Žiadne lokálne výpadky</p>
          ) : (
            <div className="space-y-0.5 max-h-[120px] overflow-y-auto scrollbar-hide">
              {outagesList.slice(0, 5).map((o, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg px-2 py-1 hover:bg-white/[0.03] transition-colors">
                  <span className="text-sm mt-0.5">{o.type === 'electricity' ? '⚡' : o.type === 'gas' ? '🔥' : o.type === 'water' ? '💧' : '🔇'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-200 font-medium line-clamp-1">{o.title}</p>
                    <p className="text-[8px] text-slate-500">📍 {o.city} · {o.provider}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── Internet & Social ── */}
        <Section icon="🌐" title="Internet & služby" count={internetIssues.length} color="violet">
          {internet.loading ? <SkeletonRows rows={2} /> : (
            <>
              {/* Metrics bar */}
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 mb-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: internet.data?.allGood ? '#22c55e' : '#f97316' }} />
                  <span className="text-[9px] font-bold" style={{ color: internet.data?.allGood ? '#22c55e' : '#f97316' }}>
                    {internet.data?.allGood ? 'Všetko OK' : `${internetIssues.length} problém${internetIssues.length > 1 ? 'y' : ''}`}
                  </span>
                </div>
                <div className="text-[8px] text-slate-500">
                  <span className="text-green-400 font-bold">{internetServices.filter(s => s.status === 'up').length}</span> ✅
                  {internetIssues.length > 0 && <><span className="mx-1">·</span><span className="text-amber-400 font-bold">{internetServices.filter(s => s.status === 'issues').length}</span> ⚠️</>}
                  {internetServices.filter(s => s.status === 'down').length > 0 && <><span className="mx-1">·</span><span className="text-red-400 font-bold">{internetServices.filter(s => s.status === 'down').length}</span> 🔴</>}
                </div>
                <div className="flex-1" />
                <span className="text-[7px] text-slate-600">{internet.data?.issueCount ?? 0} hlásení</span>
              </div>
              {/* Issues first */}
              {internetIssues.length > 0 && (
                <div className="space-y-0.5 mb-1.5">
                  {internetIssues.map((s, i) => (
                    <div key={i} className={`flex items-center gap-2 rounded-lg px-2 py-1 border ${s.status === 'down' ? 'bg-red-500/8 border-red-500/15' : 'bg-amber-500/8 border-amber-500/15'}`}>
                      <span className="text-xs">{s.icon}</span>
                      <span className="text-[9px] font-semibold text-white flex-1">{s.name}</span>
                      <span className="text-[7px] text-slate-500">{s.reports > 0 ? `${s.reports} hlásení` : ''}</span>
                      <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold ${s.status === 'down' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>{s.status === 'down' ? '🔴 Down' : '🟡 Problémy'}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Compact grid of all services */}
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-0.5">
                {internetServices.map((s, i) => {
                  const dot = s.status === 'up' ? 'bg-green-400' : s.status === 'issues' ? 'bg-amber-400' : 'bg-red-400'
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5 rounded-md px-1 py-1 bg-white/[0.015] hover:bg-white/[0.04] transition-colors" title={`${s.name}: ${s.status}`}>
                      <span className="text-sm leading-none">{s.icon}</span>
                      <div className="flex items-center gap-0.5">
                        <span className={`w-1 h-1 rounded-full ${dot}`} />
                        <span className="text-[6px] text-slate-400 font-medium truncate max-w-[40px]">{s.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </Section>
      </div>
      <p className="text-[9px] text-slate-600 mt-3">Zdroje: Waze · RÚVZ · HaZZ · SSE/ZSE/VSE · DownDetector</p>
    </WidgetCard>
  )
}

function Section({ icon, title, count, color, children }: { icon: string; title: string; count: number; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{title}</span>
        {count > 0 && <span className={`text-[8px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full font-bold bg-${color}-500/15 text-${color}-300`}>{count}</span>}
        <div className="flex-1 h-px bg-white/5" />
      </div>
      {children}
    </div>
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
