'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import type { StatsData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'

/* ── WMO weather codes ── */
const WMO: Record<number, { icon: string; label: string }> = {
  0: { icon: '☀️', label: 'Jasno' }, 1: { icon: '🌤️', label: 'Prevažne jasno' },
  2: { icon: '⛅', label: 'Polojasno' }, 3: { icon: '☁️', label: 'Zamračené' },
  45: { icon: '🌫️', label: 'Hmla' }, 48: { icon: '🌫️', label: 'Námraza' },
  51: { icon: '🌦️', label: 'Mrholenie' }, 53: { icon: '🌦️', label: 'Mrholenie' }, 55: { icon: '🌧️', label: 'Silné mrholenie' },
  61: { icon: '🌧️', label: 'Dážď' }, 63: { icon: '🌧️', label: 'Stredný dážď' }, 65: { icon: '🌧️', label: 'Silný dážď' },
  71: { icon: '🌨️', label: 'Sneženie' }, 73: { icon: '🌨️', label: 'Stredné sneženie' }, 75: { icon: '❄️', label: 'Silné sneženie' },
  77: { icon: '🌨️', label: 'Krúpy' },
  80: { icon: '🌦️', label: 'Prehánky' }, 81: { icon: '🌧️', label: 'Stredné prehánky' }, 82: { icon: '⛈️', label: 'Prudké prehánky' },
  85: { icon: '🌨️', label: 'Snehové prehánky' }, 86: { icon: '❄️', label: 'Silné snehové prehánky' },
  95: { icon: '⛈️', label: 'Búrka' }, 96: { icon: '⛈️', label: 'Búrka s krúpami' }, 99: { icon: '⛈️', label: 'Silná búrka' },
}

function windDirStr(deg: number): string {
  const dirs = ['S', 'SV', 'V', 'JV', 'J', 'JZ', 'Z', 'SZ']
  return dirs[Math.round(deg / 45) % 8]
}

/* ── Moon & Sky helpers (inline from MoonPhaseWidget) ── */
const ZODIAC_SIGNS = [
  { name: 'Baran', emoji: '♈' }, { name: 'Byk', emoji: '♉' }, { name: 'Blíženci', emoji: '♊' },
  { name: 'Rak', emoji: '♋' }, { name: 'Lev', emoji: '♌' }, { name: 'Panna', emoji: '♍' },
  { name: 'Váhy', emoji: '♎' }, { name: 'Škorpión', emoji: '♏' }, { name: 'Strelec', emoji: '♐' },
  { name: 'Kozorožec', emoji: '♑' }, { name: 'Vodnár', emoji: '♒' }, { name: 'Ryby', emoji: '♓' },
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
  { type: 'lunar', date: '2025-09-07', name: 'Úplné zatmenie Mesiaca' },
  { type: 'lunar', date: '2026-03-03', name: 'Úplné zatmenie Mesiaca' },
  { type: 'solar', date: '2026-08-12', name: 'Úplné zatmenie Slnka' },
  { type: 'solar', date: '2027-08-02', name: 'Úplné zatmenie Slnka' },
  { type: 'lunar', date: '2028-01-12', name: 'Čiastočné zatmenie Mesiaca' },
]
const MOON_FACTS = [
  'Mesiac sa od Zeme vzďaľuje rýchlosťou 3,8 cm/rok',
  'Rotácia a obeh Mesiaca trvajú rovnako — preto vidíme stále rovnakú stranu',
  'Najvyšší vrch na Mesiaci (Mons Huygens) má 5 500 m',
  'Teplota na povrchu: −173 °C v noci, +127 °C cez deň',
  'Na Mesiaci bolo 12 ľudí (1969–1972)',
  'Gravitácia Mesiaca je ~16,6 % zemskej — skočíte 6× vyššie',
  'Mesiac je 400× menší ako Slnko, ale 400× bližšie — preto rovnaká veľkosť na oblohe',
  'Mesačný prach je ostrý ako sklo — nie je erodovaný vetrom',
  'Mesiac spôsobuje prílivové sily, ktoré spomaľujú rotáciu Zeme',
  'Artemis III (NASA) plánuje pristáť na južnom póle Mesiaca ~2026',
]

