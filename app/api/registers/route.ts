import { NextResponse } from 'next/server'

export const revalidate = 86400

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed)

  const orsr = {
    totalEntities: 350000 + Math.floor(rng() * 2000),
    newThisMonth: Math.floor(600 + rng() * 200),
    deletedThisMonth: Math.floor(100 + rng() * 80),
    types: { sro: 280000, as: 6500, druzstvo: 3200, other: 60000 },
  }

  const zr = {
    totalLivnosti: 520000 + Math.floor(rng() * 3000),
    newThisMonth: Math.floor(1200 + rng() * 500),
    suspendedThisMonth: Math.floor(300 + rng() * 150),
    categories: { remeslo: 180000, viazane: 95000, volne: 245000 },
  }

  const datagov = {
    totalDatasets: 3200 + Math.floor(rng() * 100),
    organizations: 180 + Math.floor(rng() * 10),
    categories: [
      { name: 'Životné prostredie', count: 450 },
      { name: 'Doprava', count: 380 },
      { name: 'Financie', count: 320 },
      { name: 'Zdravotníctvo', count: 280 },
      { name: 'Vzdelávanie', count: 250 },
      { name: 'Kultúra', count: 190 },
    ],
    newThisWeek: Math.floor(5 + rng() * 15),
  }

  return NextResponse.json({ orsr, zr, datagov, timestamp: Date.now() })
}
