import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function fetchFeed(url: string, source: string, maxItems = 5): Promise<{ title: string; link: string; source: string }[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(8000) })
    if (!res.ok) return []
    const text = await res.text()
    const items: { title: string; link: string; source: string }[] = []
    const itemMatches = text.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []
    for (const item of itemMatches.slice(0, maxItems)) {
      const title = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() ?? ''
      const link = item.match(/<link[^>]*>(.*?)<\/link>/i)?.[1]?.trim() ?? ''
      if (title && link) items.push({ title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'), link, source })
    }
    return items
  } catch {
    return []
  }
}

export async function GET() {
  const results = await Promise.allSettled([
    fetchFeed('https://www.startitup.sk/feed/', 'StartItUp', 4),
    fetchFeed('https://www.touchit.sk/feed/', 'TouchIT', 4),
    fetchFeed('https://www.trend.sk/rss', 'Trend', 4),
    fetchFeed('https://forbes.sk/feed/', 'Forbes SK', 3),
    fetchFeed('https://dennikn.sk/tema/startupy/feed/', 'Denník N', 3),
  ])

  const items = results
    .filter((r): r is PromiseFulfilledResult<{ title: string; link: string; source: string }[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .slice(0, 15)

  return NextResponse.json({
    items,
    count: items.length,
    timestamp: Date.now(),
  })
}
