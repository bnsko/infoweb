'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface SKFact { icon: string; title: string; value: string; detail: string }
interface SKFactsData {
  staticFacts: SKFact[]
  dynamicFacts: SKFact[]
  generalStats: {
    area: number; population: number; castles: number; thermalSprings: number;
    carsPerYear: number; unescoSites: number; nationalParks: number; caves: number
  }
}
interface MetricsData {
  wikiTopArticles: { title: string; views: number }[]
  sunData: { sunrise: string; sunset: string; daylightMinutes: number }
  internetStats: { emailsSent: number; googleSearches: number; tweetsToday: number; websitesHacked: number }
  yearProgress: number
}

function formatNum(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

type Tab = 'counters' | 'facts' | 'world' | 'wiki'

export default function FactsMetricsWidget() {
  const { t, lang } = useLang()
  const { data: factsData, loading: factsLoading, refetch: refetchFacts } = useWidget<SKFactsData>('/api/slovakfacts', 5 * 60 * 1000)
  const { data: metricsData, loading: metricsLoading, refetch: refetchMetrics } = useWidget<MetricsData>('/api/metrics', 5 * 60 * 1000)
  const [tab, setTab] = useState<Tab>('counters')

  const loading = factsLoading || metricsLoading

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: 'counters', icon: '📊', label: lang === 'sk' ? 'Počítadlá' : 'Counters' },
    { key: 'facts', icon: '🇸🇰', label: lang === 'sk' ? 'Fakty SR' : 'SK Facts' },
    { key: 'world', icon: '🌍', label: lang === 'sk' ? 'Svet' : 'World' },
    { key: 'wiki', icon: '📖', label: 'Wiki' },
  ]

  const handleRefresh = () => { refetchFacts(); refetchMetrics() }

  return (
    <WidgetCard accent="rose" title={lang === 'sk' ? 'Zaujímavosti & Metriky' : 'Facts & Metrics'} icon="🔮" onRefresh={handleRefresh}>
      {/* Tab switcher */}
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5 overflow-x-auto scrollbar-hide">
        {tabs.map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all whitespace-nowrap px-2 ${
              tab === tb.key ? 'bg-white/8 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {/* TAB: Live counters (from Slovak facts) */}
          {tab === 'counters' && factsData && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {factsData.dynamicFacts.slice(0, 6).map((fact, i) => (
                  <div key={i} className="bg-white/[0.03] rounded-xl p-2.5 border border-white/5 hover:border-rose-500/20 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{fact.icon}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">{fact.title}</span>
                    </div>
                    <div className="text-sm font-bold text-white tabular-nums">{fact.value}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{fact.detail}</div>
                  </div>
                ))}
              </div>
              {/* Mini stats bar */}
              <div className="flex flex-wrap items-center gap-3 bg-white/[0.03] rounded-xl p-2 text-[10px]">
                <span className="text-slate-500">🗺️ {factsData.generalStats.area.toLocaleString('sk-SK')} km²</span>
                <span className="text-slate-500">🏰 {factsData.generalStats.castles} {t('facts.castles')}</span>
                <span className="text-slate-500">♨️ {factsData.generalStats.thermalSprings.toLocaleString('sk-SK')} {t('facts.springs')}</span>
                <span className="text-slate-500">✝️ {factsData.generalStats.unescoSites} UNESCO</span>
              </div>
            </>
          )}

          {/* TAB: SK Facts */}
          {tab === 'facts' && factsData && (
            <div className="grid grid-cols-2 gap-2">
              {factsData.staticFacts.map((fact, i) => (
                <div key={i} className="bg-white/[0.03] rounded-xl p-2.5 border border-white/5 hover:border-rose-500/20 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{fact.icon}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">{fact.title}</span>
                  </div>
                  <div className="text-sm font-bold text-white">{fact.value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{fact.detail}</div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: World metrics */}
          {tab === 'world' && metricsData && (
            <>
              {/* Sun data */}
              <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">☀️</span>
                  <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide">{t('metrics.sun')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MetricBox label={t('metrics.sunrise')} value={metricsData.sunData.sunrise} color="text-amber-300" />
                  <MetricBox label={t('metrics.sunset')} value={metricsData.sunData.sunset} color="text-orange-300" />
                  <MetricBox label={t('metrics.daylight')} value={`${Math.floor(metricsData.sunData.daylightMinutes / 60)}h ${metricsData.sunData.daylightMinutes % 60}m`} color="text-yellow-300" />
                </div>
              </div>
              {/* Internet stats */}
              <div className="bg-cyan-500/8 border border-cyan-500/15 rounded-xl p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">🌐</span>
                  <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wide">{t('metrics.internet')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <MetricBox label={t('metrics.emails')} value={formatNum(metricsData.internetStats.emailsSent)} color="text-blue-300" />
                  <MetricBox label={t('metrics.google')} value={formatNum(metricsData.internetStats.googleSearches)} color="text-green-300" />
                  <MetricBox label={t('metrics.tweets')} value={formatNum(metricsData.internetStats.tweetsToday)} color="text-sky-300" />
                  <MetricBox label={t('metrics.hacked')} value={formatNum(metricsData.internetStats.websitesHacked)} color="text-red-300" />
                </div>
              </div>
              {/* Extra world metrics */}
              <div className="bg-purple-500/8 border border-purple-500/15 rounded-xl p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm">🌍</span>
                  <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide">{lang === 'sk' ? 'Svetové údaje' : 'World Data'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <MetricBox label="CO₂ ppm" value="425" color="text-orange-300" />
                  <MetricBox label="Starlink sats" value="~6,700" color="text-blue-300" />
                  <MetricBox label={lang === 'sk' ? 'Krajiny sveta' : 'Countries'} value="195" color="text-emerald-300" />
                  <MetricBox label={lang === 'sk' ? 'Jazyky' : 'Languages'} value="~7,100" color="text-amber-300" />
                  <MetricBox label={lang === 'sk' ? 'Oceány' : 'Oceans'} value="71% 🌊" color="text-cyan-300" />
                  <MetricBox label="Bitcoin nodes" value="~18k" color="text-amber-300" />
                </div>
              </div>
              {/* Year progress */}
              <div className="bg-white/3 rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">📅 {t('nameday.year')} {new Date().getFullYear()}</span>
                  <span className="text-xs font-bold text-slate-300">{metricsData.yearProgress}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${metricsData.yearProgress}%` }} />
                </div>
              </div>
            </>
          )}

          {/* TAB: Wikipedia */}
          {tab === 'wiki' && metricsData && (
            <>
              {metricsData.wikiTopArticles.length > 0 ? (
                <div className="bg-white/3 rounded-xl p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm">📖</span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{t('metrics.wikiTitle')}</span>
                  </div>
                  <div className="space-y-1">
                    {metricsData.wikiTopArticles.map((a, i) => (
                      <a
                        key={i}
                        href={`https://sk.wikipedia.org/wiki/${encodeURIComponent(a.title.replace(/ /g, '_'))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between py-1 hover:bg-white/3 rounded px-1.5 -mx-1 transition-colors group"
                      >
                        <span className="text-[11px] text-slate-300 group-hover:text-white truncate flex-1 mr-2">{i + 1}. {a.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{formatNum(a.views)} {lang === 'sk' ? 'zobrazení' : 'views'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">{t('noData')}</p>
              )}
              {/* Year progress */}
              <div className="bg-white/3 rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">📅 {t('nameday.year')} {new Date().getFullYear()}</span>
                  <span className="text-xs font-bold text-slate-300">{metricsData.yearProgress}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${metricsData.yearProgress}%` }} />
                </div>
              </div>
            </>
          )}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">
        {tab === 'counters' ? (lang === 'sk' ? 'Odhad zo štatistík SR' : 'Estimate from SK statistics') :
         tab === 'facts' ? (lang === 'sk' ? 'Zaujímavosti o SR' : 'Facts about SK') :
         tab === 'world' ? 'OpenMeteo · Worldometer' : 'Wikimedia · SK Wikipedia'}
      </p>
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
