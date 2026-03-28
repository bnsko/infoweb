import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Podcast {
  title: string
  show: string
  link: string
  date: string
  duration?: string
}

const PODCAST_FEEDS = [
  { name: 'SME Podcasty', url: 'https://podcasty.sme.sk/rss' },
  { name: 'Denník N', url: 'https://dennikn.sk/podcast/feed/' },
  { name: 'Dobré ráno', url: 'https://anchor.fm/s/2c01c648/podcast/rss' },
  { name: 'RTVS', url: 'https://www.rtvs.sk/export/podcast.xml' },
]

async function fetchPodcastFeed(feed: { name: string; url: string }): Promise<Podcast[]> {
  try {
    const res = await fetch(feed.url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items = xml.split(/<item[ >]/).slice(1, 6)
    const podcasts: Podcast[] = []

    for (const item of items) {
      const titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)
      const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/) ?? item.match(/<enclosure[^>]*url="([^"]*)"/)
      const dateMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)
      const durMatch = item.match(/<itunes:duration[^>]*>([\s\S]*?)<\/itunes:duration>/)

      const title = titleMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() ?? ''
      if (title) {
        podcasts.push({
          title,
          show: feed.name,
          link: linkMatch?.[1]?.trim() ?? '',
          date: dateMatch?.[1]?.trim() ?? '',
          duration: durMatch?.[1]?.trim(),
        })
      }
    }
    return podcasts
  } catch {
    return []
  }
}

export async function GET() {
  const results = await Promise.allSettled(PODCAST_FEEDS.map(f => fetchPodcastFeed(f)))

  let allPodcasts: Podcast[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') allPodcasts.push(...r.value)
  }

  // Sort by date descending
  allPodcasts.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0
    const db = b.date ? new Date(b.date).getTime() : 0
    return db - da
  })

  return NextResponse.json({ podcasts: allPodcasts.slice(0, 15), timestamp: Date.now() })
}
