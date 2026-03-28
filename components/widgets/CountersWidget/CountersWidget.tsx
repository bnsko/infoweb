'use client'

import { useState, useEffect, useRef } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface SKFact { icon: string; title: string; value: string; detail: string }
interface SKFactsData {
  staticFacts: SKFact[]
  dynamicFacts: SKFact[]
  generalStats: {
    area: number; population: number; castles: number; thermalSprings: number
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
  return String(Math.round(n))
}

// Animated number component
function AnimatedNum({ target, prefix = '', suffix = '' }: { target: string; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    if (prevRef.current !== target) {
      setDisplay(target)
      prevRef.current = target
    }
  }, [target])

  return <span className="anim-count-up">{prefix}{display}{suffix}</span>
}

type Tab = 'sk' | 'world'

// World stats - fascinating live counters
function getWorldCounters(lang: string): { icon: string; label: string; value: string; color: string; detail: string }[] {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const elapsed = (now.getTime() - startOfDay) / 86400000 // fraction of day

  return [
    { icon: '📧', label: lang === 'sk' ? 'E-maily dnes' : 'Emails today', value: formatNum(Math.round(350_000_000_000 * elapsed)), color: 'text-blue-300', detail: '~350B/day' },
    { icon: '🔍', label: lang === 'sk' ? 'Google hľadania' : 'Google searches', value: formatNum(Math.round(8_500_000_000 * elapsed)), color: 'text-green-300', detail: '~8.5B/day' },
    { icon: '📱', label: lang === 'sk' ? 'Tweety dnes' : 'Tweets today', value: formatNum(Math.round(500_000_000 * elapsed)), color: 'text-sky-300', detail: '~500M/day' },
    { icon: '📺', label: lang === 'sk' ? 'YouTube videá' : 'YouTube videos', value: formatNum(Math.round(720_000 * elapsed)), color: 'text-red-300', detail: lang === 'sk' ? 'nahrané dnes' : 'uploaded today' },
    { icon: '🔓', label: lang === 'sk' ? 'Hacknuté stránky' : 'Websites hacked', value: formatNum(Math.round(30_000 * elapsed)), color: 'text-orange-300', detail: '~30k/day' },
    { icon: '🤖', label: lang === 'sk' ? 'AI požiadavky' : 'AI requests', value: formatNum(Math.round(2_000_000_000 * elapsed)), color: 'text-purple-300', detail: '~2B/day' },
    { icon: '🛒', label: lang === 'sk' ? 'Online nákupy' : 'Online purchases', value: formatNum(Math.round(6_000_000_000 * elapsed)), color: 'text-emerald-300', detail: '$6B/day' },
    { icon: '📸', label: lang === 'sk' ? 'Instagram fotky' : 'Instagram photos', value: formatNum(Math.round(95_000_000 * elapsed)), color: 'text-pink-300', detail: '~95M/day' },
    { icon: '🌍', label: 'CO₂ ppm', value: '425', color: 'text-amber-300', detail: lang === 'sk' ? 'atmosférické' : 'atmospheric' },
    { icon: '🛰️', label: 'Starlink', value: '~6,800', color: 'text-blue-300', detail: lang === 'sk' ? 'satelity na orbite' : 'satellites in orbit' },
    { icon: '🌐', label: lang === 'sk' ? 'Webové stránky' : 'Websites', value: '~2B', color: 'text-cyan-300', detail: lang === 'sk' ? 'na internete' : 'on internet' },
    { icon: '💾', label: lang === 'sk' ? 'Dáta vytvorené' : 'Data created', value: formatNum(Math.round(2_500_000_000_000_000_000 * elapsed / 1e18)) + 'EB', color: 'text-violet-300', detail: '~2.5 EB/day' },
    { icon: '🗣️', label: lang === 'sk' ? 'Jazyky sveta' : 'World languages', value: '~7,100', color: 'text-amber-300', detail: '' },
    { icon: '⚡', label: lang === 'sk' ? 'Blesky dnes' : 'Lightning today', value: formatNum(Math.round(8_000_000 * elapsed)), color: 'text-yellow-300', detail: '~8M/day' },
    { icon: '🌊', label: lang === 'sk' ? 'Oceány pokrývajú' : 'Oceans cover', value: '71%', color: 'text-cyan-300', detail: lang === 'sk' ? 'povrchu Zeme' : 'of Earth' },
  ]
}

