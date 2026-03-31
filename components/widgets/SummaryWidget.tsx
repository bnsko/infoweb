'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

/* ── Traffic ── */
interface TrafficItem { title: string; link: string; description: string; pubDate: string; source: string }
interface TrafficStats { accidents: number; jams: number; closures: number; total: number; congestion: string }
interface GreenWave { active: boolean; corridors: { name: string; status: string }[]; note: string }
interface LiveMetrics { avgSpeedBA: number; avgSpeedD1: number; delayMinutes: number; trafficIndex: number; activeCameras: number }
interface TrafficData { items: TrafficItem[]; restrictions: TrafficItem[]; speedCameras: { road: string; location: string; type: string; limit: number }[]; stats?: TrafficStats; greenWave?: GreenWave; liveMetrics?: LiveMetrics }

/* ── Health Alerts ── */
interface HealthAlert { title: string; description: string; source: string; date: string; severity: 'low' | 'medium' | 'high'; category: string; link: string; region: 'sk' | 'world' }
interface HealthData { sk: HealthAlert[]; world: HealthAlert[]; alerts: HealthAlert[]; timestamp: number }

/* ── Emergency ── */
interface Dispatch { type: 'ambulance' | 'fire' | 'police'; event: string; location: string; time: string; status: string }
interface EmergencyData { dispatches: Dispatch[]; counts: Record<string, number>; timestamp: number }

/* ── Local Outages ── */
interface LocalOutage { type: string; title: string; location: string; city: string; since: string; until: string; provider: string; note: string }
interface LocalOutagesData { outages: LocalOutage[]; timestamp: number }

/* ── Internet / Social Outages (moved to separate widget) ── */

