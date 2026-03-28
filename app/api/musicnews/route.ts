import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export const revalidate = 300

const FEEDS = [
  { name: 'NME', url: 'https://www.nme.com/feed' },
  { name: 'Pitchfork', url: 'https://pitchfork.com/rss/news/feed.xml' },
  { name: 'Consequence', url: 'https://consequence.net/feed' },
]

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8220;/g, '\u201c')
    .replace(/&#8221;/g, '\u201d')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#[0-9]+;/g, (m) => String.fromCharCode(parseInt(m.slice(2, -1))))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractItems(parsed: any, sourceName: string) {
  const raw = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? []
  const arr: unknown[] = Array.isArray(raw) ? raw : [raw]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arr.slice(0, 6).map((item: any) => ({
    title: decodeHTMLEntities((item.title?.['#text'] ?? item.title ?? '').trim()),
    link: item.link?.['@_href'] ?? item.link ?? item.guid ?? '',
    description: decodeHTMLEntities(
      (item.description ?? item.summary ?? item['content:encoded'] ?? '')
        .replace(/<[^>]*>/g, '')
        .trim()
        .slice(0, 200)
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
