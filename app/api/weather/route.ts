import { NextResponse } from 'next/server'

export const revalidate = 600

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') ?? '48.1486'
  const lon = searchParams.get('lon') ?? '17.1077'

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,precipitation,cloud_cover` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,sunrise,sunset,uv_index_max` +
      `&hourly=uv_index` +
      `&timezone=Europe%2FBratislava&forecast_days=14&wind_speed_unit=kmh`

    const res = await fetch(url, { next: { revalidate: 600 } })
    if (!res.ok) throw new Error(`OpenMeteo error: ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Weather fetch failed' },
      { status: 500 }
    )
  }
}
