import { NextResponse } from 'next/server'

export const revalidate = 300

const COINS = 'bitcoin,ethereum,solana,binancecoin,ripple'

export async function GET() {
  try {
    const url =
      `https://api.coingecko.com/api/v3/coins/markets` +
      `?vs_currency=eur&ids=${COINS}&order=market_cap_desc` +
      `&per_page=5&page=1&sparkline=true&price_change_percentage=24h,7d`

    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Crypto fetch failed' },
      { status: 500 }
    )
  }
}
