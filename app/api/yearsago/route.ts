import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface WikiEvent {
  year: number
  text: string
  pageTitle: string | null
  pageUrl: string | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEntries(items: any[]): WikiEvent[] {
  return items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((e: any) => ({
      year: Number(e.year),
      text: e.text ?? '',
      pageTitle: e.pages?.[0]?.displaytitle ?? null,
      pageUrl: e.pages?.[0]?.content_urls?.desktop?.page ?? null,
    }))
    .filter(e => e.text && e.text.length < 300 && !isNaN(e.year))
}

const MILESTONES = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 500]

export async function GET() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()

  const targetYears = MILESTONES.map(m => currentYear - m).filter(y => y > 0)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const types = ['selected', 'events', 'births', 'deaths'] as const
    const allEvents: WikiEvent[] = []

    for (const type of types) {
      const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/${type}/${month}/${day}`
      const res = await fetch(url, {
        next: { revalidate: 3600 },
        headers: { 'User-Agent': 'InfoSK-Dashboard/1.0', Accept: 'application/json' },
        signal: controller.signal,
      })
      if (!res.ok) continue
      const json = await res.json()
      const items = json[type] ?? []
      const parsed = parseEntries(items)
      parsed.forEach(e => {
        if (!allEvents.some(x => x.year === e.year && x.text === e.text)) {
          allEvents.push(e)
        }
      })
    }
    clearTimeout(timer)

    // Match events to milestones
    const matches: { yearsAgo: number; year: number; events: WikiEvent[] }[] = []
    for (const yearsAgo of MILESTONES) {
      const targetYear = currentYear - yearsAgo
      if (targetYear <= 0) continue
      const evts = allEvents.filter(e => e.year === targetYear)
      if (evts.length > 0) {
        matches.push({ yearsAgo, year: targetYear, events: evts.slice(0, 3) })
      }
    }

    return NextResponse.json({ matches, month, day })
  } catch (err) {
    clearTimeout(timer)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'fetch failed' }, { status: 500 })
  }
}
