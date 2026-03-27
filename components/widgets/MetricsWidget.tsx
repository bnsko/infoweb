'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'

interface MetricsData {
  wikiTopArticles: { title: string; views: number }[]
  sunData: { sunrise: string; sunset: string; daylightMinutes: number }
  internetStats: {
    emailsSent: number
    googleSearches: number
    tweetsToday: number
    websitesHacked: number
  }
  yearProgress: number
}

function formatNum(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export default function MetricsWidget() {
  const { data, loading, refetch } = useWidget<MetricsData>('/api/metrics', 5 * 60 * 1000)

  return (
    <WidgetCard accent="blue" title="Zaujímavé metriky" icon="📊" className="h-full" onRefresh={refetch}>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton h-10 rounded-lg" />)}
        </div>
      ) : data ? (
        <div className="space-y-3">
          {/* Sun data */}
          <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">☀️</span>
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">Slnko · Bratislava</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MetricBox label="Východ" value={data.sunData.sunrise} color="text-amber-300" />
              <MetricBox label="Západ" value={data.sunData.sunset} color="text-orange-300" />
              <MetricBox label="Deň" value={`${Math.floor(data.sunData.daylightMinutes / 60)}h ${data.sunData.daylightMinutes % 60}m`} color="text-yellow-300" />
            </div>
          </div>

          {/* Year progress */}
          <div className="bg-white/3 rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">📅 Rok {new Date().getFullYear()}</span>
              <span className="text-xs font-bold text-slate-300">{data.yearProgress}%</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${data.yearProgress}%` }} />
            </div>
          </div>

          {/* Internet stats */}
          <div className="bg-cyan-500/8 border border-cyan-500/15 rounded-xl p-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm">🌐</span>
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wide">Internet dnes</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MetricBox label="E-maily" value={formatNum(data.internetStats.emailsSent)} color="text-blue-300" />
              <MetricBox label="Google" value={formatNum(data.internetStats.googleSearches)} color="text-green-300" />
              <MetricBox label="Tweety" value={formatNum(data.internetStats.tweetsToday)} color="text-sky-300" />
              <MetricBox label="Hacknutých" value={formatNum(data.internetStats.websitesHacked)} color="text-red-300" />
            </div>
          </div>

          {/* Wiki top articles */}
          {data.wikiTopArticles.length > 0 && (
            <div className="bg-white/3 rounded-xl p-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">📖</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Top SK Wikipédia včera</span>
              </div>
              <div className="space-y-1">
                {data.wikiTopArticles.map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5">
                    <span className="text-[11px] text-slate-300 truncate flex-1 mr-2">{i + 1}. {a.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{formatNum(a.views)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-500">Dáta nedostupné</p>
      )}
      <p className="text-[10px] text-slate-600 mt-2">Rôzne zdroje · obnova 5 min</p>
    </WidgetCard>
  )
}

function MetricBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/3 rounded-lg px-2 py-1.5">
      <div className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</div>
      <div className={`text-[11px] font-mono font-bold mt-0.5 ${color}`}>{value}</div>
    </div>
  )
}
