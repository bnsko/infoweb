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

/* ── Known speed camera sections in Slovakia ── */
const SPEED_CAMERAS = [
  { road: 'D1', location: 'Bratislava – Senec (pri Blatnom)', type: 'section', limit: 130 },
  { road: 'D1', location: 'Považská Bystrica – tunel Považský Chlmec', type: 'section', limit: 90 },
  { road: 'D1', location: 'Mengusovce – Jánovce', type: 'section', limit: 130 },
  { road: 'D1', location: 'Tunel Bôrik', type: 'section', limit: 80 },
  { road: 'D1', location: 'Tunel Višňové (vo výstavbe)', type: 'section', limit: 80 },
  { road: 'D2', location: 'Bratislava – Stupava', type: 'section', limit: 130 },
  { road: 'D3', location: 'Tunel Horelica', type: 'section', limit: 80 },
  { road: 'R1', location: 'Nitra – Selenec', type: 'section', limit: 110 },
  { road: 'R2', location: 'Zvolen – Pstruša', type: 'section', limit: 110 },
  { road: 'I/61', location: 'Bratislava – Petržalka, Rusovská', type: 'fixed', limit: 50 },
  { road: 'I/2', location: 'Bratislava – Rožňavská', type: 'fixed', limit: 60 },
  { road: 'I/63', location: 'Šamorín – Gabčíkovo', type: 'fixed', limit: 90 },
  { road: 'D1', location: 'Bratislava – Prístavný most', type: 'fixed', limit: 80 },
  { road: 'I/18', location: 'Žilina – Strečno', type: 'fixed', limit: 60 },
]

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

/* Keywords for categorization */
const restrictionKeywords = ['uzávier', 'obmedzeni', 'prerušen', 'práce', 'oprav', 'rekonštruk', 'výluky', 'reguláci', 'odklon', 'prejazdnost']
const incidentKeywords = ['nehod', 'kolíz', 'zápch', 'havári', 'kolón', 'požiar']

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
  const trafficKeywords = ['nehod', 'doprav', 'kolíz', 'zápch', 'uzávier', 'cest', 'diaľnic', 'obmedzeni', 'kolón', 'havári', 'prejazdnost', 'tunel', 'hmlou', 'námra', 'prerušen', 'úsek']
  const filtered = rssItems.filter(item => {
    const text = (item.title + ' ' + item.description).toLowerCase()
    return trafficKeywords.some(kw => text.includes(kw))
  })

  const trafficSources = ['SSC', 'NDS']
  const fromTrafficSources = rssItems.filter(item => trafficSources.includes(item.source))

  const seen = new Set<string>()
  const allItems = [...filtered, ...fromTrafficSources].filter(item => {
    if (seen.has(item.title)) return false
    seen.add(item.title)
    return true
  })

  // Categorize and add icons
  const incidents: typeof allItems = []
  const restrictions: typeof allItems = []

  for (const item of allItems.slice(0, 20)) {
    const tl = (item.title + ' ' + item.description).toLowerCase()
    const isRestriction = restrictionKeywords.some(kw => tl.includes(kw))
    const isIncident = incidentKeywords.some(kw => tl.includes(kw))

    if (!item.title.match(/^[🚗🚦🚧⚠️🔧]/)) {
      if (tl.includes('nehod') || tl.includes('kolíz') || tl.includes('havári')) item.title = '🚗 ' + item.title
      else if (tl.includes('zápch') || tl.includes('kolón')) item.title = '🚦 ' + item.title
      else if (tl.includes('uzávier') || tl.includes('prerušen')) item.title = '🚧 ' + item.title
      else if (isRestriction) item.title = '🔧 ' + item.title
      else item.title = '⚠️ ' + item.title
    }

    if (isRestriction && !isIncident) restrictions.push(item)
    else incidents.push(item)
  }

  const accidents = incidents.filter(i => i.title.includes('🚗')).length
  const jams = incidents.filter(i => i.title.includes('🚦')).length
  const closures = incidents.filter(i => i.title.includes('🚧')).length
  const total = incidents.length
  const congestion = total === 0 ? 'low' : total <= 4 ? 'moderate' : total <= 8 ? 'high' : 'severe'

  return NextResponse.json({
    items: incidents,
    restrictions,
    speedCameras: SPEED_CAMERAS,
    stats: { accidents, jams, closures, total, congestion },
  })
}
