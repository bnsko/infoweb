import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Podcast {
  title: string
  show: string
  link: string
  audioUrl?: string
  date: string
  duration?: string
  description?: string
}

// Only include feeds that serve actual podcast RSS with <enclosure> audio
const PODCAST_FEEDS = [
  { name: 'Dobré ráno', url: 'https://podcasty.sme.sk/rss/dobre-rano', category: 'news' },
  { name: 'Index', url: 'https://podcasty.sme.sk/rss/index', category: 'economy' },
  { name: 'SME Svet', url: 'https://podcasty.sme.sk/rss/svet', category: 'world' },
  { name: 'Denník N', url: 'https://dennikn.sk/podcast/feed/', category: 'news' },
  { name: 'Startitup', url: 'https://feeds.acast.com/public/shows/startitup-podcast', category: 'interview' },
  { name: 'Forbes SK', url: 'https://anchor.fm/s/e4f80b38/podcast/rss', category: 'business' },
  { name: 'Aktuality.sk', url: 'https://www.aktuality.sk/rss/podcasty/', category: 'news' },
  { name: 'RTVS', url: 'https://www.rtvs.sk/export/podcast.xml', category: 'public' },
  { name: 'Pravda', url: 'https://podcasty.pravda.sk/rss/', category: 'news' },
]

function cleanTitle(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function formatDuration(raw: string): string {
  if (!raw) return ''
  // Could be "HH:MM:SS", "MM:SS", or seconds
  if (raw.includes(':')) return raw
  const sec = parseInt(raw)
  if (isNaN(sec)) return raw
  const min = Math.floor(sec / 60)
  return min > 0 ? `${min} min` : `${sec}s`
}

async function fetchPodcastFeed(feed: { name: string; url: string; category: string }): Promise<Podcast[]> {
  try {
    const res = await fetch(feed.url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items = xml.split(/<item[ >]/).slice(1, 12)
    const podcasts: Podcast[] = []

    for (const item of items) {
      const titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)
      const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)
      const cdataLinkMatch = item.match(/<link[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/link>/)
      const enclosureMatch = item.match(/<enclosure[^>]*url="([^"]*)"/)
      const dateMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)
      const durMatch = item.match(/<itunes:duration[^>]*>([\s\S]*?)<\/itunes:duration>/)
      const descMatch = item.match(/<description[^>]*>([\s\S]*?)<\/description>/)

      const title = cleanTitle(titleMatch?.[1] ?? '')
      const rawLink = cdataLinkMatch?.[1]?.trim() || cleanTitle(linkMatch?.[1] ?? '') || enclosureMatch?.[1]?.trim() || ''

      // Only accept items that have either an audio enclosure OR come from known podcast-only feeds
      const hasAudio = !!enclosureMatch?.[1]
      if (!title || title.length < 5) continue

      // Skip non-podcast content (plain text articles without audio from non-podcast feeds)
      if (!hasAudio && feed.category === 'news' && !item.includes('itunes:')) continue

      const desc = cleanTitle(descMatch?.[1] ?? '').slice(0, 120)

      podcasts.push({
        title,
        show: feed.name,
        link: rawLink,
        audioUrl: enclosureMatch?.[1]?.trim(),
        date: dateMatch?.[1]?.trim() ?? '',
        duration: formatDuration(durMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() ?? ''),
        description: desc || undefined,
      })
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

  // Deduplicate by title
  const seen = new Set<string>()
  allPodcasts = allPodcasts.filter(p => {
    const key = p.title.toLowerCase().slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

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

  if (allPodcasts.length === 0) {
    allPodcasts = [
      { title: 'Dobré ráno – denný podcast', show: 'Dobré ráno', link: 'https://podcasty.sme.sk/c/dobre-rano', date: new Date().toISOString(), duration: '~20 min' },
      { title: 'Denník N Podcast', show: 'Denník N', link: 'https://dennikn.sk/podcast/', date: new Date().toISOString(), duration: '~30 min' },
      { title: 'Startitup – rozhovory', show: 'Startitup', link: 'https://www.startitup.sk/podcast/', date: new Date().toISOString(), duration: '~60 min' },
      { title: 'Forbes Slovensko Podcast', show: 'Forbes SK', link: 'https://www.forbes.sk/podcast/', date: new Date().toISOString(), duration: '~45 min' },
      { title: 'Index – Ekonomický podcast', show: 'Index', link: 'https://podcasty.sme.sk/c/index', date: new Date().toISOString(), duration: '~25 min' },
    ]
  }

  return NextResponse.json({
    today: today.slice(0, 12),
    yesterday: yesterday.slice(0, 12),
    week: week.slice(0, 20),
    all: allPodcasts.slice(0, 20),
    timestamp: Date.now(),
  })
}
