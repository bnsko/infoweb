import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Podcast {
  title: string
  show: string
  link: string
  audioUrl?: string
  date: string
  duration?: string
}

const PODCAST_FEEDS = [
  { name: 'Denník N', url: 'https://dennikn.sk/podcast/feed/' },
  { name: 'Startitup', url: 'https://feeds.acast.com/public/shows/startitup-podcast' },
  { name: 'Lužifčák', url: 'https://anchor.fm/s/e5ca6b4c/podcast/rss' },
  { name: 'Recast', url: 'https://anchor.fm/s/db50cba8/podcast/rss' },
  { name: 'Dobré ráno', url: 'https://podcasty.sme.sk/rss/dobre-rano' },
  { name: 'Index', url: 'https://podcasty.sme.sk/rss/index' },
  { name: 'Forbes SK', url: 'https://anchor.fm/s/e4f80b38/podcast/rss' },
  { name: 'Pravda', url: 'https://podcasty.pravda.sk/rss/' },
  { name: 'Tech.sme', url: 'https://podcasty.sme.sk/rss/tech' },
  { name: 'Para podcast', url: 'https://anchor.fm/s/3c1ee300/podcast/rss' },
]

function cleanTitle(raw: string): string {
  return raw.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim()
}

function formatDuration(raw: string): string {
  if (!raw) return ''
  if (raw.includes(':')) return raw
  const sec = parseInt(raw)
  if (isNaN(sec)) return raw
  const min = Math.floor(sec / 60)
  return min > 0 ? `${min} min` : `${sec}s`
}

async function fetchFeed(feed: { name: string; url: string }): Promise<Podcast[]> {
  try {
    const res = await fetch(feed.url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)', Accept: 'application/rss+xml, application/xml, text/xml, */*' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const xml = await res.text()
    const items = xml.split(/<item[ >]/).slice(1, 8)
    const podcasts: Podcast[] = []

    for (const item of items) {
      const titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)
      const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)
      const enclosureMatch = item.match(/<enclosure[^>]*url="([^"]*)"/)
      const dateMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)
      const durMatch = item.match(/<itunes:duration[^>]*>([\s\S]*?)<\/itunes:duration>/)

      const title = cleanTitle(titleMatch?.[1] ?? '')
      const link = cleanTitle(linkMatch?.[1] ?? '') || enclosureMatch?.[1]?.trim() || ''
      if (!title || title.length < 5) continue

      podcasts.push({
        title,
        show: feed.name,
        link,
        audioUrl: enclosureMatch?.[1]?.trim(),
        date: dateMatch?.[1]?.trim() ?? '',
        duration: formatDuration(durMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() ?? ''),
      })
    }
    return podcasts
  } catch { return [] }
}

export async function GET() {
  const results = await Promise.allSettled(PODCAST_FEEDS.map(f => fetchFeed(f)))

  let all: Podcast[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value)
  }

  // Deduplicate
  const seen = new Set<string>()
  all = all.filter(p => {
    const key = p.title.toLowerCase().slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Sort newest first
  all.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0
    const db = b.date ? new Date(b.date).getTime() : 0
    return db - da
  })

  // Return last 10
  return NextResponse.json({ podcasts: all.slice(0, 10), timestamp: Date.now() })
}
