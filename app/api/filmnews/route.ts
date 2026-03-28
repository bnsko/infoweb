import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export const revalidate = 300

const FEEDS = [
  { name: 'Variety', url: 'https://variety.com/feed/' },
  { name: 'Deadline', url: 'https://deadline.com/feed/' },
  { name: 'Screen Rant', url: 'https://screenrant.com/feed/' },
]

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&lsquo;/g, '\u2018').replace(/&rsquo;/g, '\u2019')
    .replace(/&ldquo;/g, '\u201c').replace(/&rdquo;/g, '\u201d').replace(/&ndash;/g, '–')
    .trim()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractItems(parsed: any, sourceName: string) {
  const raw = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? []
  const arr: unknown[] = Array.isArray(raw) ? raw : [raw]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arr.slice(0, 6).map((item: any) => ({
    title: decodeHTMLEntities((item.title?.['#text'] ?? item.title ?? '').toString()),
    link: item.link?.['@_href'] ?? item.link ?? item.guid ?? '',
    description: decodeHTMLEntities(
      (item.description ?? item.summary ?? '').toString().replace(/<[^>]*>/g, '').trim().slice(0, 200)
    ),
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
