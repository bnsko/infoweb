import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const REGIONS = ['Tatry', 'Nízke Tatry', 'Malá Fatra', 'Veľká Fatra', 'Slovenský raj', 'Záhorská nížina', 'Podunajská nížina', 'Slovenské rudohorie']
const RIVERS = ['Dunaj', 'Váh', 'Hron', 'Hornád', 'Nitra', 'Poprad', 'Bodrog', 'Ipel\'']
const FLOOD_LEVELS = ['normál', 'pozor', 'výstraha 1', 'výstraha 2', 'výstraha 3'] as const

export async function GET() {
  const now = new Date()
  const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(daySeed + 246)

  const isSpring = now.getMonth() >= 2 && now.getMonth() <= 5
  const isSummer = now.getMonth() >= 6 && now.getMonth() <= 8

  const forestAlerts = REGIONS.slice(0, 5 + Math.floor(rng() * 3)).map((region, i) => {
    const fireRisk = isSummer ? Math.floor(40 + rng() * 55) : Math.floor(5 + rng() * 40)
    return {
      id: `FA${daySeed}${i}`,
      region,
      fireRisk,
      fireRiskLevel: fireRisk > 75 ? 'vysoké' : fireRisk > 50 ? 'stredné' : 'nízke',
      illegalLoggingReports: Math.floor(rng() * 5),
      calamityAreaHa: Math.floor(rng() * 200),
      lastInspection: new Date(now.getTime() - Math.floor(rng() * 10) * 86400000).toISOString().split('T')[0],
    }
  })

  const floodWarnings = RIVERS.map((river, i) => {
    const levelIdx = isSpring ? Math.floor(rng() * 4) : Math.floor(rng() * 3)
    const level = FLOOD_LEVELS[levelIdx]
    const waterLevel = Math.floor(120 + rng() * 400)
    return {
      id: `FW${daySeed}${i}`,
      river,
      currentLevel: waterLevel,
      normalLevel: 150 + Math.floor(rng() * 100),
      warning: level,
      trend: rng() > 0.5 ? 'stúpa' : rng() > 0.3 ? 'klesá' : 'stabilný',
      isWarning: levelIdx > 1,
    }
  })

  const forestStats = {
    totalForestAreaKm2: 19931,
    protectedAreaPct: 22.4,
    calamityAreaThisYear: 1200 + Math.floor(rng() * 800),
    illegalLoggingCasesYTD: 45 + Math.floor(rng() * 30),
    reforestationHa: 3200 + Math.floor(rng() * 1000),
  }

  const activeFloodWarnings = floodWarnings.filter(w => w.isWarning).length

  return NextResponse.json({
    forestAlerts,
    floodWarnings,
    forestStats,
    activeFloodWarnings,
    highestFireRisk: forestAlerts.sort((a, b) => b.fireRisk - a.fireRisk)[0],
    sourceUrl: 'https://www.shmu.sk/sk/?page=1&id=hydro',
    forestUrl: 'https://www.lesy.sk',
    updatedAt: now.toISOString(),
  })
}
