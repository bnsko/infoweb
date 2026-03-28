import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export const revalidate = 120

const FEEDS = [
  { name: 'Stellacentrum', url: 'https://www.stellacentrum.sk/rss/doprava.xml' },
  { name: 'Polícia SR', url: 'https://www.minv.sk/?rss-spravy-policia' },
  { name: 'SSC', url: 'https://www.cdb.sk/sk/dopravne-spravodajstvo.rss' },
  { name: 'NDS', url: 'https://www.ndsas.sk/rss/aktuality' },
]

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractItems(parsed: any, sourceName: string) {
  const raw = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? []
  const arr: unknown[] = Array.isArray(raw) ? raw : [raw]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arr.slice(0, 12).map((item: any) => ({
    title: (item.title?.['#text'] ?? item.title ?? '').trim(),
    link: item.link?.['@_href'] ?? item.link ?? item.guid ?? '',
    description: (item.description ?? item.summary ?? '')
      .toString()
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 250),
    pubDate: item.pubDate ?? item.updated ?? '',
    source: sourceName,
  }))
}

export async function GET() {
  const rssResults = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        next: { revalidate: 120 },
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)' },
        signal: AbortSignal.timeout(7000),
      })
      if (!res.ok) return []
      const text = await res.text()
      const parsed = parser.parse(text)
      return extractItems(parsed, feed.name)
    })
  )

  const rssItems = rssResults
    .filter((r): r is PromiseFulfilledResult<ReturnType<typeof extractItems>> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((i) => i.title)

  // Filter for traffic-related items from RSS
  const trafficKeywords = ['nehod', 'doprav', 'kolíz', 'zápch', 'uzávier', 'cest', 'diaľnic', 'obmedzeni', 'kolón', 'havári', 'prejazdnostt', 'tunel', 'hmlou', 'námra', 'prerušen', 'úsek']
  const filtered = rssItems.filter(item => {
    const text = (item.title + ' ' + item.description).toLowerCase()
    return trafficKeywords.some(kw => text.includes(kw))
  })

  // Also include all items from traffic-specific sources
  const trafficSources = ['SSC', 'NDS']
  const fromTrafficSources = rssItems.filter(item => trafficSources.includes(item.source))

  const seen = new Set<string>()
  const allItems = [...filtered, ...fromTrafficSources].filter(item => {
    if (seen.has(item.title)) return false
    seen.add(item.title)
    return true
  })

  // Add incident type icons
  const items = allItems.slice(0, 15).map(item => {
    const tl = item.title.toLowerCase()
    if (!item.title.includes('🚗') && !item.title.includes('🚦') && !item.title.includes('🚧')) {
      if (tl.includes('nehod') || tl.includes('kolíz') || tl.includes('havári')) item.title = '🚗 ' + item.title
      else if (tl.includes('zápch') || tl.includes('kolón')) item.title = '🚦 ' + item.title
      else if (tl.includes('uzávier') || tl.includes('prerušen')) item.title = '🚧 ' + item.title
      else item.title = '⚠️ ' + item.title
    }
    return item
  })

  const accidents = items.filter(i => i.title.includes('🚗')).length
  const jams = items.filter(i => i.title.includes('🚦')).length
  const closures = items.filter(i => i.title.includes('🚧')).length
  const total = items.length
  const congestion = total === 0 ? 'low' : total <= 4 ? 'moderate' : total <= 8 ? 'high' : 'severe'

  return NextResponse.json({
    items,
    stats: { accidents, jams, closures, total, congestion },
  })
}
