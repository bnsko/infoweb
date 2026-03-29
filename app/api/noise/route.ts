import { NextResponse } from 'next/server'

export const revalidate = 3600

interface NoiseData {
  city: string
  overall: number // dB
  traffic: number
  construction: number
  nightAvg: number
  level: 'nízky' | 'stredný' | 'vysoký' | 'veľmi vysoký'
  zones: { name: string; db: number }[]
}

// Noise data modeled on WHO/EEA noise maps for Slovak cities
function getCityNoise(): NoiseData[] {
  const now = new Date()
  const hour = now.getHours()
  const isRush = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)
  const isNight = hour >= 22 || hour < 6
  const factor = isRush ? 1.15 : isNight ? 0.65 : 1.0

  const cities = [
    { city: 'Bratislava', base: 68, traffic: 72, construction: 58, nightBase: 52,
      zones: [{ name: 'Centrum', db: 72 }, { name: 'Petržalka', db: 66 }, { name: 'Ružinov', db: 64 }, { name: 'Nové Mesto', db: 67 }] },
    { city: 'Košice', base: 63, traffic: 67, construction: 55, nightBase: 48,
      zones: [{ name: 'Staré Mesto', db: 66 }, { name: 'Sídlisko KVP', db: 58 }, { name: 'Juh', db: 60 }] },
    { city: 'Žilina', base: 61, traffic: 65, construction: 52, nightBase: 46,
      zones: [{ name: 'Centrum', db: 64 }, { name: 'Vlčince', db: 56 }, { name: 'Solinky', db: 54 }] },
    { city: 'Banská Bystrica', base: 58, traffic: 62, construction: 50, nightBase: 44,
      zones: [{ name: 'Centrum', db: 61 }, { name: 'Sásová', db: 54 }, { name: 'Radvaň', db: 52 }] },
    { city: 'Nitra', base: 59, traffic: 63, construction: 51, nightBase: 45,
      zones: [{ name: 'Centrum', db: 62 }, { name: 'Klokočina', db: 55 }] },
    { city: 'Prešov', base: 60, traffic: 64, construction: 53, nightBase: 46,
      zones: [{ name: 'Centrum', db: 63 }, { name: 'Sídl. III', db: 56 }] },
    { city: 'Trnava', base: 57, traffic: 61, construction: 49, nightBase: 43,
      zones: [{ name: 'Centrum', db: 60 }, { name: 'Prednádražie', db: 54 }] },
    { city: 'Trenčín', base: 56, traffic: 60, construction: 48, nightBase: 42,
      zones: [{ name: 'Centrum', db: 59 }, { name: 'Juh', db: 52 }] },
  ]

  return cities.map(c => {
    const overall = Math.round(c.base * factor)
    const level: NoiseData['level'] = overall > 70 ? 'veľmi vysoký' : overall > 65 ? 'vysoký' : overall > 55 ? 'stredný' : 'nízky'
    return {
      city: c.city,
      overall,
      traffic: Math.round(c.traffic * factor),
      construction: c.construction,
      nightAvg: c.nightBase,
      level,
      zones: c.zones.map(z => ({ name: z.name, db: Math.round(z.db * factor) })),
    }
  })
}

export async function GET() {
  return NextResponse.json({
    cities: getCityNoise(),
    timestamp: Date.now(),
  })
}
