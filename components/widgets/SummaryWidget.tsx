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

type Tab = 'traffic' | 'health' | 'emergency' | 'outages'

const TAB_CONFIG: { key: Tab; icon: string; sk: string; en: string }[] = [
  { key: 'traffic', icon: '🚗', sk: 'Doprava', en: 'Traffic' },
  { key: 'health', icon: '⚕️', sk: 'Výstrahy', en: 'Alerts' },
  { key: 'emergency', icon: '🚨', sk: 'Zásahy', en: 'Emergency' },
  { key: 'outages', icon: '⚡', sk: 'Výpadky', en: 'Outages' },
]

function formatTime(iso: string): string {
  if (!iso) return ''
  try { return new Date(iso).toLocaleString('sk-SK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

function getTrafficIcon(title: string): string {
  if (title.includes('🚗')) return '🚗'
  if (title.includes('🚦')) return '🚦'
  if (title.includes('🚧')) return '🚧'
  return '⚠️'
}

export default function SummaryWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('traffic')

  const traffic = useWidget<TrafficData>('/api/traffic', 2 * 60 * 1000)
  const health = useWidget<HealthData>('/api/health', 30 * 60 * 1000)
  const emergency = useWidget<EmergencyData>('/api/emergency', 5 * 60 * 1000)
  const localOutages = useWidget<LocalOutagesData>('/api/localoutages', 10 * 60 * 1000)

  const refetchAll = () => { traffic.refetch(); health.refetch(); emergency.refetch(); localOutages.refetch() }

  const trafficCount = traffic.data?.items?.length ?? 0
  const healthCount = (health.data?.sk?.length ?? 0) + (health.data?.world?.length ?? 0)
  const emergencyCount = emergency.data?.dispatches?.length ?? 0
  const outagesCount = localOutages.data?.outages?.length ?? 0

  const badges: Record<Tab, number> = { traffic: trafficCount, health: healthCount, emergency: emergencyCount, outages: outagesCount }

  return (
    <WidgetCard accent="rose" title={lang === 'sk' ? 'Súhrnný prehľad' : 'Summary'} icon="📋" onRefresh={refetchAll}>
      {/* Tabs */}
      <div className="flex gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TAB_CONFIG.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === t.key ? 'bg-rose-500/15 text-rose-300' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{lang === 'sk' ? t.sk : t.en}</span>
            {badges[t.key] > 0 && <span className="text-[8px] opacity-60">({badges[t.key]})</span>}
          </button>
        ))}
      </div>

      {/* Traffic tab */}
      {tab === 'traffic' && (
        <>
          {traffic.loading && <SkeletonRows rows={4} />}
          {!traffic.loading && traffic.data && (
            <>
              {traffic.data.stats && (
                <div className="flex flex-wrap items-center gap-2 mb-2 px-1">
                  <CongestionBadge level={traffic.data.stats.congestion} lang={lang} />
                  <span className="text-[9px] text-slate-500">🚗 {traffic.data.stats.accidents} · 🚦 {traffic.data.stats.jams} · 🚧 {traffic.data.stats.closures}</span>
                </div>
              )}
              <div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-hide">
                {traffic.data.items.length === 0 ? (
                  <div className="text-center py-4"><span className="text-xl">✅</span><p className="text-[10px] text-slate-500 mt-1">Bez udalostí</p></div>
                ) : traffic.data.items.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-2 rounded-lg p-1.5 widget-item-hover group">
                    <span className="text-sm shrink-0 mt-0.5">{getTrafficIcon(item.title)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-slate-200 leading-snug line-clamp-2 group-hover:text-white">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-rose-400/70 font-medium">{item.source}</span>
                        {item.pubDate && <span className="text-[9px] text-slate-600">{formatTime(item.pubDate)}</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Health Alerts tab */}
      {tab === 'health' && (
        <>
          {health.loading && <SkeletonRows rows={4} />}
          {!health.loading && health.data && (
            <div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-hide">
              {[...(health.data.sk ?? []), ...(health.data.world ?? [])].length === 0 ? (
                <div className="text-center py-4"><span className="text-xl">✅</span><p className="text-[10px] text-slate-500 mt-1">Žiadne výstrahy</p></div>
              ) : [...(health.data.sk ?? []), ...(health.data.world ?? [])].slice(0, 8).map((alert, i) => (
                <a key={i} href={alert.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-2 rounded-lg p-1.5 widget-item-hover group">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold shrink-0 mt-0.5 ${
                    alert.severity === 'high' ? 'bg-red-500/15 text-red-300' :
                    alert.severity === 'medium' ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                  }`}>{alert.severity === 'high' ? '‼️' : alert.severity === 'medium' ? '⚠️' : 'ℹ️'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-200 leading-snug line-clamp-2 group-hover:text-white">{alert.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-slate-500">{alert.source}</span>
                      <span className={`text-[8px] px-1 rounded ${alert.region === 'sk' ? 'text-blue-400' : 'text-slate-500'}`}>
                        {alert.region === 'sk' ? '🇸🇰' : '🌍'}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      )}

      {/* Emergency tab */}
      {tab === 'emergency' && (
        <>
          {emergency.loading && <SkeletonRows rows={4} />}
          {!emergency.loading && emergency.data && (
            <div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-hide">
              {emergency.data.dispatches.length === 0 ? (
                <div className="text-center py-4"><span className="text-xl">✅</span><p className="text-[10px] text-slate-500 mt-1">Žiadne zásahy</p></div>
              ) : emergency.data.dispatches.map((d, i) => {
                const typeMap = { ambulance: { icon: '🚑', color: 'text-red-400' }, fire: { icon: '🚒', color: 'text-orange-400' }, police: { icon: '🚔', color: 'text-blue-400' } }
                const tm = typeMap[d.type] ?? { icon: '🚨', color: 'text-slate-400' }
                return (
                  <div key={i} className="flex items-start gap-2 rounded-lg p-1.5 widget-item-hover">
                    <span className="text-sm shrink-0 mt-0.5">{tm.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-slate-200 leading-snug line-clamp-2">{d.event}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-slate-500">📍 {d.location}</span>
                        <span className="text-[9px] text-slate-600">{d.time}</span>
                      </div>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
                      d.status === 'aktívny' ? 'bg-red-500/15 text-red-300' :
                      d.status === 'na ceste' ? 'bg-yellow-500/15 text-yellow-300' : 'bg-green-500/15 text-green-300'
                    }`}>{d.status}</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Local Outages tab */}
      {tab === 'outages' && (
        <>
          {localOutages.loading && <SkeletonRows rows={3} />}
          {!localOutages.loading && localOutages.data && (
            <div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-hide">
              {localOutages.data.outages.length === 0 ? (
                <div className="text-center py-4"><span className="text-xl">✅</span><p className="text-[10px] text-emerald-400 mt-1">Žiadne výpadky</p></div>
              ) : localOutages.data.outages.map((o, i) => {
                const typeIcon = o.type === 'electricity' ? '⚡' : o.type === 'construction' ? '🚧' : '🔇'
                return (
                  <div key={i} className="flex items-start gap-2 rounded-lg p-1.5 widget-item-hover">
                    <span className="text-sm shrink-0 mt-0.5">{typeIcon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-slate-200 leading-snug line-clamp-2">{o.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-slate-500">📍 {o.city}</span>
                        {o.since && <span className="text-[9px] text-slate-600">{o.since} – {o.until}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

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
    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: info.color + '20', color: info.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: info.color }} />
      {info.label}
    </span>
  )
}
