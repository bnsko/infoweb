import { NextResponse } from 'next/server'

export const revalidate = 600

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') ?? '48.1486'
  const lon = searchParams.get('lon') ?? '17.1077'

  try {
    const url =
      `https://air-quality-api.open-meteo.com/v1/air-quality` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=pm10,pm2_5,carbon_monoxide,ozone,european_aqi,nitrogen_dioxide` +
      `&timezone=Europe%2FBratislava`

    const res = await fetch(url, { next: { revalidate: 600 } })
    if (!res.ok) throw new Error(`OpenMeteo AQ ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Air quality fetch failed' },
      { status: 500 }
    )
  }
}