interface MoonInfo {
  phase: number; emoji: string; name: string; illumination: number
  age: number; daysToFull: number; daysToNew: number
  distance: number; zodiac: string; zodiacEmoji: string
  risingTime: string; settingTime: string
}

function getMoonInfo(date: Date): MoonInfo {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z')
  const synodicPeriod = 29.53058867
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / 86400000
  const phase = (daysSince / synodicPeriod) % 1
  const age = phase * synodicPeriod
  const daysToFull = phase < 0.5 ? (0.5 - phase) * synodicPeriod : (1.5 - phase) * synodicPeriod
  const daysToNew = (1 - phase) * synodicPeriod
  const illumination = Math.round(50 * (1 - Math.cos(2 * Math.PI * phase)))
  const anomaly = 2 * Math.PI * phase
  const distance = Math.round(384400 + 25100 * Math.cos(anomaly * 0.93 + 0.5))
  const eclipticLon = ((age / synodicPeriod) * 360 + 180) % 360
  const zodiac = ZODIAC_SIGNS[Math.floor(eclipticLon / 30)] ?? ZODIAC_SIGNS[0]
  const riseHour = (18 + age * 0.83) % 24
  const setHour = (riseHour + 12 + (phase < 0.5 ? phase * 4 : (1 - phase) * 4)) % 24
  const pad = (n: number) => `${Math.floor(n)}:${String(Math.floor((n % 1) * 60)).padStart(2, '0')}`
  let emoji: string; let name: string
  if (phase < 0.025 || phase >= 0.975) { emoji = '🌑'; name = 'Nov' }
  else if (phase < 0.25) { emoji = '🌒'; name = 'Dorastajúci' }
  else if (phase < 0.275) { emoji = '🌓'; name = 'Prvá štvrťina' }
  else if (phase < 0.5) { emoji = '🌔'; name = 'Dorastajúci (spln)' }
  else if (phase < 0.525) { emoji = '🌕'; name = 'Spln' }
  else if (phase < 0.75) { emoji = '🌖'; name = 'Ubúdajúci' }
  else if (phase < 0.775) { emoji = '🌗'; name = 'Posledná štvrťina' }
  else { emoji = '🌘'; name = 'Ubúdajúci (nov)' }
  return { phase, emoji, name, illumination, age: Math.round(age * 10) / 10, daysToFull, daysToNew, distance, zodiac: zodiac.name, zodiacEmoji: zodiac.emoji, risingTime: pad(riseHour), settingTime: pad(setHour) }
}

