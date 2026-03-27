import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export const revalidate = 300

const FEEDS = [
  { name: 'History', url: 'https://feeds.feedburner.com/historyextra-all-content' },
  { name: 'Smithsonian', url: 'https://www.smithsonianmag.com/rss/history/' },
]

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractItems(parsed: any, sourceName: string) {
  const raw = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? []
  const arr: unknown[] = Array.isArray(raw) ? raw : [raw]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arr.slice(0, 8).map((item: any) => ({
    title: (item.title?.['#text'] ?? item.title ?? '').trim(),
    link: item.link?.['@_href'] ?? item.link ?? item.guid ?? '',
    description: (item.description ?? item.summary ?? '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 200),
    pubDate: item.pubDate ?? item.updated ?? '',
    source: sourceName,
  }))
}

export async function GET() {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        next: { revalidate: 300 },
        headers: { 'User-Agent': 'Mozilla/5.0 InfoSK-Dashboard/1.0' },
        signal: AbortSignal.timeout(7000),
      })
      const text = await res.text()
      const parsed = parser.parse(text)
      return extractItems(parsed, feed.name)
    })
  )

  const items = results
    .filter((r): r is PromiseFulfilledResult<ReturnType<typeof extractItems>> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((i) => i.title)

  return NextResponse.json({ items })
}
