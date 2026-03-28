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

  const [flightsRes, cityAQIRes, eurUsdRes, cityWeatherRes] = await Promise.allSettled([
    fetch(
      `https://opensky-network.org/api/states/all` +
        `?lamin=${SK_BBOX.lamin}&lomin=${SK_BBOX.lomin}&lamax=${SK_BBOX.lamax}&lomax=${SK_BBOX.lomax}`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000) }
    ),
    // Multi-location AQI for all SK cities at once
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}` +
        `&current=european_aqi&timezone=Europe%2FBratislava`,
      { next: { revalidate: 600 }, signal: AbortSignal.timeout(8000) }
    ),
    fetch('https://open.er-api.com/v6/latest/EUR', {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    }),
    // Multi-location weather call for all SK cities at once (expanded with feels-like, UV, sunrise/sunset)
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,weather_code,apparent_temperature` +
        `&daily=sunrise,sunset,uv_index_max,temperature_2m_max,temperature_2m_min` +
        `&timezone=Europe%2FBratislava&forecast_days=1`,
      { next: { revalidate: 600 }, signal: AbortSignal.timeout(8000) }
    ),
  ])

  let flightsCount = null
  let tempBA = null
  let aqi: number | null = null
  let aqiSK: number | null = null
  let eurToUsd = null
  let cityTemps: { key: string; name: string; temp: number; humidity: number; windSpeed: number; windDir: number; pressure: number; weatherCode: number; feelsLike: number; sunrise: string; sunset: string; uvIndex: number; tempMax: number; tempMin: number }[] = []
  let cityAQI: { key: string; name: string; aqi: number }[] = []

  if (flightsRes.status === 'fulfilled' && flightsRes.value.ok) {
    try {
      const j = await flightsRes.value.json()
      const airborne = (j.states ?? []).filter((s: unknown[]) => !s[8])
      flightsCount = airborne.length
    } catch { /* ignore */ }
  }

  if (cityAQIRes.status === 'fulfilled' && cityAQIRes.value.ok) {
    try {
      const j = await cityAQIRes.value.json()
      const arr = Array.isArray(j) ? j : [j]
      cityAQI = SK_CITIES.map((city, i) => ({
        key: city.key,
        name: city.name,
        aqi: Math.round(arr[i]?.current?.european_aqi ?? 0),
      }))
      aqi = cityAQI.find(c => c.key === 'BA')?.aqi ?? null
      const valid = cityAQI.filter(c => c.aqi > 0)
      aqiSK = valid.length > 0 ? Math.round(valid.reduce((s, c) => s + c.aqi, 0) / valid.length) : aqi
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
      const arr = Array.isArray(j) ? j : [j]
      cityTemps = SK_CITIES.map((city, i) => ({
        key: city.key,
        name: city.name,
        temp: Math.round(arr[i]?.current?.temperature_2m ?? 0),
        humidity: Math.round(arr[i]?.current?.relative_humidity_2m ?? 0),
        windSpeed: Math.round(arr[i]?.current?.wind_speed_10m ?? 0),
        windDir: Math.round(arr[i]?.current?.wind_direction_10m ?? 0),
        pressure: Math.round(arr[i]?.current?.surface_pressure ?? 0),
        weatherCode: arr[i]?.current?.weather_code ?? 0,
        feelsLike: Math.round(arr[i]?.current?.apparent_temperature ?? 0),
        sunrise: arr[i]?.daily?.sunrise?.[0] ?? '',
        sunset: arr[i]?.daily?.sunset?.[0] ?? '',
        uvIndex: arr[i]?.daily?.uv_index_max?.[0] ?? 0,
        tempMax: Math.round(arr[i]?.daily?.temperature_2m_max?.[0] ?? 0),
        tempMin: Math.round(arr[i]?.daily?.temperature_2m_min?.[0] ?? 0),
      }))
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
    aqiSK,
    eurToUsd,
    dayOfYear,
    daysInYear,
    timestamp: Date.now(),
    cityTemps,
    cityAQI,
  })
}
