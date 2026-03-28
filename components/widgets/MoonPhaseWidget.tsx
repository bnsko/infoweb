'use client'
import { useState, useEffect } from 'react'

interface MoonInfo {
  phase: number        // 0..1
  emoji: string
  name: string
  illumination: number // 0..100 %
  age: number          // days since last new moon
  daysToFull: number
  daysToNew: number
}

const PHASE_NAMES_SK = [
  'Nov', 'Dorast (mesiac)', 'Spln', 'Ubúdanie (mesiac)',
]

const METEOR_SHOWERS = [
  { name: 'Quadrantidy', peak: { month: 1, day: 4 } },
  { name: 'Lyridy', peak: { month: 4, day: 22 } },
  { name: 'Eta Aquaridy', peak: { month: 5, day: 6 } },
  { name: 'Perseidy', peak: { month: 8, day: 12 } },
  { name: 'Orionidy', peak: { month: 10, day: 21 } },
  { name: 'Leonidy', peak: { month: 11, day: 17 } },
  { name: 'Geminidy', peak: { month: 12, day: 14 } },
  { name: 'Ursidy', peak: { month: 12, day: 22 } },
]

function getMoonInfo(date: Date): MoonInfo {
  // Known new moon: 2000-01-06 18:14 UTC
  const knownNewMoon = new Date('2000-01-06T18:14:00Z')
  const synodicPeriod = 29.53058867

  const daysSince = (date.getTime() - knownNewMoon.getTime()) / 86400000
  const cycles = daysSince / synodicPeriod
  const phase = cycles - Math.floor(cycles) // 0..1

  const age = phase * synodicPeriod
  const daysToFull = phase < 0.5
    ? (0.5 - phase) * synodicPeriod
    : (1.5 - phase) * synodicPeriod
  const daysToNew = (1 - phase) * synodicPeriod

  const illumination = Math.round(50 * (1 - Math.cos(2 * Math.PI * phase)))

  let emoji: string
  let name: string

  if (phase < 0.025 || phase >= 0.975) { emoji = '🌑'; name = 'Nov' }
  else if (phase < 0.25) { emoji = '🌒'; name = 'Dorast' }
  else if (phase < 0.275) { emoji = '🌓'; name = 'Prvá štvrtina' }
  else if (phase < 0.5) { emoji = '🌔'; name = 'Dorast (spln)' }
  else if (phase < 0.525) { emoji = '🌕'; name = 'Spln' }
  else if (phase < 0.75) { emoji = '🌖'; name = 'Ubúdanie (nov)' }
  else if (phase < 0.775) { emoji = '🌗'; name = 'Posledná štvrtina' }
  else { emoji = '🌘'; name = 'Ubúdanie' }

  return { phase, emoji, name, illumination, age: Math.round(age * 10) / 10, daysToFull, daysToNew }
}

function nextMeteorShower(date: Date): { name: string; daysUntil: number } {
  const year = date.getFullYear()
  let best: { name: string; daysUntil: number } | null = null

  for (const ms of METEOR_SHOWERS) {
    for (const y of [year, year + 1]) {
      const peak = new Date(y, ms.peak.month - 1, ms.peak.day)
      const daysUntil = Math.ceil((peak.getTime() - date.getTime()) / 86400000)
      if (daysUntil >= 0) {
        if (!best || daysUntil < best.daysUntil) best = { name: ms.name, daysUntil }
        break
      }
    }
  }

  return best ?? { name: 'Geminidy', daysUntil: 365 }
}

