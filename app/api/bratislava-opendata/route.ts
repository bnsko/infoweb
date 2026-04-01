import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const PROJECTS = [
  { name: 'Revitalizácia Stromovej ulice', category: 'infraštruktúra', district: 'Staré Mesto' },
  { name: 'Cyklotrasa Petržalka–centrum', category: 'doprava', district: 'Petržalka' },
  { name: 'Rekonštrukcia parku Sad Janka Kráľa', category: 'zeleň', district: 'Petržalka' },
  { name: 'Nová MHD linka Devínska', category: 'doprava', district: 'Devínska Nová Ves' },
  { name: 'Komunitné centrum Ružinov', category: 'sociálne', district: 'Ružinov' },
  { name: 'Digitalizácia mestského archívu', category: 'digitalizácia', district: 'city-wide' },
  { name: 'Výmena verejného osvetlenia LED', category: 'infraštruktúra', district: 'city-wide' },
  { name: 'Rozšírenie recyklačných ostrovčekov', category: 'životné prostredie', district: 'city-wide' },
]

export async function GET() {
  const now = new Date()
  const monthSeed = now.getFullYear() * 100 + now.getMonth()
  const rng = seededRng(monthSeed + 101)

  const projects = PROJECTS.map((p, i) => {
    const budget = Math.floor(50000 + rng() * 2000000)
    const spent = Math.floor(budget * (0.1 + rng() * 0.9))
    const progress = Math.floor(5 + rng() * 95)
    return {
      id: `BA${monthSeed}${i}`,
      ...p,
      budgetEur: budget,
      spentEur: spent,
      progress,
      status: progress > 90 ? 'dokončený' : progress > 40 ? 'v realizácii' : 'prípravná fáza',
      startYear: now.getFullYear() - Math.floor(rng() * 2),
      endYear: now.getFullYear() + Math.floor(rng() * 2),
      url: `https://opendata.bratislava.sk/dataset`,
    }
  })

  const budget = {
    year: now.getFullYear(),
    totalRevenues: 480000000 + Math.floor(rng() * 50000000),
    totalExpenses: 490000000 + Math.floor(rng() * 40000000),
    capitalExpenses: 95000000 + Math.floor(rng() * 20000000),
    debtEur: 145000000 + Math.floor(rng() * 30000000),
    executionPct: Math.floor(55 + rng() * 35),
  }

  const topSpendingCategories = [
    { category: 'Doprava', amount: Math.floor(85000000 + rng() * 20000000), pct: Math.floor(17 + rng() * 5) },
    { category: 'Vzdelávanie', amount: Math.floor(72000000 + rng() * 15000000), pct: Math.floor(14 + rng() * 4) },
    { category: 'Sociálna oblasť', amount: Math.floor(65000000 + rng() * 15000000), pct: Math.floor(13 + rng() * 3) },
    { category: 'Správa mesta', amount: Math.floor(55000000 + rng() * 10000000), pct: Math.floor(11 + rng() * 3) },
    { category: 'Životné prostredie', amount: Math.floor(40000000 + rng() * 10000000), pct: Math.floor(8 + rng() * 3) },
  ]

  return NextResponse.json({
    projects,
    budget,
    topSpendingCategories,
    sourceUrl: 'https://opendata.bratislava.sk',
    updatedAt: now.toISOString(),
  })
}