// Slovakia stats
function getSlovakCounters(lang: string): { icon: string; label: string; value: string; color: string; detail: string }[] {
  return [
    { icon: '👥', label: lang === 'sk' ? 'Obyvateľov' : 'Population', value: '5,460,000', color: 'text-blue-300', detail: '2026 est.' },
    { icon: '🗺️', label: lang === 'sk' ? 'Rozloha' : 'Area', value: '49,035 km²', color: 'text-emerald-300', detail: '' },
    { icon: '🏰', label: lang === 'sk' ? 'Hrady a zámky' : 'Castles', value: '180+', color: 'text-amber-300', detail: lang === 'sk' ? 'zachovaných' : 'preserved' },
    { icon: '♨️', label: lang === 'sk' ? 'Termálne pramene' : 'Thermal springs', value: '1,500+', color: 'text-orange-300', detail: '' },
    { icon: '⛰️', label: lang === 'sk' ? 'Najvyšší bod' : 'Highest point', value: '2,655 m', color: 'text-cyan-300', detail: 'Gerlachovský štít' },
    { icon: '🏞️', label: lang === 'sk' ? 'Národné parky' : 'National parks', value: '9', color: 'text-green-300', detail: 'TANAP, Pieniny...' },
    { icon: '✝️', label: 'UNESCO', value: '8', color: 'text-purple-300', detail: lang === 'sk' ? 'svetové dedičstvo' : 'world heritage' },
    { icon: '🕳️', label: lang === 'sk' ? 'Jaskyne' : 'Caves', value: '7,000+', color: 'text-slate-300', detail: lang === 'sk' ? 'objavených' : 'discovered' },
    { icon: '🚗', label: lang === 'sk' ? 'Autá vyrobené/rok' : 'Cars made/year', value: '~1.1M', color: 'text-red-300', detail: lang === 'sk' ? '#1 na obyvateľa' : '#1 per capita' },
    { icon: '🍺', label: lang === 'sk' ? 'Spotreba piva' : 'Beer consumption', value: '73 l', color: 'text-amber-300', detail: lang === 'sk' ? 'na osobu/rok' : 'per person/year' },
    { icon: '🎓', label: lang === 'sk' ? 'Univerzity' : 'Universities', value: '35', color: 'text-blue-300', detail: lang === 'sk' ? 'verejné a súkromné' : 'public & private' },
    { icon: '🏥', label: lang === 'sk' ? 'Nemocnice' : 'Hospitals', value: '86', color: 'text-emerald-300', detail: '' },
    { icon: '✈️', label: lang === 'sk' ? 'Letiská' : 'Airports', value: '6', color: 'text-sky-300', detail: 'BA, KE, PO, SL, ZA, PP' },
    { icon: '🚂', label: lang === 'sk' ? 'Železničné stanice' : 'Railway stations', value: '800+', color: 'text-orange-300', detail: '3,600 km tratí' },
    { icon: '📱', label: lang === 'sk' ? 'Internet penetrácia' : 'Internet penetration', value: '92%', color: 'text-cyan-300', detail: '' },
  ]
}

export default function CountersWidget() {
  const { lang } = useLang()
  const { refetch: refetchFacts } = useWidget<SKFactsData>('/api/slovakfacts', 5 * 60 * 1000)
  const { refetch: refetchMetrics } = useWidget<MetricsData>('/api/metrics', 5 * 60 * 1000)
  const [tab, setTab] = useState<Tab>('sk')

  const handleRefresh = () => { refetchFacts(); refetchMetrics() }
  const counters = tab === 'sk' ? getSlovakCounters(lang) : getWorldCounters(lang)

  return (
    <WidgetCard accent="rose" className="col-span-1 md:col-span-2 lg:col-span-3">
      <div className="flex items-center justify-between mb-3">
        <div className="widget-title mb-0">
          <span>📊</span>
          <span>{lang === 'sk' ? 'Živé počítadlá' : 'Live Counters'}</span>
          <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded-full text-slate-500 ml-1">
            {counters.length}
          </span>
        </div>
        <button onClick={handleRefresh} className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-0.5 mb-4 bg-white/[0.03] rounded-lg p-0.5 border border-white/5 max-w-xs">
        <button onClick={() => setTab('sk')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${tab === 'sk' ? 'bg-white/8 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
          🇸🇰 {lang === 'sk' ? 'Slovensko' : 'Slovakia'}
        </button>
        <button onClick={() => setTab('world')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${tab === 'world' ? 'bg-white/8 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
          🌍 {lang === 'sk' ? 'Svet' : 'World'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {counters.map((c, i) => (
          <div key={i} className="bg-white/[0.03] rounded-xl p-2.5 border border-white/5 hover:border-rose-500/15 transition-all group">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">{c.icon}</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-wide font-semibold truncate">{c.label}</span>
            </div>
            <div className={`text-sm font-bold tabular-nums ${c.color}`}>
              <AnimatedNum target={c.value} />
            </div>
            {c.detail && <div className="text-[9px] text-slate-600 mt-0.5 truncate">{c.detail}</div>}
          </div>
        ))}
      </div>

      <p className="text-[9px] text-slate-600 mt-3 text-center">
        {tab === 'sk' ? 'ŠÚ SR · Slovensko' : 'Worldometer · Statista · NASA'}
      </p>
    </WidgetCard>
  )
}
