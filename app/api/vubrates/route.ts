import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export async function GET() {
  const now = new Date()
  const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rand = seededRandom(daySeed + 777)

  const ecbRates: Record<string, number> = {
    USD: 1.0850, GBP: 0.8580, CHF: 0.9430, CZK: 25.15, PLN: 4.28,
    HUF: 395.5, JPY: 162.8, CAD: 1.49, AUD: 1.67, SEK: 11.25,
    NOK: 11.55, DKK: 7.46, HRK: 7.53, RON: 4.97, BGN: 1.96,
    TRY: 34.50, RSD: 117.2, THB: 37.5,
  }

  const rates = Object.entries(ecbRates).map(([currency, mid]) => {
    const spread = mid * (0.015 + rand() * 0.02)
    const buy = mid - spread
    const sell = mid + spread
    const change = (rand() - 0.5) * mid * 0.01

    return {
      currency,
      buy: +buy.toFixed(4),
      sell: +sell.toFixed(4),
      mid: +mid.toFixed(4),
      change: +change.toFixed(4),
      trend: change > 0 ? 'up' as const : change < -0.0001 ? 'down' as const : 'stable' as const,
    }
  })

  return NextResponse.json({
    rates,
    bank: 'VÚB banka',
    validFrom: now.toISOString().slice(0, 10),
    timestamp: now.getTime(),
  })
}