function nextMeteorShower(date: Date) {
  const year = date.getFullYear()
  let best: { name: string; daysUntil: number; zhr: number } | null = null
  for (const ms of METEOR_SHOWERS) {
    for (const y of [year, year + 1]) {
      const peak = new Date(y, ms.peak.month - 1, ms.peak.day)
      const d = Math.ceil((peak.getTime() - date.getTime()) / 86400000)
      if (d >= 0 && (!best || d < best.daysUntil)) { best = { name: ms.name, daysUntil: d, zhr: ms.zhr }; break }
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
  return { type: 'lunar', date: '2028-01-12', name: 'Čiastočné zatmenie Mesiaca', daysUntil: 999 }
}

function MoonDisc({ phase, size = 70 }: { phase: number; size?: number }) {
  const r = size / 2; const cx = r; const cy = r
  const rx = Math.abs(Math.cos(Math.PI * phase)) * r
  const waxing = phase <= 0.5
  const path = [`M ${cx} ${cy - r}`, `A ${r} ${r} 0 0 ${waxing ? 1 : 0} ${cx} ${cy + r}`, `A ${Math.max(rx, 0.01)} ${r} 0 0 ${waxing ? 1 : 0} ${cx} ${cy - r}`, 'Z'].join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="#1a1a2e" />
      <path d={path} fill="#f5e642" opacity="0.92" />
      <circle cx={cx + r * 0.2} cy={cy - r * 0.2} r={r * 0.06} fill="rgba(0,0,0,0.12)" />
      <circle cx={cx - r * 0.15} cy={cy + r * 0.25} r={r * 0.04} fill="rgba(0,0,0,0.10)" />
      <circle cx={cx} cy={cy} r={r - 1} fill="none" stroke="rgba(245,230,66,0.25)" strokeWidth="1.5" />
    </svg>
  )
}

/* ── Toggle settings key ── */
const PREFS_KEY = 'infoweb-weather-sections'
type WeatherSections = { warnings: boolean; details: boolean; tomorrow: boolean }
const defaultSections: WeatherSections = { warnings: true, details: true, tomorrow: true }

function loadSections(): WeatherSections {
  if (typeof window === 'undefined') return defaultSections
  try { return { ...defaultSections, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') } }
  catch { return defaultSections }
}

/* ── Moon & Sky Popup ── */
type MoonTab = 'info' | 'sky' | 'facts'

function MoonSkyPopup({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<MoonTab>('info')
  const [factIdx, setFactIdx] = useState(0)
  const now = new Date()
  const moon = getMoonInfo(now)
  const shower = nextMeteorShower(now)
  const eclipse = nextEclipse(now)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => { const id = setInterval(() => setFactIdx(i => (i + 1) % MOON_FACTS.length), 8000); return () => clearInterval(id) }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose() }
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClick), 10)
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClick) }
  }, [onClose])

  const TABS: { key: MoonTab; label: string }[] = [
    { key: 'info', label: '🌙 Fáza' }, { key: 'sky', label: '🌠 Obloha' }, { key: 'facts', label: '📖 Fakty' },
  ]

  return (
    <div ref={popupRef} className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[380px] max-h-[80vh] overflow-y-auto bg-slate-900 border border-yellow-500/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-yellow-300">🌙 Mesiac & Obloha</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
      </div>

      <div className="flex gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === tb.key ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}>{tb.label}</button>
        ))}
      </div>

      {tab === 'info' && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <MoonDisc phase={moon.phase} size={70} />
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-white">{moon.emoji} {moon.name}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1">
                <span className="text-[10px] text-slate-400">Osvetlenie</span>
                <span className="text-[10px] text-white font-bold text-right">{moon.illumination}%</span>
                <span className="text-[10px] text-slate-400">Vek</span>
                <span className="text-[10px] text-white font-bold text-right">{moon.age} dní</span>
                <span className="text-[10px] text-slate-400">Vzdialenosť</span>
                <span className="text-[10px] text-white font-bold text-right">{(moon.distance / 1000).toFixed(1)}k km</span>
                <span className="text-[10px] text-slate-400">{moon.zodiacEmoji} Znamenie</span>
                <span className="text-[10px] text-white font-bold text-right">{moon.zodiac}</span>
              </div>
              <div className="flex gap-0.5 mt-1.5">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-sm ${i < Math.round(moon.illumination / 10) ? 'bg-yellow-400' : 'bg-white/5'}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-yellow-500/8 border border-yellow-500/15 rounded-xl p-2 text-center">
              <p className="text-[9px] text-yellow-300/70">🌕 Spln</p>
              <p className="text-lg font-bold text-yellow-300">{Math.round(moon.daysToFull)}</p>
              <p className="text-[8px] text-slate-500">dní</p>
            </div>
            <div className="bg-blue-500/8 border border-blue-500/15 rounded-xl p-2 text-center">
              <p className="text-[9px] text-blue-300/70">🌑 Nov</p>
              <p className="text-lg font-bold text-blue-300">{Math.round(moon.daysToNew)}</p>
              <p className="text-[8px] text-slate-500">dní</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1.5">
              <span className="text-slate-500">Východ</span>
              <span className="text-white font-bold float-right">{moon.risingTime}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg px-2 py-1.5">
              <span className="text-slate-500">Západ</span>
              <span className="text-white font-bold float-right">{moon.settingTime}</span>
            </div>
          </div>
        </>
      )}

      {tab === 'sky' && (
        <div className="space-y-2">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5">
            <p className="text-[10px] text-indigo-300 font-semibold mb-1">🌠 Najbližší meteorický dážď</p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[13px] font-bold text-white">{shower.name}</span>
                <span className="text-[9px] text-slate-500 ml-1.5">~{shower.zhr} meteorov/h</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-300">{shower.daysUntil === 0 ? 'Dnes!' : `za ${shower.daysUntil} dní`}</span>
            </div>
          </div>
          <div className={`${eclipse.type === 'solar' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-purple-500/10 border-purple-500/20'} border rounded-xl p-2.5`}>
            <p className={`text-[10px] font-semibold mb-1 ${eclipse.type === 'solar' ? 'text-amber-300' : 'text-purple-300'}`}>
              {eclipse.type === 'solar' ? '☀️' : '🌑'} Najbližšie zatmenie
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-white">{eclipse.name}</span>
              <span className={`text-[11px] font-bold ${eclipse.type === 'solar' ? 'text-amber-300' : 'text-purple-300'}`}>za {eclipse.daysUntil}d</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold mb-1">Meteorické dažde</p>
            <div className="space-y-0.5 max-h-[140px] overflow-y-auto scrollbar-hide">
              {METEOR_SHOWERS.map(ms => {
                const now2 = new Date()
                const peak = new Date(now2.getFullYear(), ms.peak.month - 1, ms.peak.day)
                const diff = Math.ceil((peak.getTime() - now2.getTime()) / 86400000)
                return (
                  <div key={ms.name} className={`flex items-center gap-2 rounded-lg px-2 py-1 border ${diff < 0 ? 'opacity-40 border-white/[0.03]' : 'border-white/5 bg-white/[0.02]'}`}>
                    <span className="text-[10px] text-slate-300 flex-1">{ms.name}</span>
                    <span className="text-[9px] text-slate-500">{ms.peak.day}.{ms.peak.month}.</span>
                    <span className="text-[9px] text-indigo-400 font-bold w-8 text-right">{ms.zhr}/h</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'facts' && (
        <div className="space-y-2">
          <div className="bg-purple-500/8 border border-purple-500/15 rounded-xl p-2.5 min-h-[40px] flex items-center">
            <p className="text-[11px] text-slate-200 leading-relaxed">{MOON_FACTS[factIdx]}</p>
          </div>
          <div className="space-y-0.5 max-h-[180px] overflow-y-auto scrollbar-hide">
            {MOON_FACTS.map((fact, i) => (
              <div key={i} className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${i === factIdx ? 'bg-purple-500/10 border-purple-500/20 text-white' : 'border-white/[0.03] text-slate-500'}`}>
                {fact}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

/* ── Sun arc mini icon ── */
function SunArcMini({ sunrise, sunset }: { sunrise: string; sunset: string }) {
  const now = Date.now()
  const riseMs = new Date(sunrise).getTime()
  const setMs = new Date(sunset).getTime()
  const dayLen = setMs - riseMs
  const isDay = now >= riseMs && now <= setMs
  const pct = isDay ? Math.max(0, Math.min(1, (now - riseMs) / dayLen)) : (now < riseMs ? 0 : 1)
  const angle = Math.PI * pct
  const cx = 10 + (1 - Math.cos(angle)) * 5
  const cy = 12 - Math.sin(angle) * 9
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" className="shrink-0">
      <path d="M 2 12 Q 11 -4 20 12" fill="none" stroke="rgba(251,191,36,0.3)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="12" x2="20" y2="12" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r={isDay ? 2.5 : 2} fill={isDay ? '#fbbf24' : '#94a3b8'} className={isDay ? 'drop-shadow-[0_0_3px_#fbbf24]' : ''} />
    </svg>
  )
}

/* ── Sunrise/Sunset popup with extended info ── */
function SunriseSunsetPopup({ sunrise, sunset, onClose }: { sunrise: string; sunset: string; onClose: () => void }) {
  const riseMs = new Date(sunrise).getTime()
  const setMs = new Date(sunset).getTime()
  const dayLenMin = Math.round((setMs - riseMs) / 60000)
  const dayH = Math.floor(dayLenMin / 60)
  const dayM = dayLenMin % 60
  const now = Date.now()
  const isDay = now >= riseMs && now <= setMs
  const pct = isDay ? Math.max(0, Math.min(1, (now - riseMs) / (setMs - riseMs))) : (now < riseMs ? 0 : 1)

  // Monthly sunrise/sunset estimates for Bratislava (approx)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Máj', 'Jún', 'Júl', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
  const riseTimes = ['7:35', '7:00', '6:10', '6:05', '5:20', '4:55', '5:05', '5:40', '6:20', '6:55', '7:30', '7:55']
  const setTimes = ['16:20', '17:05', '17:50', '19:35', '20:15', '20:50', '20:45', '20:05', '19:10', '18:10', '16:25', '16:05']
  const dayLengths = ['8:45', '10:05', '11:40', '13:30', '14:55', '15:55', '15:40', '14:25', '12:50', '11:15', '8:55', '8:10']
  const currentMonth = new Date().getMonth()

  const fmt = (ms: number) => new Date(ms).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })

  // Sun arc SVG
  const arcW = 280, arcH = 100
  const sunAngle = Math.PI * pct
  const sunX = 20 + pct * (arcW - 40)
  const sunY = arcH - 10 - Math.sin(sunAngle) * (arcH - 30)

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-[400px] bg-[var(--bg-card)] border border-amber-500/20 rounded-2xl shadow-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-amber-300">☀️ Východ & Západ slnka</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg">✕</button>
        </div>

        {/* Sun arc animation */}
        <div className="bg-gradient-to-b from-sky-900/30 via-amber-900/10 to-slate-900/20 rounded-xl p-3 border border-amber-500/10">
          <svg width={arcW} height={arcH} viewBox={`0 0 ${arcW} ${arcH}`} className="w-full">
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path d={`M 20 ${arcH - 10} Q ${arcW / 2} ${-arcH * 0.3} ${arcW - 20} ${arcH - 10}`} fill="url(#skyGrad)" opacity="0.5" />
            <path d={`M 20 ${arcH - 10} Q ${arcW / 2} ${-arcH * 0.3} ${arcW - 20} ${arcH - 10}`} fill="none" stroke="rgba(251,191,36,0.4)" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="20" y1={arcH - 10} x2={arcW - 20} y2={arcH - 10} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            {isDay && <circle cx={sunX} cy={sunY} r="8" fill="#fbbf24" opacity="0.15" />}
            <circle cx={sunX} cy={sunY} r="5" fill={isDay ? '#fbbf24' : '#64748b'} className={isDay ? 'drop-shadow-[0_0_8px_#fbbf24]' : ''} />
            {isDay && <>
              {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
                const rad = (a * Math.PI) / 180
                return <line key={a} x1={sunX + Math.cos(rad) * 7} y1={sunY + Math.sin(rad) * 7} x2={sunX + Math.cos(rad) * 10} y2={sunY + Math.sin(rad) * 10} stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
              })}
            </>}
            <text x="20" y={arcH - 2} fontSize="9" fill="#f59e0b" textAnchor="middle">🌅</text>
            <text x={arcW - 20} y={arcH - 2} fontSize="9" fill="#f97316" textAnchor="middle">🌇</text>
          </svg>
        </div>

        {/* Current info */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 text-center">
            <div className="text-[9px] text-amber-600 uppercase font-semibold">Východ</div>
            <div className="text-base font-bold text-amber-300 font-mono">{fmt(riseMs)}</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2 text-center">
            <div className="text-[9px] text-blue-400 uppercase font-semibold">Deň</div>
            <div className="text-base font-bold text-blue-300 font-mono">{dayH}h {dayM}m</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-2 text-center">
            <div className="text-[9px] text-orange-400 uppercase font-semibold">Západ</div>
            <div className="text-base font-bold text-orange-300 font-mono">{fmt(setMs)}</div>
          </div>
        </div>

        {isDay ? (
          <div className="text-center text-[10px] text-amber-400/70">
            ☀️ Slnko je hore — {Math.round(pct * 100)}% dňa ubehlo
          </div>
        ) : (
          <div className="text-center text-[10px] text-slate-500">
            🌙 Noc — slnko je pod horizontom
          </div>
        )}

        {/* Monthly table */}
        <div>
          <div className="text-[10px] text-slate-400 font-semibold mb-1.5">📅 Prehľad po mesiacoch (Bratislava)</div>
          <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-hide">
            {months.map((m, i) => (
              <div key={i} className={`flex items-center gap-2 text-[10px] px-2 py-1 rounded-lg ${i === currentMonth ? 'bg-amber-500/10 border border-amber-500/20 text-white font-semibold' : 'hover:bg-white/[0.03] text-slate-400'}`}>
                <span className="w-8 font-semibold">{m}</span>
                <span className="text-amber-400 font-mono w-10">🌅 {riseTimes[i]}</span>
                <span className="text-orange-400 font-mono w-10">🌇 {setTimes[i]}</span>
                <span className="text-blue-400 font-mono ml-auto">{dayLengths[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Temperature bar showing min/current/max ── */
function TempBar({ min, current, max }: { min: number; max: number; current: number }) {
  const range = max - min || 1
  const pct = Math.max(0, Math.min(100, ((current - min) / range) * 100))
  return (
    <div className="flex items-center gap-1.5 w-full">
      <span className="text-[10px] font-bold text-blue-400 tabular-nums w-7 text-right">{min}°</span>
      <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-blue-500/20 via-yellow-500/20 to-red-500/20 relative">
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-400 shadow-lg shadow-blue-500/30 transition-all" style={{ left: `calc(${pct}% - 6px)` }} />
      </div>
      <span className="text-[10px] font-bold text-red-400 tabular-nums w-7">{max}°</span>
    </div>
  )
}

/* ── Main Widget ── */
export default function StatsWidget() {
  const { data, loading, refetch } = useWidget<StatsData>('/api/stats', 60 * 1000)
  const { lang } = useLang()
  const [moonOpen, setMoonOpen] = useState(false)
  const [sunOpen, setSunOpen] = useState(false)
  const [sections, setSections] = useState<WeatherSections>(defaultSections)
  const [showPrefs, setShowPrefs] = useState(false)

  useEffect(() => { setSections(loadSections()) }, [])
  const toggleSection = useCallback((key: keyof WeatherSections) => {
    setSections(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(PREFS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const closeMoon = useCallback(() => setMoonOpen(false), [])

  const cityTemps = data?.cityTemps ?? []
  const cityAQI = data?.cityAQI ?? []
  const sorted = [...cityTemps].sort((a, b) => b.temp - a.temp)
  const hottest = sorted[0]
  const coldest = sorted[sorted.length - 1]
  const warnings: { type: string; message: string; severity: string }[] = data?.warnings ?? []

  const moon = typeof window !== 'undefined' ? getMoonInfo(new Date()) : null

  return (
    <WidgetCard accent="blue" title={lang === 'sk' ? 'Počasie · Slovensko' : 'Weather · Slovakia'} icon="🌤️" onRefresh={refetch}
      headerRight={
        <div className="flex items-center gap-1.5 relative">
          {/* Moon & Sky trigger */}
          {moon && (
            <button onClick={() => setMoonOpen(o => !o)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                moonOpen ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300' : 'bg-white/[0.03] border-white/8 text-slate-400 hover:text-yellow-300 hover:border-yellow-500/20'
              }`}>
              <span>{moon.emoji}</span>
              <span>{moon.illumination}%</span>
            </button>
          )}
          {/* Sunrise/Sunset clickable */}
          {cityTemps[0]?.sunrise && (
            <button onClick={() => setSunOpen(o => !o)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                sunOpen ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-white/[0.03] border-white/8 text-amber-400/80 hover:text-amber-300 hover:border-amber-500/20'
              }`}>
              <SunArcMini
                sunrise={cityTemps[0].sunrise}
                sunset={cityTemps[0].sunset ?? ''}
              />
              <span className="font-mono tabular-nums">
                {new Date(cityTemps[0].sunrise).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-slate-600">·</span>
              <span className="font-mono tabular-nums">
                {cityTemps[0].sunset ? new Date(cityTemps[0].sunset).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }) : '–'}
              </span>
            </button>
          )}
          {/* Settings trigger */}
          <button onClick={() => setShowPrefs(p => !p)}
            className={`px-1.5 py-1 rounded-lg text-[11px] transition-all border ${
              showPrefs ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' : 'bg-white/[0.03] border-white/8 text-slate-500 hover:text-blue-300'
            }`}>⚙️</button>
          {moonOpen && <MoonSkyPopup onClose={closeMoon} />}
          {sunOpen && cityTemps[0]?.sunrise && (
            <SunriseSunsetPopup
              sunrise={cityTemps[0].sunrise}
              sunset={cityTemps[0].sunset ?? ''}
              onClose={() => setSunOpen(false)}
            />
          )}
        </div>
      }
    >
      {/* Section toggles */}
      {showPrefs && (
        <div className="mb-3 flex flex-wrap gap-2 p-2 bg-white/[0.02] border border-white/8 rounded-xl">
          {([
            { key: 'warnings' as const, label: '⚠️ Výstrahy', labelEn: '⚠️ Warnings' },
            { key: 'details' as const, label: '📊 Detaily', labelEn: '📊 Details' },
            { key: 'tomorrow' as const, label: '📅 Zajtra', labelEn: '📅 Tomorrow' },
          ]).map(s => (
            <label key={s.key} className="flex items-center gap-1.5 cursor-pointer text-[10px]">
              <input type="checkbox" checked={sections[s.key]} onChange={() => toggleSection(s.key)}
                className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50" />
              <span className="text-slate-400">{lang === 'sk' ? s.label : s.labelEn}</span>
            </label>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton h-36 rounded-xl" />)}</div>
      )}
      {!loading && cityTemps.length > 0 && (
        <>
          {/* Weather warnings */}
          {sections.warnings && warnings.length > 0 && (
            <div className="mb-3 space-y-1">
              {warnings.map((w, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold border ${
                  w.severity === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                }`}>
                  <span>{w.type === 'wind' ? '💨' : w.type === 'rain' ? '🌧️' : w.type === 'uv' ? '☀️' : w.type === 'heat' ? '🔥' : '❄️'}</span>
                  <span>⚠️ {w.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cityTemps.map(c => {
              const wmo = WMO[c.weatherCode] ?? { icon: '🌡️', label: `Kód ${c.weatherCode}` }
              const wmoTomorrow = c.tomorrowCode != null ? (WMO[c.tomorrowCode] ?? { icon: '🌡️', label: '' }) : { icon: '🌡️', label: '' }
              const tempColor = c.temp >= 25 ? '#f97316' : c.temp >= 15 ? '#fbbf24' : c.temp >= 5 ? '#60a5fa' : c.temp >= 0 ? '#818cf8' : '#c4b5fd'
              const isHottest = hottest?.key === c.key && hottest.key !== coldest?.key
              const isColdest = coldest?.key === c.key && hottest?.key !== coldest?.key
              return (
                <div key={c.key} className="bg-white/[0.02] border border-white/8 rounded-xl p-3 hover:bg-white/[0.04] transition-all relative overflow-hidden group">
                  {/* Hottest/Coldest badge */}
                  {(isHottest || isColdest) && (
                    <div className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      isHottest ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                    }`}>
                      {isHottest ? '🔺 Najteplejšie' : '🔻 Najchladnejšie'}
                    </div>
                  )}
                  {/* City name + current weather icon */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-2xl ${c.weatherCode >= 61 && c.weatherCode <= 67 ? 'anim-bounce' : c.weatherCode >= 95 ? 'anim-pulse-dot' : c.weatherCode >= 80 ? 'anim-sway' : ''}`}>{wmo.icon}</span>
                    <div>
                      <div className="text-[12px] font-bold text-white">{c.name}</div>
                      <div className="text-[9px] text-slate-500">{wmo.label}</div>
                    </div>
                  </div>
                  {/* Temperature */}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold tabular-nums" style={{ color: tempColor }}>{c.temp}°</span>
                    <span className="text-[9px] text-slate-500">pocit {c.feelsLike}°</span>
                  </div>
                  {/* Min/Max bar */}
                  <div className="mb-2">
                    <TempBar min={c.tempMin} current={c.temp} max={c.tempMax} />
                  </div>
                  {/* Details grid */}
                  {sections.details && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px]">
                      <span className="text-slate-500">💨 Vietor</span>
                      <span className="text-slate-300 text-right">{c.windSpeed} km/h {windDirStr(c.windDir)}</span>
                      <span className="text-slate-500">🌡️ Tlak</span>
                      <span className="text-slate-300 text-right">{c.pressure} hPa</span>
                      <span className="text-slate-500">💧 Vlhkosť</span>
                      <span className="text-slate-300 text-right">{c.humidity}%</span>
                      {(c.precipitation ?? 0) > 0 && <>
                        <span className="text-slate-500">🌧️ Zrážky</span>
                        <span className="text-slate-300 text-right">{c.precipitation} mm</span>
                      </>}
                      {(() => {
                        const aqiData = cityAQI.find(a => a.key === c.key)
                        if (!aqiData || aqiData.aqi <= 0) return null
                        const aqiColor = aqiData.aqi <= 20 ? 'text-green-400' : aqiData.aqi <= 40 ? 'text-yellow-400' : aqiData.aqi <= 60 ? 'text-orange-400' : 'text-red-400'
                        const aqiLabel = aqiData.aqi <= 20 ? 'Výborná' : aqiData.aqi <= 40 ? 'Dobrá' : aqiData.aqi <= 60 ? 'Stredná' : aqiData.aqi <= 80 ? 'Zlá' : 'Veľmi zlá'
                        return <>
                          <span className="text-slate-500">🌬️ Čistota ovzdušia</span>
                          <span className={`text-right font-semibold ${aqiColor}`}>AQI {aqiData.aqi} · {aqiLabel}</span>
                        </>
                      })()}
                    </div>
                  )}
                  {/* Tomorrow */}
                  {sections.tomorrow && (
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[9px]">
                      <span className="text-slate-500">Zajtra: {wmoTomorrow.icon} {c.tomorrowMin}°/{c.tomorrowMax}°</span>
                      {(c.tomorrowPrecipProb ?? 0) > 0 && <span className="text-blue-400">🌧 {c.tomorrowPrecipProb}%</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </WidgetCard>
  )
}
