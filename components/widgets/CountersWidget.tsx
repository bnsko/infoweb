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
  internetStats: { emailsSent: number; googleSearches: number; tweetsToday: number; websitesHacked: number }
  yearProgress: number
}

function formatNum(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

type Tab = 'sk' | 'world'

export default function CountersWidget() {
  const { t, lang } = useLang()
  const { data: factsData, loading: factsLoading, refetch: refetchFacts } = useWidget<SKFactsData>('/api/slovakfacts', 5 * 60 * 1000)
  const { data: metricsData, loading: metricsLoading, refetch: refetchMetrics } = useWidget<MetricsData>('/api/metrics', 5 * 60 * 1000)
  const [tab, setTab] = useState<Tab>('sk')

  const loading = factsLoading || metricsLoading
  const handleRefresh = () => { refetchFacts(); refetchMetrics() }

  return (
    <WidgetCard accent="rose" title={lang === 'sk' ? 'Živé počítadlá' : 'Live Counters'} icon="📊" onRefresh={handleRefresh}>
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        <button onClick={() => setTab('sk')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${tab === 'sk' ? 'bg-white/8 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
          🇸🇰 {lang === 'sk' ? 'Slovensko' : 'Slovakia'}
        </button>
        <button onClick={() => setTab('world')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${tab === 'world' ? 'bg-white/8 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
          🌍 {lang === 'sk' ? 'Svet' : 'World'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {tab === 'sk' && factsData && (
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
              <div className="flex flex-wrap items-center gap-3 bg-white/[0.03] rounded-xl p-2 text-[10px]">
                <span className="text-slate-500">🗺️ {factsData.generalStats.area.toLocaleString('sk-SK')} km²</span>
                <span className="text-slate-500">🏰 {factsData.generalStats.castles} {t('facts.castles')}</span>
                <span className="text-slate-500">♨️ {factsData.generalStats.thermalSprings.toLocaleString('sk-SK')} {t('facts.springs')}</span>
                <span className="text-slate-500">✝️ {factsData.generalStats.unescoSites} UNESCO</span>
              </div>
            </>
          )}

          {tab === 'world' && metricsData && (
            <>
              {/* Internet stats with explanations */}
              <div className="bg-cyan-500/8 border border-cyan-500/15 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🌐</span>
                  <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wide">
                    {lang === 'sk' ? 'Internet dnes (odhad)' : 'Internet today (estimate)'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <CounterBox icon="📧" label={lang === 'sk' ? 'Odoslané e-maily' : 'Emails sent'} value={formatNum(metricsData.internetStats.emailsSent)} color="text-blue-300" />
                  <CounterBox icon="🔍" label={lang === 'sk' ? 'Google vyhľadávania' : 'Google searches'} value={formatNum(metricsData.internetStats.googleSearches)} color="text-green-300" />
                  <CounterBox icon="💬" label={lang === 'sk' ? 'Príspevky na X (Twitter)' : 'Posts on X (Twitter)'} value={formatNum(metricsData.internetStats.tweetsToday)} color="text-sky-300" />
                  <CounterBox icon="🔓" label={lang === 'sk' ? 'Hacknuté weby' : 'Websites hacked'} value={formatNum(metricsData.internetStats.websitesHacked)} color="text-red-300" />
                </div>
                <p className="text-[9px] text-slate-600 mt-2 italic">
                  {lang === 'sk' ? '* Odhady na základe ročných štatistík Worldometer, Statista' : '* Estimates based on annual Worldometer, Statista statistics'}
                </p>
              </div>
              {/* Extra world metrics */}
              <div className="bg-purple-500/8 border border-purple-500/15 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🌍</span>
                  <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide">
                    {lang === 'sk' ? 'Svetové údaje' : 'World Facts'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <MetricBox label="CO₂ ppm" value="425" color="text-orange-300" />
                  <MetricBox label="Starlink" value="~6,700 🛰️" color="text-blue-300" />
                  <MetricBox label={lang === 'sk' ? 'Krajiny' : 'Countries'} value="195" color="text-emerald-300" />
                  <MetricBox label={lang === 'sk' ? 'Jazyky sveta' : 'Languages'} value="~7,100" color="text-amber-300" />
                  <MetricBox label={lang === 'sk' ? 'Oceány' : 'Oceans'} value="71% 🌊" color="text-cyan-300" />
                  <MetricBox label="Bitcoin nodes" value="~18k" color="text-amber-300" />
                </div>
              </div>
            </>
          )}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">
        {tab === 'sk' ? (lang === 'sk' ? 'Odhad zo štatistík SR' : 'Estimate from SK stats') : 'Worldometer · Statista'}
      </p>
    </WidgetCard>
  )
}

function CounterBox({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="bg-white/3 rounded-lg px-2 py-2">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-xs">{icon}</span>
        <span className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-sm font-mono font-bold ${color}`}>{value}</div>
    </div>
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
