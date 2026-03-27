// Moon phase calculation – no external API needed

export interface MoonPhase {
  emoji: string
  name: string
  illumination: number   // 0-100 %
  daysToFull: number
  daysToNew: number
  phase: number           // 0-29.53 (day in cycle)
}

const LUNAR_CYCLE = 29.53059  // days
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z')  // reference

export function calculateMoonPhase(date: Date): MoonPhase {
  const daysSince = (date.getTime() - KNOWN_NEW_MOON.getTime()) / 86_400_000
  const phase = ((daysSince % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE

  // Illumination: starts 0 at new moon, peaks 100 at full moon (day ~14.77)
  const angle = (phase / LUNAR_CYCLE) * 2 * Math.PI
  const illumination = Math.round(((1 - Math.cos(angle)) / 2) * 100)

  let emoji: string
  let name: string

  if (phase < 1.85)       { emoji = '🌑'; name = 'Nový mesiac' }
  else if (phase < 7.38)  { emoji = '🌒'; name = 'Dorast (kosák)' }
  else if (phase < 9.22)  { emoji = '🌓'; name = 'Prvá štvrtina' }
  else if (phase < 14.77) { emoji = '🌔'; name = 'Pribúdajúci mesiac' }
  else if (phase < 16.61) { emoji = '🌕'; name = 'Spln' }
  else if (phase < 22.15) { emoji = '🌖'; name = 'Ubúdajúci mesiac' }
  else if (phase < 23.99) { emoji = '🌗'; name = 'Posledná štvrtina' }
  else                    { emoji = '🌘'; name = 'Ubúdajúci kosák' }

  const daysToFull = phase <= 14.77
    ? Math.round(14.77 - phase)
    : Math.round(LUNAR_CYCLE - phase + 14.77)

  const daysToNew = Math.round(LUNAR_CYCLE - phase)

  return { emoji, name, illumination, daysToFull, daysToNew, phase }
}

// Next full moon date
export function nextFullMoon(from: Date): Date {
  const daysSince = (from.getTime() - KNOWN_NEW_MOON.getTime()) / 86_400_000
  const phase = ((daysSince % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE
  const daysUntil = phase <= 14.77 ? 14.77 - phase : LUNAR_CYCLE - phase + 14.77
  return new Date(from.getTime() + daysUntil * 86_400_000)
}

// Next new moon date
export function nextNewMoon(from: Date): Date {
  const daysSince = (from.getTime() - KNOWN_NEW_MOON.getTime()) / 86_400_000
  const phase = ((daysSince % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE
  const daysUntil = LUNAR_CYCLE - phase
  return new Date(from.getTime() + daysUntil * 86_400_000)
}
