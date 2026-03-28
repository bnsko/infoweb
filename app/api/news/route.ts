import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export const revalidate = 300

const FEEDS = [
  { name: 'SME', url: 'https://rss.sme.sk/rss/rss.asp?pub=sme' },
  { name: 'Aktuality', url: 'https://www.aktuality.sk/rss/' },
  { name: 'HN Online', url: 'https://hnonline.sk/rss' },
  { name: 'TASR', url: 'https://www.teraz.sk/rss/slovensko.rss' },
  { name: 'Pravda', url: 'https://spravy.pravda.sk/rss/xml/' },
]

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
    .replace(/&lsquo;/g, '‘').replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .trim()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractItems(parsed: any, sourceName: string) {
  const raw = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? []
  const arr: unknown[] = Array.isArray(raw) ? raw : [raw]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arr.slice(0, 8).map((item: any) => ({
    title: decodeHTMLEntities((item.title?.['#text'] ?? item.title ?? '').toString()),
    link: item.link?.['@_href'] ?? item.link ?? item.guid ?? '',
    description: decodeHTMLEntities(
      (item.description ?? item.summary ?? '').toString()
        .replace(/<[^>]*>/g, '')
        .trim()
        .slice(0, 220)
    ),
    pubDate: item.pubDate ?? item.updated ?? item.published ?? '',
    source: sourceName,
  }))
}

export async function GET() {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        next: { revalidate: 300 },
        headers: { 'User-Agent': 'Mozilla/5.0 InfoSK-Dashboard/1.0' },
        signal: AbortSignal.timeout(6000),
      })
      const text = await res.text()
      const parsed = parser.parse(text)
      return extractItems(parsed, feed.name)
    })
  )

  const allItems = results
    .filter((r): r is PromiseFulfilledResult<ReturnType<typeof extractItems>> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((i) => i.title)

  // Deduplicate by normalizing titles (remove punctuation/spaces, lowercase)
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-záäčďéíĺľňóôŕšťúýž0-9]/g, '').slice(0, 40)
  const seenKeys: string[] = []
  const items = allItems.filter(item => {
    const key = normalize(item.title)
    const prefix = key.slice(0, 30)
    if (seenKeys.some(s => s === key || s.startsWith(prefix) || prefix.startsWith(s.slice(0, 30)))) return false
    seenKeys.push(key)
    return true
  })

  // Sort by date descending
  items.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0
    return db - da
  })

  return NextResponse.json({ items })
}
