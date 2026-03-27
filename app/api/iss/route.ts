import { NextResponse } from 'next/server'

// Always dynamic – ISS moves every second, never cache at build time
export const dynamic = 'force-dynamic'

export async function GET() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 9000)
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      cache: 'no-store',
      headers: { 'User-Agent': 'InfoSK-Dashboard/1.0' },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`ISS API ${res.status}`)
    const data = await res.json()
    // Validate shape before returning
    if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
      throw new Error('Unexpected ISS API response shape')
    }
    return NextResponse.json(data)
  } catch (err) {
    clearTimeout(timer)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'ISS fetch failed' },
      { status: 500 }
    )
  }
}
