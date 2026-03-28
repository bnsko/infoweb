'use client'
import { useState, useEffect } from 'react'
import WidgetCard from '@/components/ui/WidgetCard'

interface MoonInfo {
  phase: number
  emoji: string
  name: string
  illumination: number
  age: number
  daysToFull: number
  daysToNew: number
  distance: number
  zodiac: string
  zodiacEmoji: string
  risingTime: string
  settingTime: string
}

const ZODIAC_SIGNS = [
  { name: 'Baran', emoji: '\u2648' },
  { name: 'Byk', emoji: '\u2649' },
  { name: 'Blizenci', emoji: '\u264a' },
  { name: 'Rak', emoji: '\u264b' },
  { name: 'Lev', emoji: '\u264c' },
  { name: 'Panna', emoji: '\u264d' },
  { name: 'Vahy', emoji: '\u264e' },
  { name: 'Skorpion', emoji: '\u264f' },
  { name: 'Strelec', emoji: '\u2650' },
  { name: 'Kozorozec', emoji: '\u2651' },
  { name: 'Vodnar', emoji: '\u2652' },
  { name: 'Ryby', emoji: '\u2653' },
]

const METEOR_SHOWERS = [
  { name: 'Quadrantidy', peak: { month: 1, day: 4 }, zhr: 120 },
  { name: 'Lyridy', peak: { month: 4, day: 22 }, zhr: 18 },
  { name: 'Eta Aquaridy', peak: { month: 5, day: 6 }, zhr: 50 },
  { name: 'Delta Aquaridy', peak: { month: 7, day: 30 }, zhr: 25 },
  { name: 'Perseidy', peak: { month: 8, day: 12 }, zhr: 100 },
  { name: 'Draconidy', peak: { month: 10, day: 8 }, zhr: 10 },
  { name: 'Orionidy', peak: { month: 10, day: 21 }, zhr: 20 },
  { name: 'Leonidy', peak: { month: 11, day: 17 }, zhr: 15 },
  { name: 'Geminidy', peak: { month: 12, day: 14 }, zhr: 150 },
  { name: 'Ursidy', peak: { month: 12, day: 22 }, zhr: 10 },
]

const ECLIPSES = [
  { type: 'lunar', date: '2025-09-07', name: 'Uplne zatmenie Mesiaca' },
  { type: 'lunar', date: '2026-03-03', name: 'Uplne zatmenie Mesiaca' },
  { type: 'solar', date: '2026-08-12', name: 'Uplne zatmenie Slnka' },
  { type: 'solar', date: '2027-08-02', name: 'Uplne zatmenie Slnka' },
  { type: 'lunar', date: '2028-01-12', name: 'Ciastocne zatmenie Mesiaca' },
]

const MOON_FACTS = [
  'Mesiac sa od Zeme vzdaluje rychlostou 3,8 cm/rok',
  'Rotacia a obeh Mesiaca trvaju rovnako - preto vidime stale rovnaku stranu',
  'Najvyssi vrch na Mesiaci (Mons Huygens) ma 5 500 m',
  'Teplota na povrchu: -173\u00b0C v noci, +127\u00b0C cez den',
  'Na Mesiaci bolo 12 ludi (1969-1972)',
  'Gravitacia Mesiaca je ~16,6% zemskej - skocite 6x vyssie',
  'Mesiac je 400x mensi ako Slnko, ale 400x blizsie - preto rovnaka velkost na oblohe',
  'Mesacny prach je ostry ako sklo - nie je erodovany vetrom',
  'Mesiac sposobuje prilivove sily, ktore spomaluju rotaciu Zeme',
  'Artemis III (NASA) planuje pristat na juznom pole Mesiaca ~2026',
]

