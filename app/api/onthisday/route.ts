import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VALID_TYPES = ['events', 'births', 'deaths', 'selected', 'holidays']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEntries(items: any[], currentYear: number, limit: number) {
  const all = items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((e: any) => ({
      year: e.year,
      text: e.text,
      pageTitle: e.pages?.[0]?.displaytitle ?? null,
      pageUrl: e.pages?.[0]?.content_urls?.desktop?.page ?? null,
    }))
    .filter((e: { text?: string; year?: number }) => e.text && e.text.length < 250)

  const recent = all.filter((e: { year: number }) => currentYear - e.year <= 200)
  const older = all.filter((e: { year: number }) => currentYear - e.year > 200)
  const picked = [
    ...recent.slice(-Math.ceil(limit * 0.8)),
    ...older.filter((_: unknown, i: number) => i % Math.max(1, Math.floor(older.length / 2)) === 0).slice(0, Math.floor(limit * 0.2)),
  ].sort((a: { year: number }, b: { year: number }) => b.year - a.year).slice(0, limit)
  return picked
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawType = searchParams.get('type') ?? 'events'
  const type = VALID_TYPES.includes(rawType) ? rawType : 'events'

  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/${type}/${month}/${day}`
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'InfoSK-Dashboard/1.0',
        Accept: 'application/json',
      },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`Wikipedia API ${res.status}`)
    const json = await res.json()

    const items = json[type] ?? json.events ?? json.births ?? json.deaths ?? json.selected ?? []
    const events = parseEntries(items, now.getFullYear(), 10)

    return NextResponse.json({ events, month, day, type })
  } catch (err) {
    clearTimeout(timer)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Wikipedia fetch failed' },
      { status: 500 }
    )
  }
}