export default function SummaryWidget() {
  const { lang } = useLang()
  const [showAllTraffic, setShowAllTraffic] = useState(false)

  const [showAllEmergency, setShowAllEmergency] = useState(false)
  const [showAllOutages, setShowAllOutages] = useState(false)

  const traffic = useWidget<TrafficData>('/api/traffic', 2 * 60 * 1000)
  const health = useWidget<HealthData>('/api/health', 30 * 60 * 1000)
  const emergency = useWidget<EmergencyData>('/api/emergency', 5 * 60 * 1000)
  const localOutages = useWidget<LocalOutagesData>('/api/localoutages', 10 * 60 * 1000)

  const refetchAll = () => { traffic.refetch(); health.refetch(); emergency.refetch(); localOutages.refetch() }

  const trafficItems = traffic.data?.items ?? []
  const healthAlerts = [...(health.data?.sk ?? []), ...(health.data?.world ?? [])]
  const emergencyDispatches = emergency.data?.dispatches ?? []
  const outagesList = localOutages.data?.outages ?? []

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

              {/* Live metrics */}
              {traffic.data?.liveMetrics && (
                <div className="grid grid-cols-5 gap-1 mb-1">
                  <div className="text-center px-1 py-1 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="text-[11px] font-bold text-cyan-400">{traffic.data.liveMetrics.avgSpeedBA}</div>
                    <div className="text-[6px] text-slate-600">km/h BA</div>
                  </div>
                  <div className="text-center px-1 py-1 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="text-[11px] font-bold text-blue-400">{traffic.data.liveMetrics.avgSpeedD1}</div>
                    <div className="text-[6px] text-slate-600">km/h D1</div>
                  </div>
                  <div className="text-center px-1 py-1 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="text-[11px] font-bold text-amber-400">+{traffic.data.liveMetrics.delayMinutes}′</div>
                    <div className="text-[6px] text-slate-600">zdržanie</div>
                  </div>
                  <div className="text-center px-1 py-1 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="text-[11px] font-bold text-rose-400">{traffic.data.liveMetrics.trafficIndex}/10</div>
                    <div className="text-[6px] text-slate-600">index</div>
                  </div>
                  <div className="text-center px-1 py-1 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="text-[11px] font-bold text-slate-300">📹 {traffic.data.liveMetrics.activeCameras}</div>
                    <div className="text-[6px] text-slate-600">kamier</div>
                  </div>
                </div>
              )}

              {/* Green wave */}
              {traffic.data?.greenWave && (
                <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1 border ${traffic.data.greenWave.active ? 'bg-green-500/8 border-green-500/15' : 'bg-slate-500/5 border-white/5'}`}>
                  <span className="text-[10px]">{traffic.data.greenWave.active ? '🟢' : '⚪'}</span>
                  <span className={`text-[9px] font-bold ${traffic.data.greenWave.active ? 'text-green-400' : 'text-slate-500'}`}>Zelená vlna</span>
                  <span className="text-[8px] text-slate-500 flex-1">{traffic.data.greenWave.note}</span>
                  {traffic.data.greenWave.corridors.length > 0 && (
                    <div className="flex gap-1">
                      {traffic.data.greenWave.corridors.slice(0, 2).map((c, i) => (
                        <span key={i} className="text-[7px] bg-green-500/10 text-green-300 px-1.5 py-0.5 rounded-full">{c.name}</span>
                      ))}
                    </div>
                  )}
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
            <>
              {/* Severity summary */}
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 mb-1">
                {(() => {
                  const high = healthAlerts.filter(a => a.severity === 'high').length
                  const med = healthAlerts.filter(a => a.severity === 'medium').length
                  const low = healthAlerts.filter(a => a.severity === 'low').length
                  return (
                    <>
                      {high > 0 && <span className="text-[9px] font-bold text-red-400">‼️ {high} vysokých</span>}
                      {med > 0 && <span className="text-[9px] font-bold text-amber-400">⚠️ {med} stredných</span>}
                      {low > 0 && <span className="text-[9px] font-bold text-slate-400">ℹ️ {low} nízkych</span>}
                      <span className="flex-1" />
                      <span className="text-[8px] text-slate-500">{healthAlerts.filter(a => a.region === 'sk').length} SK · {healthAlerts.filter(a => a.region === 'world').length} svet</span>
                    </>
                  )
                })()}
              </div>
              <div className="space-y-0.5 max-h-[180px] overflow-y-auto scrollbar-hide">
                {healthAlerts.slice(0, 10).map((alert, i) => (
                  <a key={i} href={alert.link} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.03] transition-colors">
                    <span className={`text-[10px] mt-0.5 ${alert.severity === 'high' ? 'text-red-400' : alert.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {alert.severity === 'high' ? '‼️' : alert.severity === 'medium' ? '⚠️' : 'ℹ️'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-200 font-medium line-clamp-1">{alert.title}</p>
                      <p className="text-[8px] text-slate-500 line-clamp-1 mt-0.5">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[7px]">
                        <span className="text-slate-600">{alert.date}</span>
                        <span className="text-slate-600">{alert.source}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold ${alert.region === 'sk' ? 'bg-blue-500/15 text-blue-300' : 'bg-purple-500/15 text-purple-300'}`}>{alert.region === 'sk' ? '🇸🇰' : '🌍'}</span>
                      <span className="text-[7px] text-slate-600">{alert.category}</span>
                    </div>
                  </a>
                ))}
              </div>
            </>
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
                <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-hide">
                  {(showAllEmergency ? emergencyDispatches : emergencyDispatches.slice(0, 8)).map((d, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.03] transition-colors">
                      <span className="text-sm mt-0.5">{d.type === 'ambulance' ? '🚑' : d.type === 'fire' ? '🚒' : '🚔'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-slate-200 font-medium line-clamp-1">{d.event}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[8px] text-slate-500">📍 {d.location}</span>
                          <span className="text-[8px] text-slate-600">🕐 {d.time}</span>
                        </div>
                      </div>
                      <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${d.status === 'active' ? 'bg-red-500/15 text-red-300' : 'bg-green-500/15 text-green-300'}`}>{d.status === 'active' ? '🔴 Aktívny' : '✅ Vyriešený'}</span>
                    </div>
                  ))}
                  {emergencyDispatches.length > 8 && !showAllEmergency && (
                    <button onClick={() => setShowAllEmergency(true)} className="w-full text-center text-[9px] text-orange-400 hover:text-orange-300 py-0.5">+{emergencyDispatches.length - 8} ďalších ▼</button>
                  )}
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
            <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-hide">
              {(showAllOutages ? outagesList : outagesList.slice(0, 6)).map((o, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.03] transition-colors">
                  <span className="text-sm mt-0.5">{o.type === 'electricity' ? '⚡' : o.type === 'gas' ? '🔥' : o.type === 'water' ? '💧' : '🔇'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-200 font-medium line-clamp-1">{o.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] text-slate-500">📍 {o.city} · {o.location}</span>
                      <span className="text-[8px] text-slate-600">{o.provider}</span>
                    </div>
                    {(o.since || o.until) && (
                      <div className="flex items-center gap-2 mt-0.5 text-[7px] text-slate-600">
                        {o.since && <span>Od: {o.since}</span>}
                        {o.until && <span>Do: {o.until}</span>}
                      </div>
                    )}
                    {o.note && <p className="text-[7px] text-slate-600 mt-0.5 line-clamp-1">{o.note}</p>}
                  </div>
                </div>
              ))}
              {outagesList.length > 6 && !showAllOutages && (
                <button onClick={() => setShowAllOutages(true)} className="w-full text-center text-[9px] text-cyan-400 hover:text-cyan-300 py-0.5">+{outagesList.length - 6} ďalších ▼</button>
              )}
            </div>
          )}
        </Section>

      </div>
      <p className="text-[9px] text-slate-600 mt-3">Zdroje: Waze · RÚVZ · HaZZ · SSE/ZSE/VSE</p>
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