// SVG Moon disc
function MoonDisc({ phase, size = 80 }: { phase: number; size?: number }) {
  const r = size / 2
  const cx = r
  const cy = r

  // Lit side = right for waxing (phase < 0.5), left for waning
  // We draw a circle and overlay a darker ellipse to represent shadow
  const waxing = phase <= 0.5
  const p = waxing ? phase * 2 : (phase - 0.5) * 2 // 0..1 within each half

  // Width of the lit portion as fraction of diameter
  const rx = Math.abs(Math.cos(Math.PI * phase)) * r

  // We always show the full circle, then cut shadow from one side
  // The boundary is an ellipse
  const litLeft = waxing ? false : true

  // Build path: right semicircle (lit edge) + ellipse boundary
  const sweepDir = waxing ? 1 : 0 // arc direction for boundary ellipse

  const topX = cx
  const topY = cy - r
  const botX = cx
  const botY = cy + r

  // Full lit semicircle (right side for waxing, left for waning)
  const semiX = waxing ? cx + r : cx - r
  const semiSweep = waxing ? 1 : 0

  // Boundary ellipse arc direction
  const ellipseRx = rx <= 0 ? 0.01 : rx
  const ellipseSweep = sweepDir

  const path = [
    `M ${topX} ${topY}`,
    // Outer semicircle (lit half)
    `A ${r} ${r} 0 0 ${semiSweep} ${botX} ${botY}`,
    // Ellipse back to top
    `A ${ellipseRx} ${r} 0 0 ${ellipseSweep} ${topX} ${topY}`,
    'Z',
  ].join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Dark background (new moon) */}
      <circle cx={cx} cy={cy} r={r} fill="#1a1a2e" />
      {/* Lit portion */}
      <path d={path} fill="#f5e642" opacity="0.92" />
      {/* Subtle craters */}
      <circle cx={cx + r * 0.2} cy={cy - r * 0.2} r={r * 0.06} fill="rgba(0,0,0,0.12)" />
      <circle cx={cx - r * 0.15} cy={cy + r * 0.25} r={r * 0.04} fill="rgba(0,0,0,0.10)" />
      <circle cx={cx + r * 0.1} cy={cy + r * 0.05} r={r * 0.08} fill="rgba(0,0,0,0.08)" />
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r - 1} fill="none" stroke="rgba(245,230,66,0.25)" strokeWidth="1.5" />
    </svg>
  )
}

export default function MoonPhaseWidget() {
  const [moon, setMoon] = useState<MoonInfo>(() => getMoonInfo(new Date()))
  const [shower, setShower] = useState(() => nextMeteorShower(new Date()))

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setMoon(getMoonInfo(now))
      setShower(nextMeteorShower(now))
    }
    const id = setInterval(tick, 60 * 60 * 1000) // update hourly
    return () => clearInterval(id)
  }, [])

  const fullBar = Math.round(moon.illumination / 10)

  return (
    <div className="widget-card h-full flex flex-col">
      <h2 className="widget-title mb-4">🌙 Fáza Mesiaca</h2>

      <div className="flex items-center gap-6 mb-5">
        <MoonDisc phase={moon.phase} size={90} />
        <div>
          <p className="text-2xl font-bold text-primary">{moon.emoji} {moon.name}</p>
          <p className="text-sm text-muted mt-1">Osvetlenie: <span className="text-foreground">{moon.illumination}%</span></p>
          <p className="text-sm text-muted">Vek: <span className="text-foreground">{moon.age} dní</span></p>
          {/* Illumination bar */}
          <div className="flex gap-0.5 mt-2">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm ${i < fullBar ? 'bg-yellow-400' : 'bg-surface2'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Next events */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-surface2 rounded-xl p-3 text-center">
          <p className="text-xs text-muted mb-1">🌕 Nasledujúci spln</p>
          <p className="text-lg font-bold text-yellow-400">{Math.round(moon.daysToFull)}</p>
          <p className="text-xs text-muted">dní</p>
        </div>
        <div className="bg-surface2 rounded-xl p-3 text-center">
          <p className="text-xs text-muted mb-1">🌑 Nasledujúci nov</p>
          <p className="text-lg font-bold text-blue-400">{Math.round(moon.daysToNew)}</p>
          <p className="text-xs text-muted">dní</p>
        </div>
      </div>

      {/* Next meteor shower */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
        <p className="text-xs text-indigo-300 mb-1">🌠 Najbližší meteoritický dážď</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">{shower.name}</span>
          <span className="text-xs text-muted">
            {shower.daysUntil === 0 ? 'Dnes!' : `za ${shower.daysUntil} dní`}
          </span>
        </div>
      </div>
    </div>
  )
}
