import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export const revalidate = 120

const FEEDS = [
  { name: 'Stellacentrum', url: 'https://www.stellacentrum.sk/rss/doprava.xml' },
  { name: 'Polícia SR', url: 'https://www.minv.sk/?rss-spravy-policia' },
]

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractItems(parsed: any, sourceName: string) {
  const raw = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? []
  const arr: unknown[] = Array.isArray(raw) ? raw : [raw]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return arr.slice(0, 10).map((item: any) => ({
    title: (item.title?.['#text'] ?? item.title ?? '').trim(),
    link: item.link?.['@_href'] ?? item.link ?? item.guid ?? '',
    description: (item.description ?? item.summary ?? '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 250),
    pubDate: item.pubDate ?? item.updated ?? '',
    source: sourceName,
  }))
}

async function fetchTomTomTraffic(): Promise<{ items: { title: string; link: string; description: string; pubDate: string; source: string }[]; accidents: number; jams: number; closures: number }> {
  try {
    const res = await fetch(
      'https://www.waze.com/row-partnerhub-api/partners/11027261871/waze-feeds/4f4f7e02-b1d1-4627-876c-1a348db427d0?format=1',
      { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'Mozilla/5.0 InfoSK/1.0' } }
    )
    if (!res.ok) return { items: [], accidents: 0, jams: 0, closures: 0 }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json()
    const alerts = data.alerts ?? []
    let accidents = 0, jams = 0, closures = 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    alerts.forEach((a: any) => {
      if (a.type === 'ACCIDENT') accidents++
      else if (a.type === 'JAM') jams++
      else if (a.type === 'ROAD_CLOSED') closures++
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = alerts.slice(0, 8).map((a: any) => ({
      title: a.type === 'ACCIDENT' ? `🚗 Nehoda: ${a.street ?? 'Neznáma cesta'}` :
             a.type === 'JAM' ? `🚦 Zápcha: ${a.street ?? 'Neznáma cesta'}` :
             a.type === 'ROAD_CLOSED' ? `🚧 Uzávierka: ${a.street ?? 'Neznáma cesta'}` :
             `⚠️ ${a.subtype ?? a.type}: ${a.street ?? ''}`,
      link: '',
      description: `${a.city ?? ''} ${a.street ?? ''} - ${a.subtype ?? a.type}`.trim(),
      pubDate: a.pubMillis ? new Date(a.pubMillis).toISOString() : '',
      source: 'Waze',
    }))
    return { items, accidents, jams, closures }
  } catch {
    return { items: [], accidents: 0, jams: 0, closures: 0 }
  }
}

export async function GET() {
  const [rssResults, wazeData] = await Promise.all([
    Promise.allSettled(
      FEEDS.map(async (feed) => {
        const res = await fetch(feed.url, {
          next: { revalidate: 120 },
          headers: { 'User-Agent': 'Mozilla/5.0 InfoSK-Dashboard/1.0' },
          signal: AbortSignal.timeout(7000),
        })
        const text = await res.text()
        const parsed = parser.parse(text)
        return extractItems(parsed, feed.name)
      })
    ),
    fetchTomTomTraffic(),
  ])

  const rssItems = rssResults
    .filter((r): r is PromiseFulfilledResult<ReturnType<typeof extractItems>> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .filter((i) => i.title)

  // Filter for traffic-related items from RSS
  const trafficKeywords = ['nehod', 'doprav', 'kolíz', 'zápch', 'uzávier', 'cest', 'diaľnic', 'obmedzeni', 'kolón', 'havári']
  const filtered = rssItems.filter(item => {
    const text = (item.title + ' ' + item.description).toLowerCase()
    return trafficKeywords.some(kw => text.includes(kw))
  })

  const allItems = [...wazeData.items, ...filtered].slice(0, 15)
  const total = allItems.length
  const congestion = total === 0 ? 'low' : total <= 4 ? 'moderate' : total <= 8 ? 'high' : 'severe'

  return NextResponse.json({
    items: allItems,
    stats: {
      accidents: wazeData.accidents,
      jams: wazeData.jams,
      closures: wazeData.closures,
      total,
      congestion,
    },
  })
}
