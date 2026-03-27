import { NextResponse } from 'next/server'

export const revalidate = 600

// Expanded bounding box around Slovakia + Carpathian seismic zone
const LAT_MIN = 46.0
const LAT_MAX = 51.5
const LON_MIN = 14.0
const LON_MAX = 24.5

export async function GET() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const url =
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
      `&minmagnitude=1.5` +
      `&minlatitude=${LAT_MIN}&maxlatitude=${LAT_MAX}` +
      `&minlongitude=${LON_MIN}&maxlongitude=${LON_MAX}` +
      `&limit=15&orderby=time`

    const res = await fetch(url, {
      next: { revalidate: 600 },
      headers: { 'User-Agent': 'InfoSK-Dashboard/1.0' },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`USGS API ${res.status}`)
    const json = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const earthquakes = (json.features ?? []).map((f: any) => ({
      id: f.id,
      mag: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      url: f.properties.url,
      depth: Math.round(f.geometry?.coordinates?.[2] ?? 0),
    }))

    return NextResponse.json({ earthquakes })
  } catch (err) {
    clearTimeout(timer)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Earthquakes fetch failed' },
      { status: 500 }
    )
  }
}
