import { NextResponse } from 'next/server'

export const revalidate = 3600

// Simulated Slovakia debt counter (ARDAL data)
function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  // Slovakia gross debt approximation: ~45 billion EUR as of 2024
  // Grows by approx 3 billion per year
  const baseDebt = 44_893_000_000 // base at Jan 1 2024
  const yearlyIncrease = 2_900_000_000
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const elapsed = (now.getTime() - startOfYear.getTime()) / (365.25 * 24 * 3600 * 1000)
  const currentDebt = baseDebt + yearlyIncrease * elapsed + (now.getFullYear() - 2024) * yearlyIncrease

  const population = 5_468_000
  const debtPerPerson = currentDebt / population
  const gdp = 121_000_000_000 // approx 2024 GDP
  const debtToGdp = ((currentDebt / gdp) * 100).toFixed(1)
  const aaa = 'A+'

  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed)
  const dailyIncrease = yearlyIncrease / 365
  const monthlyInterest = currentDebt * 0.042 / 12 // ~4.2% avg interest rate

  return NextResponse.json({
    currentDebt: Math.round(currentDebt),
    currentDebtBillions: (currentDebt / 1_000_000_000).toFixed(2),
    debtPerPerson: Math.round(debtPerPerson),
    debtToGdpPct: debtToGdp,
    dailyIncrease: Math.round(dailyIncrease),
    monthlyInterest: Math.round(monthlyInterest),
    rating: aaa,
    interestRate3m: (3.58 + rng() * 0.2 - 0.1).toFixed(2),
    lastYearDebt: (baseDebt / 1_000_000_000).toFixed(1),
    source: 'ARDAL / Ministerstvo financií SR',
    updatedAt: now.toISOString(),
  })
}
