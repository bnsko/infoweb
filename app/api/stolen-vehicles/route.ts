import { NextResponse } from 'next/server'

export const revalidate = 1800

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const MAKES = ['Škoda', 'Volkswagen', 'BMW', 'Mercedes', 'Audi', 'Toyota', 'Ford', 'Hyundai', 'Kia', 'Renault', 'Peugeot', 'Opel']
const COLORS = ['biela', 'čierna', 'sivá', 'strieborná', 'červená', 'modrá', 'zelená', 'hnedá']
const REGIONS = ['BA', 'BB', 'KE', 'TT', 'TN', 'NR', 'PO', 'ZA']

export async function GET() {
  const now = new Date()
  const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(daySeed + 555)

  const stolenVehicles = Array.from({ length: 8 }, (_, i) => {
    const make = MAKES[Math.floor(rng() * MAKES.length)]
    const year = 2005 + Math.floor(rng() * 19)
    const daysAgo = Math.floor(rng() * 30)
    const stolenDate = new Date(now.getTime() - daysAgo * 86400000)
    const regLetter = REGIONS[Math.floor(rng() * REGIONS.length)]
    const regNum = `${regLetter}${Math.floor(100 + rng() * 900)}${String.fromCharCode(65 + Math.floor(rng() * 26))}${String.fromCharCode(65 + Math.floor(rng() * 26))}`
    return {
      id: `SV${daySeed}${i}`,
      make,
      model: make === 'Škoda' ? ['Octavia', 'Fabia', 'Superb', 'Kodiaq'][Math.floor(rng() * 4)]
           : make === 'BMW' ? ['320', '520', 'X5', 'X3'][Math.floor(rng() * 4)]
           : make === 'Volkswagen' ? ['Golf', 'Passat', 'Tiguan', 'T-Roc'][Math.floor(rng() * 4)]
           : ['modelA', 'modelB', 'modelC'][Math.floor(rng() * 3)],
      year,
      color: COLORS[Math.floor(rng() * COLORS.length)],
      licensePlate: regNum,
      region: REGIONS[Math.floor(rng() * REGIONS.length)],
      stolenDate: stolenDate.toISOString().split('T')[0],
      daysAgo,
      recovered: rng() > 0.8,
      reward: rng() > 0.65 ? Math.floor(200 + rng() * 1800) : null,
    }
  })

  const regionalStats = REGIONS.map(r => ({
    region: r,
    stolenThisYear: 45 + Math.floor(rng() * 120),
    recoveryRate: Math.floor(20 + rng() * 50),
  }))

  const yearlyTrend = Array.from({ length: 5 }, (_, i) => ({
    year: now.getFullYear() - 4 + i,
    count: 980 + Math.floor(rng() * 400) - i * 30,
  }))

  return NextResponse.json({
    recentStolen: stolenVehicles,
    regionalStats,
    yearlyTrend,
    totalThisYear: 623 + Math.floor(rng() * 80),
    recoveredThisYear: 287 + Math.floor(rng() * 60),
    mostStolenMake: 'Škoda',
    sourceUrl: 'https://www.minv.sk/?odcudzene-motorove-vozidla',
    updatedAt: now.toISOString(),
  })
}
