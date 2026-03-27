import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SK_BBOX = { lamin: 47.7, lomin: 16.8, lamax: 49.6, lomax: 22.6 }

export async function GET() {
  const [flightsRes, weatherRes, aqRes, eurUsdRes] = await Promise.allSettled([
    fetch(
      `https://opensky-network.org/api/states/all` +
        `?lamin=${SK_BBOX.lamin}&lomin=${SK_BBOX.lomin}&lamax=${SK_BBOX.lamax}&lomax=${SK_BBOX.lomax}`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) }
    ),
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=48.1486&longitude=17.1077` +
        `&current=temperature_2m,wind_speed_10m,weather_code&timezone=Europe/Bratislava`,
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) }
    ),
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=48.1486&longitude=17.1077` +
        `&current=european_aqi&timezone=Europe/Bratislava`,
      { next: { revalidate: 600 }, signal: AbortSignal.timeout(5000) }
    ),
    fetch('https://open.er-api.com/v6/latest/EUR', {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    }),
  ])

  let flightsCount = null
  let tempBA = null
  let aqi = null
  let eurToUsd = null

  if (flightsRes.status === 'fulfilled' && flightsRes.value.ok) {
    try {
      const j = await flightsRes.value.json()
      const airborne = (j.states ?? []).filter((s: unknown[]) => !s[8])
      flightsCount = airborne.length
    } catch { /* ignore */ }
  }

  if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
    try {
      const j = await weatherRes.value.json()
      tempBA = Math.round(j.current?.temperature_2m ?? 0)
    } catch { /* ignore */ }
  }

  if (aqRes.status === 'fulfilled' && aqRes.value.ok) {
    try {
      const j = await aqRes.value.json()
      aqi = j.current?.european_aqi ?? null
    } catch { /* ignore */ }
  }

  if (eurUsdRes.status === 'fulfilled' && eurUsdRes.value.ok) {
    try {
      const j = await eurUsdRes.value.json()
      eurToUsd = j.rates?.USD ?? null
    } catch { /* ignore */ }
  }

  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000)
  const daysInYear = (now.getFullYear() % 4 === 0) ? 366 : 365

  return NextResponse.json({
    flightsCount,
    tempBA,
    aqi,
    eurToUsd,
    dayOfYear,
    daysInYear,
    timestamp: Date.now(),
  })
}
