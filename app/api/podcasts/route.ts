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
  { name: 'SME Podcasty', url: 'https://podcasty.sme.sk/rss/vse' },
  { name: 'SME - Dobré ráno', url: 'https://podcasty.sme.sk/rss/dobre-rano' },
  { name: 'SME - Svet', url: 'https://podcasty.sme.sk/rss/svet' },
  { name: 'Denník N', url: 'https://dennikn.sk/podcast/feed/' },
  { name: 'Startitup Podcast', url: 'https://feeds.acast.com/public/shows/startitup-podcast' },
  { name: 'Index (SME)', url: 'https://podcasty.sme.sk/rss/index' },
  { name: 'Forbes SK', url: 'https://anchor.fm/s/e4f80b38/podcast/rss' },
  { name: 'Pravda', url: 'https://podcasty.pravda.sk/rss/' },
  { name: 'RTVS', url: 'https://www.rtvs.sk/export/podcast.xml' },
  { name: 'Aktuality.sk', url: 'https://www.aktuality.sk/rss/podcasty/' },
  { name: 'Podcast.sk', url: 'https://podcast.sk/feed/' },
]

async function fetchPodcastFeed(feed: { name: string; url: string }): Promise<Podcast[]> {
  try {
    const res = await fetch(feed.url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items = xml.split(/<item[ >]/).slice(1, 15)
    const podcasts: Podcast[] = []

    for (const item of items) {
      const titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)
      const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)
      const cdataLinkMatch = item.match(/<link[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/link>/)
      const enclosureMatch = item.match(/<enclosure[^>]*url="([^"]*)"/)
      const dateMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)
      const durMatch = item.match(/<itunes:duration[^>]*>([\s\S]*?)<\/itunes:duration>/)

      const title = titleMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() ?? ''
      const rawLink = cdataLinkMatch?.[1]?.trim() || linkMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() || enclosureMatch?.[1]?.trim() || ''
      if (title) {
        podcasts.push({
          title,
          show: feed.name,
          link: rawLink,
          audioUrl: enclosureMatch?.[1]?.trim(),
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

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86400000
  const weekStart = todayStart - 7 * 86400000

  const today = allPodcasts.filter(p => {
    const t = p.date ? new Date(p.date).getTime() : 0
    return t >= todayStart
  })

  const yesterday = allPodcasts.filter(p => {
    const t = p.date ? new Date(p.date).getTime() : 0
    return t >= yesterdayStart && t < todayStart
  })

  const week = allPodcasts.filter(p => {
    const t = p.date ? new Date(p.date).getTime() : 0
    return t >= weekStart && t < yesterdayStart
  })

  // Fallback: if no podcasts fetched, provide curated links
  if (allPodcasts.length === 0) {
    allPodcasts = [
      { title: 'Dobré ráno – denný podcast', show: 'SME - Dobré ráno', link: 'https://podcasty.sme.sk/c/dobre-rano', date: new Date().toISOString(), audioUrl: undefined, duration: '~20 min' },
      { title: 'Denník N Podcast', show: 'Denník N', link: 'https://dennikn.sk/podcast/', date: new Date().toISOString(), audioUrl: undefined, duration: '~30 min' },
      { title: 'Startitup Podcast – rozhovory', show: 'Startitup Podcast', link: 'https://www.startitup.sk/podcast/', date: new Date().toISOString(), audioUrl: undefined, duration: '~60 min' },
      { title: 'Forbes Slovensko Podcast', show: 'Forbes SK', link: 'https://www.forbes.sk/podcast/', date: new Date().toISOString(), audioUrl: undefined, duration: '~45 min' },
      { title: 'Aktuality.sk Audio', show: 'Aktuality.sk', link: 'https://www.aktuality.sk/podcast/', date: new Date().toISOString(), audioUrl: undefined, duration: '~15 min' },
      { title: 'Index – Ekonomický podcast SME', show: 'Index (SME)', link: 'https://podcasty.sme.sk/c/index', date: new Date().toISOString(), audioUrl: undefined, duration: '~25 min' },
      { title: 'Pravda Podcast', show: 'Pravda', link: 'https://podcasty.pravda.sk', date: new Date().toISOString(), audioUrl: undefined, duration: '~20 min' },
      { title: 'RTVS Správy', show: 'RTVS', link: 'https://www.rtvs.sk/radio/archiv', date: new Date().toISOString(), audioUrl: undefined, duration: '~10 min' },
    ]
  }

  return NextResponse.json({
    today: today.slice(0, 10),
    yesterday: yesterday.slice(0, 10),
    week: week.slice(0, 15),
    all: allPodcasts.slice(0, 15),
    timestamp: Date.now(),
  })
}
