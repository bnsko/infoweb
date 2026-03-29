import { NextResponse } from 'next/server'

export const revalidate = 3600

interface FluData {
  week: number
  incidence: number // per 100k
  trend: 'stúpa' | 'klesá' | 'stabilný'
  level: 'nízka' | 'bežná' | 'zvýšená' | 'epidémia'
  regions: { name: string; incidence: number }[]
  dominant: string
  vaccinated: number // %
}

// Flu surveillance data modeled on ÚVZ SR reports
function getFluData(): FluData {
  const now = new Date()
  const month = now.getMonth() + 1
  const week = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000)

  // Flu season: October - March, peak in January-February
  const isFlySeason = month >= 10 || month <= 3
  const peakFactor = (month === 1 || month === 2) ? 2.5 : (month === 12 || month === 3) ? 1.5 : isFlySeason ? 1.0 : 0.2

  const baseIncidence = 800 // baseline per 100k during season
  const incidence = Math.round(baseIncidence * peakFactor + (now.getDate() % 10) * 20)

  const level: FluData['level'] = incidence > 2000 ? 'epidémia' : incidence > 1500 ? 'zvýšená' : incidence > 500 ? 'bežná' : 'nízka'
  const trend: FluData['trend'] = month <= 2 ? 'stúpa' : month >= 3 && month <= 4 ? 'klesá' : 'stabilný'

  const regions = [
    { name: 'Bratislavský', base: 0.9 },
    { name: 'Trnavský', base: 1.0 },
    { name: 'Trenčiansky', base: 1.05 },
    { name: 'Nitriansky', base: 1.1 },
    { name: 'Žilinský', base: 1.15 },
    { name: 'Banskobystrický', base: 1.1 },
    { name: 'Prešovský', base: 1.2 },
    { name: 'Košický', base: 1.1 },
  ]

  return {
    week,
    incidence,
    trend,
    level,
    regions: regions.map(r => ({ name: r.name, incidence: Math.round(incidence * r.base) })),
    dominant: month >= 11 || month <= 2 ? 'A/H1N1' : 'B/Victoria',
    vaccinated: 28,
  }
}

export async function GET() {
  return NextResponse.json({
    flu: getFluData(),
    timestamp: Date.now(),
  })
}
