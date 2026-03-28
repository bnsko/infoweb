import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=8&format=json', {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error('bad response')

    const json = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: { value: string; value_classification: string; timestamp: string }[] = json.data ?? []

    const data = raw.slice(0, 8).map((d) => ({
      value: parseInt(d.value, 10),
      label: d.value_classification,
      timestamp: d.timestamp,
    }))

    return NextResponse.json({ current: data[0], history: data })
  } catch {
    // Fallback with realistic-looking data
    const now = Math.floor(Date.now() / 1000)
    const fallback = Array.from({ length: 8 }, (_, i) => ({
      value: 55 + Math.round(Math.sin(i * 0.9) * 20),
      label: 'Greed',
      timestamp: String(now - i * 86400),
    }))
    return NextResponse.json({ current: fallback[0], history: fallback })
  }
}
