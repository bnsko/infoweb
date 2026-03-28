import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export const revalidate = 300

const EU_FEEDS = [
  { name: 'Reuters Business',    url: 'https://feeds.reuters.com/reuters/businessNews' },
  { name: 'BBC Business',        url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
  { name: 'FT Markets',          url: 'https://www.ft.com/?edition=europe&format=rss' },
]

const US_FEEDS = [
  { name: 'CNBC Markets',        url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114' },
  { name: 'AP Business',         url: 'https://apnews.com/hub/business/feed' },
  { name: 'MarketWatch',         url: 'https://feeds.marketwatch.com/marketwatch/marketpulse/' },
]

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/&#8217;/g, '\u2019').replace(/&#8216;/g, '\u2018')
    .replace(/&#8220;/g, '\u201c').replace(/&#8221;/g, '\u201d')
    .replace(/&#8211;/g, '\u2013').replace(/&#8212;/g, '\u2014')
    .replace(/&#[0-9]+;/g, m => String.fromCharCode(parseInt(m.slice(2, -1))))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractItems(parsed: any, sourceName: string, region: 'EU' | 'US') {
  const raw = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? []
  const arr: unknown[] = Array.isArray(raw) ? raw : [raw]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arr.slice(0, 5).map((item: any) => ({
    title: decodeHTMLEntities((item.title?.['#text'] ?? item.title ?? '').trim()),
    link: item.link?.['@_href'] ?? item.link ?? item.guid ?? '',
    description: decodeHTMLEntities(
      (item.description ?? item.summary ?? item['content:encoded'] ?? '')
        .replace(/<[^>]*>/g, '').trim().slice(0, 200)
    ),
    pubDate: item.pubDate ?? item.updated ?? '',
    source: sourceName,
    region,
  }))
}

export async function GET() {
  const allFeeds = [
    ...EU_FEEDS.map(f => ({ ...f, region: 'EU' as const })),
    ...US_FEEDS.map(f => ({ ...f, region: 'US' as const })),
  ]

  const results = await Promise.allSettled(
    allFeeds.map(async (feed) => {
      const res = await fetch(feed.url, {
        next: { revalidate: 300 },
        headers: { 'User-Agent': 'Mozilla/5.0 InfoSK-Dashboard/1.0' },
        signal: AbortSignal.timeout(7000),
      })
      const text = await res.text()
      const parsed = parser.parse(text)
      return extractItems(parsed, feed.name, feed.region)
    })
  )

  const all = results
    .filter((r): r is PromiseFulfilledResult<ReturnType<typeof extractItems>> => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(i => i.title)

  const eu = all.filter(i => i.region === 'EU')
  const us = all.filter(i => i.region === 'US')

  return NextResponse.json({ eu, us })
}
