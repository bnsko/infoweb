import { NextResponse } from 'next/server'
import type { Flight } from '@/lib/types'

export const revalidate = 60

// Bounding box roughly around Slovakia
const LAMIN = 47.7
const LOMIN = 16.8
const LAMAX = 49.6
const LOMAX = 22.6

export async function GET() {
  try {
    const url = `https://opensky-network.org/api/states/all?lamin=${LAMIN}&lomin=${LOMIN}&lamax=${LAMAX}&lomax=${LOMAX}`

    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { 'User-Agent': 'InfoSK-Dashboard/1.0' },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error(`OpenSky ${res.status}`)
    const json = await res.json()

    // OpenSky state vector: [icao24, callsign, origin_country, time_position, last_contact,
    //   longitude, latitude, baro_altitude, on_ground, velocity, true_track, ...]
    const flights: Flight[] = (json.states ?? [])
      .filter((s: unknown[]) => s[1] && (s[1] as string).trim())
      .slice(0, 20)
      .map((s: unknown[]) => ({
        icao24: String(s[0] ?? ''),
        callsign: String(s[1] ?? '').trim(),
        origin_country: String(s[2] ?? ''),
        longitude: s[5] as number | null,
        latitude: s[6] as number | null,
        altitude: s[7] as number | null,
        velocity: s[9] !== null ? Math.round((s[9] as number) * 3.6) : null, // m/s → km/h
        true_track: s[10] as number | null,
        on_ground: Boolean(s[8]),
      }))

    return NextResponse.json({ flights, count: flights.length })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Flights fetch failed' },
      { status: 500 }
    )
  }
}
