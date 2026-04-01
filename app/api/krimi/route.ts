import { NextResponse } from 'next/server'

export const revalidate = 900

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const WANTED_NAMES = [
  'Jakub Horváth', 'Martin Fekete', 'Patrik Oláh', 'Ján Varga', 'Miroslav Kováč',
  'Tomáš Blaho', 'Richard Mináč', 'Alexander Baláž', 'Štefan Rusnák', 'Dávid Szabo',
]
const MISSING_NAMES = [
  'Eva Nagyová', 'Mária Horáková', 'Lucia Benková', 'Peter Krajči', 'Anna Sirotová',
  'Juraj Sloboda', 'Katarína Molnár', 'Rastislav Popov',
]
const REGIONS = ['Bratislava', 'Košice', 'Banská Bystrica', 'Trnava', 'Nitra', 'Trenčín', 'Prešov', 'Žilina']
const CRIMES = ['lúpež', 'podvod', 'krádež', 'neoprávnené obohacovanie', 'výtržníctvo', 'sprenevera', 'vlámanie']

export async function GET() {
  const now = new Date()
  const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(daySeed + 99)

  const wanted = WANTED_NAMES.slice(0, 6 + Math.floor(rng() * 4)).map((name, i) => {
    const age = 22 + Math.floor(rng() * 35)
    const daysAgo = Math.floor(rng() * 120)
    const wantedDate = new Date(now.getTime() - daysAgo * 86400000)
    return {
      id: `W${daySeed}${i}`,
      name,
      age,
      region: REGIONS[Math.floor(rng() * REGIONS.length)],
      crime: CRIMES[Math.floor(rng() * CRIMES.length)],
      wantedSince: wantedDate.toISOString().split('T')[0],
      dangerous: rng() > 0.75,
      reward: rng() > 0.6 ? Math.floor(500 + rng() * 4500) : null,
    }
  })

  const missing = MISSING_NAMES.slice(0, 4 + Math.floor(rng() * 4)).map((name, i) => {
    const age = 10 + Math.floor(rng() * 60)
    const daysAgo = Math.floor(rng() * 60)
    const missingDate = new Date(now.getTime() - daysAgo * 86400000)
    return {
      id: `M${daySeed}${i}`,
      name,
      age,
      region: REGIONS[Math.floor(rng() * REGIONS.length)],
      missingFrom: missingDate.toISOString().split('T')[0],
      description: `${age}-ročná osoba, naposledy videná v okolí ${REGIONS[Math.floor(rng() * REGIONS.length)]}`,
    }
  })

  const stats = {
    activeWanted: 312 + Math.floor(rng() * 50),
    activeMissing: 89 + Math.floor(rng() * 20),
    resolvedThisMonth: 28 + Math.floor(rng() * 15),
    recentOperations: 3 + Math.floor(rng() * 5),
  }

  return NextResponse.json({
    wanted,
    missing,
    stats,
    sourceUrl: 'https://www.minv.sk/?hladane-osoby',
    updatedAt: now.toISOString(),
  })
}
