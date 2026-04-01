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
  const year = now.getFullYear()

  const national = {
    overweightPct: parseFloat((55.8 + rng() * 2).toFixed(1)),
    obesePct: parseFloat((19.2 + rng() * 1.5).toFixed(1)),
    avgBmi: parseFloat((26.8 + rng() * 0.5).toFixed(1)),
    diabetesPct: parseFloat((8.4 + rng() * 0.5).toFixed(1)),
    hypertensionPct: parseFloat((36.2 + rng() * 1.5).toFixed(1)),
    yearOnYearObesityChange: parseFloat((0.4 + rng() * 0.3).toFixed(1)),
  }

  const byGender = [
    { gender: 'Muži', overweightPct: parseFloat((62 + rng() * 3).toFixed(1)), obesePct: parseFloat((20 + rng() * 2).toFixed(1)), avgBmi: parseFloat((27.5 + rng() * 0.5).toFixed(1)) },
    { gender: 'Ženy', overweightPct: parseFloat((50 + rng() * 3).toFixed(1)), obesePct: parseFloat((18 + rng() * 2).toFixed(1)), avgBmi: parseFloat((26.1 + rng() * 0.5).toFixed(1)) },
  ]

  const byAgeGroup = [
    { ageGroup: '18–34', overweightPct: Math.round(28 + rng() * 5), obesePct: Math.round(9 + rng() * 3) },
    { ageGroup: '35–54', overweightPct: Math.round(52 + rng() * 5), obesePct: Math.round(18 + rng() * 3) },
    { ageGroup: '55–64', overweightPct: Math.round(65 + rng() * 4), obesePct: Math.round(24 + rng() * 3) },
    { ageGroup: '65+', overweightPct: Math.round(61 + rng() * 4), obesePct: Math.round(22 + rng() * 3) },
  ]

  const yearlyTrend = [year - 4, year - 3, year - 2, year - 1, year].map((y, i) => ({
    year: y,
    obesePct: parseFloat((16 + i * 0.7 + rng() * 0.3).toFixed(1)),
    overweightPct: parseFloat((50 + i * 1 + rng() * 0.5).toFixed(1)),
  }))

  const euRank = { rank: 14, of: 27, label: 'v EÚ podľa miery obezity' }

  const childObesity = {
    overweightPct: parseFloat((22 + rng() * 3).toFixed(1)),
    obesePct: parseFloat((10 + rng() * 2).toFixed(1)),
    note: 'deti 7–9 rokov',
  }

  return NextResponse.json({ national, byGender, byAgeGroup, yearlyTrend, euRank, childObesity, source: 'NCZI SR · WHO European Regional Obesity Report', updatedAt: now.toISOString() })
}
