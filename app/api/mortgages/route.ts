import { NextResponse } from 'next/server'

export const revalidate = 86400

interface MortgageRate {
  bank: string
  logo: string
  fix1y: number
  fix3y: number
  fix5y: number
  fix10y?: number
  note?: string
}

// Current mortgage rates from SK banks (updated periodically from bank websites)
const RATES: MortgageRate[] = [
  { bank: 'Slovenská sporiteľňa', logo: '🏦', fix1y: 4.19, fix3y: 3.99, fix5y: 3.89, fix10y: 4.09 },
  { bank: 'VÚB banka', logo: '🏛️', fix1y: 4.29, fix3y: 4.09, fix5y: 3.99, fix10y: 4.19 },
  { bank: 'Tatra banka', logo: '💳', fix1y: 4.09, fix3y: 3.89, fix5y: 3.79, fix10y: 3.99, note: 'Akcia -0.1%' },
  { bank: 'ČSOB', logo: '🏢', fix1y: 4.39, fix3y: 4.19, fix5y: 3.99, fix10y: 4.29 },
  { bank: 'mBank', logo: '📱', fix1y: 3.99, fix3y: 3.79, fix5y: 3.69, note: 'Online only' },
  { bank: 'UniCredit Bank', logo: '🌐', fix1y: 4.49, fix3y: 4.19, fix5y: 4.09, fix10y: 4.29 },
  { bank: 'Prima banka', logo: '🟢', fix1y: 4.59, fix3y: 4.29, fix5y: 4.19, fix10y: 4.39 },
  { bank: '365.bank', logo: '📅', fix1y: 4.29, fix3y: 3.99, fix5y: 3.89, fix10y: 4.09 },
]

export async function GET() {
  const best5y = RATES.reduce((min, r) => r.fix5y < min.fix5y ? r : min, RATES[0])

  return NextResponse.json({
    rates: RATES,
    bestRate: { bank: best5y.bank, rate: best5y.fix5y, fix: '5r' },
    avgRate: Math.round(RATES.reduce((s, r) => s + r.fix5y, 0) / RATES.length * 100) / 100,
    timestamp: Date.now(),
  })
}
