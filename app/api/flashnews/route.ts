import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface FlashItem {
  title: string
  source: string
  link: string
  timestamp: number
  ago: string
}

function relativeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 60000)
  if (diff < 1) return 'práve teraz'
  if (diff < 60) return `pred ${diff} min`
  const h = Math.floor(diff / 60)
  if (h < 24) return `pred ${h} hod`
  return `pred ${Math.floor(h / 24)} d`
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/<!\[CDATA\[|\]\]>/g, '')
}

interface RSSSource {
  url: string
  name: string
}

const RSS_SOURCES: RSSSource[] = [
  { url: 'https://rss.sme.sk/rss/rss.asp?s=top', name: 'SME.sk' },
  { url: 'https://dennikn.sk/feed/', name: 'Denník N' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', name: 'NYTimes' },
  { url: 'https://www.aktuality.sk/rss/', name: 'Aktuality' },
]

async function fetchRSS(source: RSSSource): Promise<FlashItem[]> {
  try {
    const res = await fetch(source.url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items: FlashItem[] = []
    const entries = xml.split(/<item[ >]/).slice(1, 10)
    for (const entry of entries) {
      const titleMatch = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)
      const linkMatch = entry.match(/<link[^>]*>([\s\S]*?)<\/link>/) ?? entry.match(/<link[^>]*href="([^"]*)"/)
      const dateMatch = entry.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/) ?? entry.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/) ?? entry.match(/<published[^>]*>([\s\S]*?)<\/published>/)

      const title = titleMatch?.[1] ? decodeEntities(titleMatch[1].trim()) : ''
      const link = linkMatch?.[1]?.trim() ?? ''
      const dateStr = dateMatch?.[1]?.trim() ?? ''
      const ts = dateStr ? new Date(dateStr).getTime() : Date.now()

      if (title && !isNaN(ts)) {
        items.push({ title, source: source.name, link, timestamp: ts, ago: '' })
      }
    }
    return items
  } catch {
    return []
  }
}

export async function GET() {
  const results = await Promise.allSettled(RSS_SOURCES.map(s => fetchRSS(s)))

  let allItems: FlashItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') allItems.push(...r.value)
  }

  // Sort by timestamp descending, take top 5
  allItems.sort((a, b) => b.timestamp - a.timestamp)
  const top = allItems.slice(0, 12).map(item => ({
    ...item,
    ago: relativeAgo(item.timestamp),
  }))

  // Generate a simple extractive summary of the day's top stories
  const summaryItems = allItems.slice(0, 5).map(item => item.title)
  const summary = summaryItems.length > 0
    ? `🔑 ${summaryItems.join(' · ')}`
    : ''

  return NextResponse.json({ items: top, summary, timestamp: Date.now() })
}
