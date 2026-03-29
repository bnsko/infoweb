'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useState } from 'react'

interface Fact {
  icon: string
  title: string
  value: string
  detail: string
}

interface FactsData {
  staticFacts: Fact[]
  dynamicFacts: Fact[]
  generalStats: Record<string, number>
  dayOfYear: number
}

export default function SlovakFactsWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<FactsData>('/api/slovakfacts', 60 * 1000)
  const [tab, setTab] = useState<'live' | 'facts'>('live')

  const dynamic = data?.dynamicFacts ?? []
  const statics = data?.staticFacts ?? []

  return (
    <WidgetCard
      accent="orange"
      title={lang === 'sk' ? 'Slovensko v číslach' : 'Slovakia in Numbers'}
      icon="🇸🇰"
      onRefresh={refetch}
      headerRight={
        <div className="flex gap-1">
          {(['live', 'facts'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold transition-colors ${tab === t ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500 hover:text-slate-300'}`}>
              {t === 'live' ? (lang === 'sk' ? '⚡ Živé' : '⚡ Live') : (lang === 'sk' ? '📊 Fakty' : '📊 Facts')}
            </button>
          ))}
        </div>
      }
    >
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && data && (
        <div className="space-y-1">
          {tab === 'live' ? (
            <>
              <p className="text-[9px] text-amber-400/60 uppercase tracking-widest font-bold mb-2">
                {lang === 'sk' ? 'Dnes na Slovensku (v reálnom čase)' : 'Today in Slovakia (real time)'}
              </p>
              {dynamic.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span className="text-base w-6 text-center">{f.icon}</span>
                  <span className="text-[11px] text-slate-400 flex-1">{f.title}</span>
                  <span className="text-[12px] font-bold text-white tabular-nums">{f.value}</span>
                </div>
              ))}
            </>
          ) : (
            <>
              <p className="text-[9px] text-amber-400/60 uppercase tracking-widest font-bold mb-2">
                {lang === 'sk' ? 'Zaujímavé fakty o Slovensku' : 'Interesting facts about Slovakia'}
              </p>
              {statics.map((f, i) => (
                <div key={i} className="px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{f.icon}</span>
                    <span className="text-[11px] font-semibold text-slate-200">{f.title}</span>
                    <span className="text-[11px] font-bold text-amber-300 ml-auto">{f.value}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-0.5 pl-8">{f.detail}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </WidgetCard>
  )
}