function getMoonInfo(date: Date): MoonInfo {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z')
  const synodicPeriod = 29.53058867
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / 86400000
  const cycles = daysSince / synodicPeriod
  const phase = cycles - Math.floor(cycles)
  const age = phase * synodicPeriod
  const daysToFull = phase < 0.5 ? (0.5 - phase) * synodicPeriod : (1.5 - phase) * synodicPeriod
  const daysToNew = (1 - phase) * synodicPeriod
  const illumination = Math.round(50 * (1 - Math.cos(2 * Math.PI * phase)))
  const anomaly = 2 * Math.PI * phase
  const distance = Math.round(384400 + 25100 * Math.cos(anomaly * 0.93 + 0.5))
  const eclipticLon = ((age / synodicPeriod) * 360 + 180) % 360
  const zodiacIdx = Math.floor(eclipticLon / 30)
  const zodiac = ZODIAC_SIGNS[zodiacIdx] ?? ZODIAC_SIGNS[0]
  const riseHour = (18 + age * 0.83) % 24
  const setHour = (riseHour + 12 + (phase < 0.5 ? phase * 4 : (1 - phase) * 4)) % 24
  const pad = (n: number) => `${Math.floor(n)}:${String(Math.floor((n % 1) * 60)).padStart(2, '0')}`

  let emoji: string; let name: string
  if (phase < 0.025 || phase >= 0.975) { emoji = '\ud83c\udf11'; name = 'Nov' }
  else if (phase < 0.25) { emoji = '\ud83c\udf12'; name = 'Dorast' }
  else if (phase < 0.275) { emoji = '\ud83c\udf13'; name = 'Prva stvrtina' }
  else if (phase < 0.5) { emoji = '\ud83c\udf14'; name = 'Dorast (spln)' }
  else if (phase < 0.525) { emoji = '\ud83c\udf15'; name = 'Spln' }
  else if (phase < 0.75) { emoji = '\ud83c\udf16'; name = 'Ubudanie' }
  else if (phase < 0.775) { emoji = '\ud83c\udf17'; name = 'Posledna stvrtina' }
  else { emoji = '\ud83c\udf18'; name = 'Ubudanie (nov)' }

  return { phase, emoji, name, illumination, age: Math.round(age * 10) / 10, daysToFull, daysToNew, distance, zodiac: zodiac.name, zodiacEmoji: zodiac.emoji, risingTime: pad(riseHour), settingTime: pad(setHour) }
}

function nextMeteorShower(date: Date) {
  const year = date.getFullYear()
  let best: { name: string; daysUntil: number; zhr: number } | null = null
  for (const ms of METEOR_SHOWERS) {
    for (const y of [year, year + 1]) {
      const peak = new Date(y, ms.peak.month - 1, ms.peak.day)
      const daysUntil = Math.ceil((peak.getTime() - date.getTime()) / 86400000)
      if (daysUntil >= 0 && (!best || daysUntil < best.daysUntil)) { best = { name: ms.name, daysUntil, zhr: ms.zhr }; break }
    }
  }
  return best ?? { name: 'Geminidy', daysUntil: 365, zhr: 150 }
}

function nextEclipse(date: Date) {
  for (const e of ECLIPSES) {
    const d = new Date(e.date)
    const diff = Math.ceil((d.getTime() - date.getTime()) / 86400000)
    if (diff >= 0) return { ...e, daysUntil: diff }
  }
  return { type: 'lunar', date: '2028-01-12', name: 'Ciastocne zatmenie Mesiaca', daysUntil: 999 }
}

function MoonDisc({ phase, size = 80 }: { phase: number; size?: number }) {
  const r = size / 2; const cx = r; const cy = r
  const rx = Math.abs(Math.cos(Math.PI * phase)) * r
  const waxing = phase <= 0.5
  const semiSweep = waxing ? 1 : 0
  const ellipseSweep = waxing ? 1 : 0
  const ellipseRx = rx <= 0 ? 0.01 : rx
  const path = [`M ${cx} ${cy - r}`, `A ${r} ${r} 0 0 ${semiSweep} ${cx} ${cy + r}`, `A ${ellipseRx} ${r} 0 0 ${ellipseSweep} ${cx} ${cy - r}`, 'Z'].join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="#1a1a2e" />
      <path d={path} fill="#f5e642" opacity="0.92" />
      <circle cx={cx + r * 0.2} cy={cy - r * 0.2} r={r * 0.06} fill="rgba(0,0,0,0.12)" />
      <circle cx={cx - r * 0.15} cy={cy + r * 0.25} r={r * 0.04} fill="rgba(0,0,0,0.10)" />
      <circle cx={cx + r * 0.1} cy={cy + r * 0.05} r={r * 0.08} fill="rgba(0,0,0,0.08)" />
      <circle cx={cx} cy={cy} r={r - 1} fill="none" stroke="rgba(245,230,66,0.25)" strokeWidth="1.5" />
    </svg>
  )
}

