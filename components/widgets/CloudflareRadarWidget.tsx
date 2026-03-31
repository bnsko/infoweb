'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface ServiceStatus { name: string; icon: string; category: string; status: string; latency: number; uptime30d: number; lastIncident: string | null }
interface Attacks { ddos: number; botTraffic: number; threats: number }
interface Protocols { http3: number; tls13: number; ipv6: number }
interface TopCountry { country: string; pct: number }
interface Trends { httpTraffic: string; httpTrafficChange: number; dnsQueries: string; attacks: Attacks; protocols: Protocols; topCountries: TopCountry[] }
interface RecentOutage { service: string; time: string; duration: string; resolved: boolean }
interface RadarData { services: ServiceStatus[]; trends: Trends; recentOutages: RecentOutage[]; timestamp: number }

export default function CloudflareRadarWidget() {
  const { data, loading, refetch } = useWidget<RadarData>('/api/cloudflareradar', 5 * 60 * 1000)

  const statusDot = (s: string) => s === 'operational' ? 'bg-green-400' : s === 'degraded' ? 'bg-amber-400' : 'bg-red-400'

  return (
    <WidgetCard accent="blue" title="Internet Radar" icon="📡" onRefresh={refetch}>
      {loading && <SkeletonRows rows={8} />}
      {!loading && data && (
        <div className="space-y-3">
          {/* Global trends */}
          <div className="grid grid-cols-3 gap-1">
            <div className="text-center px-1 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[11px] font-bold text-blue-400">{data.trends.httpTrafficChange > 0 ? '+' : ''}{data.trends.httpTrafficChange}%</div>
              <div className="text-[7px] text-slate-600">HTTP traffic</div>
            </div>
            <div className="text-center px-1 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[11px] font-bold text-red-400">{data.trends.attacks.ddos.toLocaleString('sk-SK')}</div>
              <div className="text-[7px] text-slate-600">DDoS útoky</div>
            </div>
            <div className="text-center px-1 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[11px] font-bold text-cyan-400">{data.trends.dnsQueries}</div>
              <div className="text-[7px] text-slate-600">DNS dotazy</div>
            </div>
          </div>

          {/* Protocols */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-[9px] text-slate-500">Protokoly:</span>
            <span className="text-[8px] text-blue-300">HTTP/3 {data.trends.protocols.http3}%</span>
            <span className="text-[8px] text-green-300">TLS 1.3 {data.trends.protocols.tls13}%</span>
            <span className="text-[8px] text-purple-300">IPv6 {data.trends.protocols.ipv6}%</span>
          </div>

          {/* Cloud services grid */}
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1">☁️ Cloud & CDN</div>
            <div className="grid grid-cols-4 gap-1">
              {data.services.map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-lg bg-white/[0.015] border border-white/5" title={`${s.name}: ${s.status} · ${s.latency}ms · ${s.uptime30d}% uptime`}>
                  <span className="text-sm">{s.icon}</span>
                  <div className="flex items-center gap-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot(s.status)}`} />
                    <span className="text-[7px] text-slate-400 truncate max-w-[50px]">{s.name}</span>
                  </div>
                  <span className="text-[7px] text-slate-600">{s.latency}ms</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent outages */}
          {data.recentOutages.length > 0 && (
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1">🔴 Posledné výpadky</div>
              <div className="space-y-0.5">
                {data.recentOutages.map((o, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-white font-medium">{o.service}</span>
                    <span className="text-[8px] text-slate-500">{o.time}</span>
                    <span className="text-[8px] text-amber-400">{o.duration}</span>
                    <span className={`ml-auto text-[7px] px-1.5 py-0.5 rounded-full font-bold ${o.resolved ? 'bg-green-500/15 text-green-300' : 'bg-red-500/15 text-red-300'}`}>
                      {o.resolved ? '✅' : '🔴'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top traffic countries */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {data.trends.topCountries.map((c, i) => (
              <span key={i} className="text-[7px] bg-white/[0.03] border border-white/5 rounded px-1.5 py-0.5 text-slate-400">
                {c.country} <span className="text-blue-400 font-bold">{c.pct}%</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">Cloudflare Radar · Simulácia · 5 min</p>
    </WidgetCard>
  )
}
