import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SK_BBOX = { lamin: 47.7, lomin: 16.8, lamax: 49.6, lomax: 22.6 }

// 8 Slovak regional capitals + High Tatras
const SK_CITIES = [
  { key: 'BA', name: 'Bratislava',     lat: 48.1486, lon: 17.1077 },
  { key: 'KE', name: 'Košice',         lat: 48.7163, lon: 21.2611 },
  { key: 'ZA', name: 'Žilina',         lat: 49.2231, lon: 18.7394 },
  { key: 'PO', name: 'Prešov',         lat: 49.0017, lon: 21.2391 },
  { key: 'NR', name: 'Nitra',          lat: 48.3069, lon: 18.0869 },
  { key: 'BB', name: 'Banská Bystrica',lat: 48.7356, lon: 19.1503 },
  { key: 'TT', name: 'Trnava',         lat: 48.3774, lon: 17.5872 },
  { key: 'TATRY', name: 'Vys. Tatry',  lat: 49.1972, lon: 20.2129 },
]

export async function GET() {
  const lats = SK_CITIES.map(c => c.lat).join(',')
  const lons = SK_CITIES.map(c => c.lon).join(',')

  const [flightsRes, aqRes, eurUsdRes, cityWeatherRes] = await Promise.allSettled([
    fetch(
      `https://opensky-network.org/api/states/all` +
        `?lamin=${SK_BBOX.lamin}&lomin=${SK_BBOX.lomin}&lamax=${SK_BBOX.lamax}&lomax=${SK_BBOX.lomax}`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) }
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
    // Multi-location weather call for all SK cities at once
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
        `&current=temperature_2m&timezone=Europe%2FBratislava`,
      { next: { revalidate: 600 }, signal: AbortSignal.timeout(8000) }
    ),
  ])

  let flightsCount = null
  let tempBA = null
  let aqi = null
  let eurToUsd = null
  let cityTemps: { key: string; name: string; temp: number }[] = []

  if (flightsRes.status === 'fulfilled' && flightsRes.value.ok) {
    try {
      const j = await flightsRes.value.json()
      const airborne = (j.states ?? []).filter((s: unknown[]) => !s[8])
      flightsCount = airborne.length
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

  if (cityWeatherRes.status === 'fulfilled' && cityWeatherRes.value.ok) {
    try {
      const j = await cityWeatherRes.value.json()
      // Open-Meteo returns array when multiple coords given
      const arr = Array.isArray(j) ? j : [j]
      cityTemps = SK_CITIES.map((city, i) => ({
        key: city.key,
        name: city.name,
        temp: Math.round(arr[i]?.current?.temperature_2m ?? 0),
      }))
      // BA temp from city data
      tempBA = cityTemps.find(c => c.key === 'BA')?.temp ?? null
    } catch { /* fallback */ }
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
    cityTemps,
  })
}
