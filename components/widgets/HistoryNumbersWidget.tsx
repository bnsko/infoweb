'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface DayFact {
  icon: string
  label: string
  value: string
  detail: string
  color: string
}

function ordinal(d: number): string {
  return `${d}.`
}

function getDayFacts(now: Date): DayFact[] {
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000) + 1
  const daysInYear = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 366 : 365
  const daysRemaining = daysInYear - dayOfYear
  const percentOfYear = ((dayOfYear / daysInYear) * 100).toFixed(1)
  const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)

  // Season
  const month = now.getMonth()
  const day = now.getDate()
  let season = '❄️ Zima'
  if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) season = '🌷 Jar'
  else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 23)) season = '☀️ Leto'
  else if ((month === 8 && day >= 23) || month === 9 || month === 10 || (month === 11 && day < 21)) season = '🍂 Jeseň'

  // Moon phase (simplified but reasonably accurate)
  const lunarCycle = 29.53
  const knownNewMoon = new Date(2000, 0, 6).getTime()
  const daysSinceNew = (now.getTime() - knownNewMoon) / 86400000
  const moonAge = ((daysSinceNew % lunarCycle) + lunarCycle) % lunarCycle
  let moonPhase = '🌑 Nov'
  if (moonAge > 1 && moonAge <= 7.4) moonPhase = '🌒 Dorastajúci kosák'
  else if (moonAge > 7.4 && moonAge <= 8.4) moonPhase = '🌓 Prvá štvrť'
  else if (moonAge > 8.4 && moonAge <= 14.4) moonPhase = '🌔 Dorastajúci mesiac'
  else if (moonAge > 14.4 && moonAge <= 15.8) moonPhase = '🌕 Spln'
  else if (moonAge > 15.8 && moonAge <= 22.1) moonPhase = '🌖 Ubúdajúci mesiac'
  else if (moonAge > 22.1 && moonAge <= 23.1) moonPhase = '🌗 Posledná štvrť'
  else if (moonAge > 23.1 && moonAge <= 29.0) moonPhase = '🌘 Ubúdajúci kosák'

  // Daylight (approximate for Bratislava 48.1°N)
  const daysFromSummer = Math.abs(dayOfYear - 172)
  const daylightHours = 16 - (daysFromSummer / 183) * 7.5
  const daylightStr = `${Math.floor(daylightHours)}h ${Math.round((daylightHours % 1) * 60)}m`

  // Fun: seconds lived in this year
  const secondsLived = dayOfYear * 86400
  const secondsStr = secondsLived > 1000000 ? `${(secondsLived / 1000000).toFixed(1)}M` : `${(secondsLived / 1000).toFixed(0)}K`

  return [
    { icon: '📅', label: 'Deň v roku', value: `${ordinal(dayOfYear)}`, detail: `z ${daysInYear} dní`, color: 'text-cyan-400' },
    { icon: '📊', label: 'Rok prebehol', value: `${percentOfYear}%`, detail: `zostáva ${daysRemaining} dní`, color: 'text-emerald-400' },
    { icon: '📆', label: 'Týždeň', value: `${ordinal(weekNumber)}`, detail: `týždeň v roku ${year}`, color: 'text-blue-400' },
    { icon: '🌍', label: 'Obdobie', value: season.split(' ')[1], detail: season.split(' ')[0], color: 'text-amber-400' },
    { icon: '🌙', label: 'Mesiac', value: moonPhase.split(' ').slice(1).join(' '), detail: moonPhase.split(' ')[0], color: 'text-purple-400' },
    { icon: '☀️', label: 'Denné svetlo', value: daylightStr, detail: 'Bratislava (cca)', color: 'text-yellow-400' },
    { icon: '⏱️', label: 'Sekúnd v roku', value: secondsStr, detail: 'uplynulo', color: 'text-rose-400' },
  ]
}

export default function HistoryNumbersWidget() {
  const { lang } = useLang()
  const [facts, setFacts] = useState<DayFact[]>([])

  useEffect(() => {
    setFacts(getDayFacts(new Date()))
    const interval = setInterval(() => setFacts(getDayFacts(new Date())), 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <WidgetCard accent="cyan" title={lang === 'sk' ? 'Dnešný deň v číslach' : 'Today in Numbers'} icon="📊">
      <div className="grid grid-cols-2 gap-1.5">
        {facts.map((f, i) => (
          <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-2 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{f.icon}</span>
              <span className="text-[9px] text-slate-500 uppercase font-semibold">{f.label}</span>
            </div>
            <p className={`text-sm font-black ${f.color}`}>{f.value}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">{f.detail}</p>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
