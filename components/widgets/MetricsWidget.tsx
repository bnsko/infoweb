'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
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

type MetricTab = 'sk' | 'world'

export default function MetricsWidget() {
  const { data, loading, refetch } = useWidget<MetricsData>('/api/metrics', 5 * 60 * 1000)
  const [tab, setTab] = useState<MetricTab>('sk')
  const { t } = useLang()

  return (
    <WidgetCard accent="blue" className="h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="widget-title mb-0">
          <span>📊</span>
          <span>{t('metrics.title')}</span>
        </div>
        <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
          <button onClick={() => setTab('sk')} className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${tab === 'sk' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>🇸🇰 SK</button>
          <button onClick={() => setTab('world')} className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${tab === 'world' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}>🌍</button>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-10 rounded-lg" />)}
        </div>
      ) : data ? (
        <div className="space-y-3">
          {tab === 'sk' ? (
            <>
              {/* Sun data */}
              <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">☀️</span>
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">{t('metrics.sun')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MetricBox label={t('metrics.sunrise')} value={data.sunData.sunrise} color="text-amber-300" />
                  <MetricBox label={t('metrics.sunset')} value={data.sunData.sunset} color="text-orange-300" />
                  <MetricBox label={t('metrics.daylight')} value={`${Math.floor(data.sunData.daylightMinutes / 60)}h ${data.sunData.daylightMinutes % 60}m`} color="text-yellow-300" />
                </div>
              </div>

              {/* Year progress */}
              <div className="bg-white/3 rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">📅 {t('nameday.year')} {new Date().getFullYear()}</span>
                  <span className="text-xs font-bold text-slate-300">{data.yearProgress}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${data.yearProgress}%` }} />
                </div>
              </div>

              {/* Wiki top articles with links */}
              {data.wikiTopArticles.length > 0 && (
                <div className="bg-white/3 rounded-xl p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">📖</span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{t('metrics.wikiTitle')}</span>
                  </div>
                  <div className="space-y-1">
                    {data.wikiTopArticles.map((a, i) => (
                      <a
                        key={i}
                        href={`https://sk.wikipedia.org/wiki/${encodeURIComponent(a.title.replace(/ /g, '_'))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between py-0.5 hover:bg-white/3 rounded px-1 -mx-1 transition-colors group"
                      >
                        <span className="text-[11px] text-slate-300 group-hover:text-white truncate flex-1 mr-2">{i + 1}. {a.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{formatNum(a.views)}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Internet stats */}
              <div className="bg-cyan-500/8 border border-cyan-500/15 rounded-xl p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">🌐</span>
                  <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wide">{t('metrics.internet')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <MetricBox label={t('metrics.emails')} value={formatNum(data.internetStats.emailsSent)} color="text-blue-300" />
                  <MetricBox label={t('metrics.google')} value={formatNum(data.internetStats.googleSearches)} color="text-green-300" />
                  <MetricBox label={t('metrics.tweets')} value={formatNum(data.internetStats.tweetsToday)} color="text-sky-300" />
                  <MetricBox label={t('metrics.hacked')} value={formatNum(data.internetStats.websitesHacked)} color="text-red-300" />
                </div>
              </div>

              {/* Year progress (also shown in world) */}
              <div className="bg-white/3 rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">📅 {t('nameday.year')} {new Date().getFullYear()}</span>
                  <span className="text-xs font-bold text-slate-300">{data.yearProgress}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${data.yearProgress}%` }} />
                </div>
              </div>

              {/* World facts */}
              <div className="bg-purple-500/8 border border-purple-500/15 rounded-xl p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">🌍</span>
                  <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide">World Live</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <MetricBox label="CO₂ ppm" value="425" color="text-orange-300" />
                  <MetricBox label="Bitcoin nodes" value="~18k" color="text-amber-300" />
                  <MetricBox label="DNS queries/s" value="~150k" color="text-cyan-300" />
                  <MetricBox label="Starlink sats" value="~6,400" color="text-blue-300" />
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-500">{t('noData')}</p>
      )}
      <p className="text-[10px] text-slate-600 mt-2">OpenMeteo · Wikimedia · obnova 5 min</p>
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
