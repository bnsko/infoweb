import { NextResponse } from 'next/server'
import type { Flight } from '@/lib/types'

export const revalidate = 60

const LAMIN = 47.7, LOMIN = 16.8, LAMAX = 49.6, LOMAX = 22.6

// Estimate realistic flight count based on time of day
// Slovakia typically has 30-80 aircraft overhead during busy hours
function estimateFlights(): { flights: Flight[], count: number, estimated: boolean } {
  const now = new Date()
  const hour = now.getUTCHours()
  // Rough pattern: peak 8-20 UTC, quiet at night
  const baseCount = hour >= 6 && hour <= 20 ? 35 + Math.floor(Math.sin((hour - 6) * Math.PI / 14) * 40) : 5 + Math.floor(Math.random() * 10)
  // Add some variance
  const count = baseCount + Math.floor(Math.random() * 10) - 5

  const airlines = ['OK-', 'OM-', 'HA-', 'SP-', 'OE-', 'D-A', 'G-', 'EI-', 'F-', 'LZ-']
  const flights: Flight[] = Array.from({ length: Math.min(count, 20) }, (_, i) => {
    const prefix = airlines[i % airlines.length]
    return {
      icao24: `fake${i.toString(16).padStart(4, '0')}`,
      callsign: `${prefix}${String(1000 + i + Math.floor(Math.random() * 8000))}`,
      origin_country: ['Slovakia', 'Czech Republic', 'Hungary', 'Poland', 'Austria', 'Germany'][i % 6],
      longitude: LOMIN + Math.random() * (LOMAX - LOMIN),
      latitude: LAMIN + Math.random() * (LAMAX - LAMIN),
      altitude: 8000 + Math.random() * 4000,
      velocity: 600 + Math.floor(Math.random() * 300),
      true_track: Math.random() * 360,
      on_ground: false,
    }
  })

  return { flights, count, estimated: true }
}

export async function GET() {
  try {
    const url = `https://opensky-network.org/api/states/all?lamin=${LAMIN}&lomin=${LOMIN}&lamax=${LAMAX}&lomax=${LOMAX}`
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { 'User-Agent': 'SlovakiaInfo-Dashboard/1.0' },
      signal: AbortSignal.timeout(6000),
    })

    if (!res.ok) throw new Error(`OpenSky ${res.status}`)
    const json = await res.json()

    const flights: Flight[] = (json.states ?? [])
      .filter((s: unknown[]) => s[1] && (s[1] as string).trim() && !s[8])
      .slice(0, 30)
      .map((s: unknown[]) => ({
        icao24: String(s[0] ?? ''),
        callsign: String(s[1] ?? '').trim(),
        origin_country: String(s[2] ?? ''),
        longitude: s[5] as number | null,
        latitude: s[6] as number | null,
        altitude: s[7] as number | null,
        velocity: s[9] !== null ? Math.round((s[9] as number) * 3.6) : null,
        true_track: s[10] as number | null,
        on_ground: Boolean(s[8]),
      }))

    // If OpenSky returns 0, use estimate
    if (flights.length === 0) {
      const est = estimateFlights()
      return NextResponse.json({ flights: est.flights, count: est.count, estimated: true })
    }

    return NextResponse.json({ flights, count: flights.length, estimated: false })
  } catch {
    const est = estimateFlights()
    return NextResponse.json({ flights: est.flights, count: est.count, estimated: true })
  }
}
