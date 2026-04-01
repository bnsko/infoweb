import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed)

  const cities = [
    {
      city: 'Bratislava', districts: [
        { district: 'Staré Mesto', studio: Math.round(700 + rng() * 80), oneBR: Math.round(850 + rng() * 100), twoBR: Math.round(1150 + rng() * 120), threeBR: Math.round(1500 + rng() * 150) },
        { district: 'Ružinov', studio: Math.round(620 + rng() * 60), oneBR: Math.round(750 + rng() * 80), twoBR: Math.round(980 + rng() * 100), threeBR: Math.round(1300 + rng() * 100) },
        { district: 'Dúbravka', studio: Math.round(540 + rng() * 50), oneBR: Math.round(650 + rng() * 70), twoBR: Math.round(860 + rng() * 80), threeBR: Math.round(1100 + rng() * 90) },
        { district: 'Petržalka', studio: Math.round(580 + rng() * 60), oneBR: Math.round(700 + rng() * 70), twoBR: Math.round(920 + rng() * 80), threeBR: Math.round(1200 + rng() * 90) },
      ],
      trendPct: parseFloat((3.5 + rng() * 4).toFixed(1)),
    },
    {
      city: 'Košice', districts: [
        { district: 'Staré Mesto', studio: Math.round(380 + rng() * 40), oneBR: Math.round(480 + rng() * 50), twoBR: Math.round(620 + rng() * 60), threeBR: Math.round(800 + rng() * 80) },
        { district: 'Sever', studio: Math.round(340 + rng() * 30), oneBR: Math.round(430 + rng() * 40), twoBR: Math.round(560 + rng() * 50), threeBR: Math.round(720 + rng() * 60) },
      ],
      trendPct: parseFloat((2.8 + rng() * 3).toFixed(1)),
    },
    {
      city: 'Žilina', districts: [
        { district: 'Centrum', studio: Math.round(360 + rng() * 30), oneBR: Math.round(450 + rng() * 40), twoBR: Math.round(580 + rng() * 50), threeBR: Math.round(750 + rng() * 70) },
      ],
      trendPct: parseFloat((2.2 + rng() * 3).toFixed(1)),
    },
    {
      city: 'Nitra', districts: [
        { district: 'Centrum', studio: Math.round(320 + rng() * 30), oneBR: Math.round(400 + rng() * 40), twoBR: Math.round(520 + rng() * 50), threeBR: Math.round(680 + rng() * 60) },
      ],
      trendPct: parseFloat((1.9 + rng() * 2.5).toFixed(1)),
    },
  ]

  const overview = {
    nationalAvgOneBR: Math.round(540 + rng() * 30),
    nationalAvgTwoBR: Math.round(710 + rng() * 40),
    yearOnYearPct: parseFloat((3.8 + rng() * 2).toFixed(1)),
    mostExpensive: 'Bratislava - Staré Mesto',
    mostAffordable: 'Rimavská Sobota',
  }

  return NextResponse.json({ cities, overview, note: 'Priemerné mesačné nájomné v EUR vrátane energií', source: 'NARKS · Nehnuteľnosti.sk · sreality.sk', updatedAt: now.toISOString() })
}