type MoonTab = 'info' | 'facts' | 'sky'

export default function MoonPhaseWidget() {
  const [moon, setMoon] = useState<MoonInfo>(() => getMoonInfo(new Date()))
  const [shower, setShower] = useState(() => nextMeteorShower(new Date()))
  const [eclipse, setEclipse] = useState(() => nextEclipse(new Date()))
  const [tab, setTab] = useState<MoonTab>('info')
  const [factIdx, setFactIdx] = useState(0)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setMoon(getMoonInfo(now))
      setShower(nextMeteorShower(now))
      setEclipse(nextEclipse(now))
    }
    const id = setInterval(tick, 60 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setFactIdx(i => (i + 1) % MOON_FACTS.length), 8000)
    return () => clearInterval(id)
  }, [])

  const TABS: { key: MoonTab; label: string }[] = [
    { key: 'info', label: '\ud83c\udf19 Faza' },
    { key: 'sky', label: '\ud83c\udf20 Obloha' },
    { key: 'facts', label: '\ud83d\udcd6 Fakty' },
  ]

  return (
    <WidgetCard accent="yellow" title="\ud83c\udf19 Mesiac & Obloha" icon="" onRefresh={() => {}}>
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === tb.key ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <MoonDisc phase={moon.phase} size={85} />
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-white">{moon.emoji} {moon.name}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1.5">
                <span className="text-[10px] text-slate-400">Osvetlenie</span>
                <span className="text-[10px] text-white font-bold text-right">{moon.illumination}%</span>
                <span className="text-[10px] text-slate-400">Vek</span>
                <span className="text-[10px] text-white font-bold text-right">{moon.age} dni</span>
                <span className="text-[10px] text-slate-400">Vzdialenost</span>
                <span className="text-[10px] text-white font-bold text-right">{(moon.distance / 1000).toFixed(1)}k km</span>
                <span className="text-[10px] text-slate-400">{moon.zodiacEmoji} Znamenie</span>
                <span className="text-[10px] text-white font-bold text-right">{moon.zodiac}</span>
              </div>
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className={`flex-1 h-2 rounded-sm ${i < Math.round(moon.illumination / 10) ? 'bg-yellow-400' : 'bg-white/5'}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-yellow-500/8 border border-yellow-500/15 rounded-xl p-2.5 text-center">
              <p className="text-[9px] text-yellow-300/70 mb-0.5">{'\ud83c\udf15'} Nasledujuci spln</p>
              <p className="text-lg font-bold text-yellow-300">{Math.round(moon.daysToFull)}</p>
              <p className="text-[9px] text-slate-500">dni</p>
            </div>
            <div className="bg-blue-500/8 border border-blue-500/15 rounded-xl p-2.5 text-center">
              <p className="text-[9px] text-blue-300/70 mb-0.5">{'\ud83c\udf11'} Nasledujuci nov</p>
              <p className="text-lg font-bold text-blue-300">{Math.round(moon.daysToNew)}</p>
              <p className="text-[9px] text-slate-500">dni</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-2">
              <span className="text-slate-500">Vychod</span>
              <span className="text-white font-bold float-right">{moon.risingTime}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-2">
              <span className="text-slate-500">Zapad</span>
              <span className="text-white font-bold float-right">{moon.settingTime}</span>
            </div>
          </div>
        </>
      )}

      {tab === 'sky' && (
        <div className="space-y-3">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
            <p className="text-[10px] text-indigo-300 font-semibold mb-1">{'\ud83c\udf20'} Najblizsi meteoriticky dazd</p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[13px] font-bold text-white">{shower.name}</span>
                <span className="text-[9px] text-slate-500 ml-1.5">~{shower.zhr} meteorov/h</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-300">{shower.daysUntil === 0 ? 'Dnes!' : `za ${shower.daysUntil} dni`}</span>
            </div>
          </div>
          <div className={`${eclipse.type === 'solar' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-purple-500/10 border-purple-500/20'} border rounded-xl p-3`}>
            <p className={`text-[10px] font-semibold mb-1 ${eclipse.type === 'solar' ? 'text-amber-300' : 'text-purple-300'}`}>
              {eclipse.type === 'solar' ? '\u2600\ufe0f' : '\ud83c\udf11'} Najblizsie zatmenie
            </p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[12px] font-bold text-white">{eclipse.name}</span>
                <span className="text-[9px] text-slate-500 ml-1.5">{eclipse.date}</span>
              </div>
              <span className={`text-[11px] font-bold ${eclipse.type === 'solar' ? 'text-amber-300' : 'text-purple-300'}`}>za {eclipse.daysUntil}d</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold mb-1.5">Meteoriticke dazde tento rok</p>
            <div className="space-y-1 max-h-[160px] overflow-y-auto scrollbar-hide">
              {METEOR_SHOWERS.map(ms => {
                const now = new Date()
                const peak = new Date(now.getFullYear(), ms.peak.month - 1, ms.peak.day)
                const diff = Math.ceil((peak.getTime() - now.getTime()) / 86400000)
                const isPast = diff < 0
                return (
                  <div key={ms.name} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 border ${isPast ? 'opacity-40 border-white/[0.03] bg-white/[0.01]' : 'border-white/5 bg-white/[0.02]'}`}>
                    <span className="text-[10px] font-medium text-slate-300 flex-1">{ms.name}</span>
                    <span className="text-[9px] text-slate-500">{ms.peak.day}.{ms.peak.month}.</span>
                    <span className="text-[9px] text-indigo-400 font-bold w-10 text-right">{ms.zhr}/h</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'facts' && (
        <div className="space-y-3">
          <div className="bg-purple-500/8 border border-purple-500/15 rounded-xl p-3 min-h-[50px] flex items-center">
            <p className="text-[11px] text-slate-200 leading-relaxed">{MOON_FACTS[factIdx]}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold mb-2">Zem vs Mesiac</p>
            <div className="space-y-1.5">
              {[
                { label: 'Priemer', earth: '12 742 km', moon: '3 474 km', pct: 27 },
                { label: 'Hmotnost', earth: '5.97\u00d710\u00b2\u2074 kg', moon: '7.34\u00d710\u00b2\u00b2 kg', pct: 1.2 },
                { label: 'Gravitacia', earth: '9.81 m/s\u00b2', moon: '1.62 m/s\u00b2', pct: 16.5 },
                { label: 'Plocha', earth: '510M km\u00b2', moon: '37.9M km\u00b2', pct: 7.4 },
                { label: 'Den', earth: '24 h', moon: '708 h', pct: 100 },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-2 text-[10px]">
                  <span className="w-16 text-slate-500 shrink-0">{row.label}</span>
                  <span className="w-20 text-white font-medium text-right">{row.earth}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full mx-1 overflow-hidden">
                    <div className="h-full bg-yellow-400/60 rounded-full" style={{ width: `${Math.min(row.pct, 100)}%` }} />
                  </div>
                  <span className="w-20 text-yellow-300 font-medium">{row.moon}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1 max-h-[150px] overflow-y-auto scrollbar-hide">
            {MOON_FACTS.map((fact, i) => (
              <div key={i} className={`text-[10px] px-2 py-1.5 rounded-lg border transition-all ${i === factIdx ? 'bg-purple-500/10 border-purple-500/20 text-white' : 'border-white/[0.03] text-slate-500'}`}>
                {fact}
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
