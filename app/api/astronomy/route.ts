import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const METEOR_SHOWERS = [
  { name: 'Quadrantidy', peak: { month: 1, day: 4 }, zhr: 120, parent: 'asteroid 2003 EH1' },
  { name: 'Lyridy', peak: { month: 4, day: 22 }, zhr: 18, parent: 'kométa Thatcher' },
  { name: 'Eta Aquaridy', peak: { month: 5, day: 6 }, zhr: 50, parent: 'kométa Halley' },
  { name: 'Delta Aquaridy', peak: { month: 7, day: 30 }, zhr: 25, parent: 'kométa 96P/Machholz' },
  { name: 'Perseidy', peak: { month: 8, day: 12 }, zhr: 100, parent: 'kométa Swift-Tuttle' },
  { name: 'Draconidy', peak: { month: 10, day: 8 }, zhr: 10, parent: 'kométa Giacobini-Zinner' },
  { name: 'Orionidy', peak: { month: 10, day: 21 }, zhr: 20, parent: 'kométa Halley' },
  { name: 'Leonidy', peak: { month: 11, day: 17 }, zhr: 15, parent: 'kométa Tempel-Tuttle' },
  { name: 'Geminidy', peak: { month: 12, day: 14 }, zhr: 150, parent: 'asteroid Phaethon' },
  { name: 'Ursidy', peak: { month: 12, day: 22 }, zhr: 10, parent: 'kométa Tuttle' },
]

const ECLIPSES = [
  { type: 'lunar', date: '2025-09-07', name: 'Úplné zatmenie Mesiaca', visible: 'Ázia, Austrália' },
  { type: 'lunar', date: '2026-03-03', name: 'Úplné zatmenie Mesiaca', visible: 'Európa ✓, Ázia' },
  { type: 'solar', date: '2026-08-12', name: 'Úplné zatmenie Slnka', visible: 'Arktída, Grónsko, Španielsko' },
  { type: 'solar', date: '2027-08-02', name: 'Úplné zatmenie Slnka', visible: 'Afrika, Európa ✓' },
  { type: 'lunar', date: '2028-01-12', name: 'Čiastočné zatmenie Mesiaca', visible: 'Európa ✓, Amerika' },
]

const PLANET_VISIBILITY: Record<number, { planets: string[]; note: string }> = {
  1: { planets: ['Venuša 🌟', 'Mars ♂️', 'Saturn 🪐'], note: 'Venuša svieti jasne na večernej oblohe' },
  2: { planets: ['Venuša 🌟', 'Jupiter ♃', 'Mars ♂️'], note: 'Jupiter je viditeľný po celú noc' },
  3: { planets: ['Jupiter ♃', 'Venuša 🌟', 'Saturn 🪐'], note: 'Venuša dosahuje najväčší jas' },
  4: { planets: ['Mars ♂️', 'Saturn 🪐', 'Jupiter ♃'], note: 'Mars v opozícii - najjasnejší tento rok' },
  5: { planets: ['Jupiter ♃', 'Saturn 🪐'], note: 'Saturn vychádza po polnoci' },
  6: { planets: ['Mars ♂️', 'Saturn 🪐', 'Jupiter ♃'], note: 'Saturn v opozícii' },
  7: { planets: ['Saturn 🪐', 'Jupiter ♃', 'Mars ♂️'], note: 'Tri planéty na večernej oblohe' },
  8: { planets: ['Saturn 🪐', 'Jupiter ♃'], note: 'Perseidy - najlepší meteorický roj' },
  9: { planets: ['Saturn 🪐', 'Jupiter ♃', 'Venuša 🌟'], note: 'Jupiter jasný po celú noc' },
  10: { planets: ['Jupiter ♃', 'Saturn 🪐'], note: 'Orionidy z kométy Halley' },
  11: { planets: ['Jupiter ♃', 'Venuša 🌟', 'Saturn 🪐'], note: 'Leonidy - rýchle meteory' },
  12: { planets: ['Jupiter ♃', 'Venuša 🌟', 'Mars ♂️'], note: 'Geminidy - najsilnejší roj roka' },
}

function getMoonInfo(date: Date) {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z')
  const synodicPeriod = 29.53058867
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / 86400000
  const phase = (daysSince / synodicPeriod) % 1
  const illumination = Math.round(50 * (1 - Math.cos(2 * Math.PI * phase)))
  return { phase, illumination, goodForViewing: illumination < 30 }
}

export async function GET() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  // Next meteor shower
  let nextShower = null
  let nearestDays = 999
  for (const ms of METEOR_SHOWERS) {
    for (const y of [year, year + 1]) {
      const peak = new Date(y, ms.peak.month - 1, ms.peak.day)
      const diff = Math.ceil((peak.getTime() - now.getTime()) / 86400000)
      if (diff >= -3 && diff < nearestDays) {
        nearestDays = diff
        const active = diff >= -3 && diff <= 3
        nextShower = { name: ms.name, daysUntil: diff, zhr: ms.zhr, parent: ms.parent, active }
      }
    }
  }

  // Next eclipse
  let nextEclipse = null
  for (const e of ECLIPSES) {
    const d = new Date(e.date)
    const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000)
    if (diff >= 0) { nextEclipse = { ...e, daysUntil: diff }; break }
  }

  // Planet visibility
  const pv = PLANET_VISIBILITY[month] ?? { planets: ['Jupiter ♃'], note: '' }

  // Moon conditions
  const moon = getMoonInfo(now)

  // Aurora probability (simplified Kp estimation - in real app would use NOAA API)
  let auroraInfo = null
  try {
    const res = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json', {
      signal: AbortSignal.timeout(5000), cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      const forecasts = Array.isArray(data) ? data.slice(1) : []
      const maxKp = forecasts.reduce((max: number, row: string[]) => {
        const kp = parseFloat(row?.[1] ?? '0')
        return kp > max ? kp : max
      }, 0)
      auroraInfo = {
        kpIndex: Math.round(maxKp * 10) / 10,
        visibleFromSK: maxKp >= 7,
        chance: maxKp >= 8 ? 'vysoká' : maxKp >= 6 ? 'mierna' : maxKp >= 4 ? 'nízka' : 'minimálna',
      }
    }
  } catch { /* ignore */ }

  return NextResponse.json({
    nextShower,
    nextEclipse,
    planets: pv,
    moonConditions: moon,
    aurora: auroraInfo,
    timestamp: Date.now(),
  })
}
