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

  const recentVotes = [
    { title: 'Novela zákona o dani z príjmov', date: '2025-06-15', result: 'schválený', forVotes: 89, againstVotes: 51, abstained: 8 },
    { title: 'Zákon o štátnom rozpočte na rok 2026', date: '2025-06-14', result: 'schválený', forVotes: 82, againstVotes: 65, abstained: 3 },
    { title: 'Novela zákona o zdravotnom poistení', date: '2025-06-13', result: 'zamietnutý', forVotes: 45, againstVotes: 98, abstained: 7 },
    { title: 'Zákon o ochrane životného prostredia', date: '2025-06-12', result: 'schválený', forVotes: 120, againstVotes: 28, abstained: 2 },
    { title: 'Novela školského zákona', date: '2025-06-11', result: 'schválený', forVotes: 95, againstVotes: 48, abstained: 7 },
    { title: 'Zákon o sociálnom poistení', date: '2025-06-10', result: 'zamietnutý', forVotes: 55, againstVotes: 90, abstained: 5 },
  ]

  const contracts = [
    { title: 'Rekonštrukcia ciest D1', value: 45000000, contractor: 'Skanska SK', ministry: 'MDV SR', date: '2025-06-15' },
    { title: 'IT systém pre Finančnú správu', value: 12000000, contractor: 'Atos IT Solutions', ministry: 'MF SR', date: '2025-06-14' },
    { title: 'Dodávka vakcín 2025', value: 8500000, contractor: 'Pfizer Slovakia', ministry: 'MZ SR', date: '2025-06-13' },
    { title: 'Modernizácia železníc', value: 180000000, contractor: 'Eurovia SK', ministry: 'MDV SR', date: '2025-06-12' },
    { title: 'Obstarávanie policajných vozidiel', value: 5200000, contractor: 'Škoda Auto Slovensko', ministry: 'MV SR', date: '2025-06-11' },
    { title: 'Digitalizácia katastra', value: 15000000, contractor: 'Asseco Central Europe', ministry: 'ÚGKK SR', date: '2025-06-10' },
  ]

  const rpvs = {
    totalPartners: 28000 + Math.floor(rng() * 500),
    newThisMonth: Math.floor(50 + rng() * 30),
    verifiedThisMonth: Math.floor(200 + rng() * 100),
  }

  const statistics = {
    gdpGrowth: (1.5 + rng() * 2).toFixed(1),
    inflation: (3.5 + rng() * 2).toFixed(1),
    unemployment: (5.0 + rng() * 2).toFixed(1),
    avgSalary: Math.floor(1400 + rng() * 200),
    population: 5430000 + Math.floor(rng() * 5000),
    births: Math.floor(4500 + rng() * 500),
    deaths: Math.floor(4800 + rng() * 500),
    tourismVisitors: Math.floor(400000 + rng() * 100000),
    industrialProduction: (-1 + rng() * 5).toFixed(1),
  }

  return NextResponse.json({
    parliament: recentVotes,
    contracts,
    rpvs,
    statistics,
    timestamp: Date.now(),
  })
}
