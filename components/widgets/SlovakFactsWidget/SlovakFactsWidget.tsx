'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useLang } from '@/hooks/useLang'

interface SKFact {
  icon: string
  title: string
  value: string
  detail: string
}

interface SKFactsData {
  staticFacts: SKFact[]
  dynamicFacts: SKFact[]
  generalStats: {
    area: number
    population: number
    castles: number
    thermalSprings: number
    carsPerYear: number
    unescoSites: number
    nationalParks: number
    caves: number
  }
}

export default function SlovakFactsWidget() {
  const { t } = useLang()
  const { data, loading, refetch } = useWidget<SKFactsData>('/api/slovakfacts', 5 * 60 * 1000)
  const [tab, setTab] = useState<'static' | 'dynamic'>('dynamic')

  const facts = tab === 'static' ? data?.staticFacts : data?.dynamicFacts

  return (
    <WidgetCard accent="rose" title={t('facts.title')} icon="🇸🇰" onRefresh={refetch}>
      {/* Tab switcher */}
      <div className="flex items-center gap-1 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        <button
          onClick={() => setTab('dynamic')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
            tab === 'dynamic' ? 'bg-white/8 text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          📊 {t('facts.liveCounters')}
        </button>
        <button
          onClick={() => setTab('static')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
            tab === 'static' ? 'bg-white/8 text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          📌 {t('facts.factsAbout')}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : data && facts ? (
        <>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {(tab === 'dynamic' ? facts.slice(0, 6) : facts).map((fact, i) => (
              <div key={i} className="bg-white/[0.03] rounded-xl p-2.5 border border-white/5 hover:border-rose-500/20 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{fact.icon}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">{fact.title}</span>
                </div>
                <div className={`text-sm font-bold text-white ${tab === 'dynamic' ? 'tabular-nums' : ''}`}>{fact.value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{fact.detail}</div>
              </div>
            ))}
          </div>

          {/* Mini stats bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white/[0.03] rounded-xl p-2 text-[10px]">
            <span className="text-slate-500">🗺️ {data.generalStats.area.toLocaleString('sk-SK')} km²</span>
            <span className="text-slate-500">🏰 {data.generalStats.castles} {t('facts.castles')}</span>
            <span className="text-slate-500">♨️ {data.generalStats.thermalSprings.toLocaleString('sk-SK')} {t('facts.springs')}</span>
            <span className="text-slate-500">🚗 {(data.generalStats.carsPerYear / 1000000).toFixed(0)}M {t('facts.carsYear')}</span>
            <span className="text-slate-500">✝️ {data.generalStats.unescoSites} UNESCO</span>
          </div>
        </>
      ) : null}
      <p className="text-[10px] text-slate-600 mt-2">
        {tab === 'dynamic' ? t('facts.sourceCounters') : t('facts.sourceFacts')}
      </p>
    </WidgetCard>
  )
}
