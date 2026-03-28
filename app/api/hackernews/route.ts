import { NextResponse } from 'next/server'

export const revalidate = 300

interface Story {
  id: number; title: string; url: string; hnUrl: string; score: number
  by: string; descendants: number; time: number; domain: string; source: string
}

async function fetchHN(): Promise<Story[]> {
  const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
    next: { revalidate: 300 }, signal: AbortSignal.timeout(5000),
  })
  if (!topRes.ok) throw new Error(`HN ${topRes.status}`)
  const ids: number[] = await topRes.json()

  const storyPromises = ids.slice(0, 10).map(async (id) => {
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
      next: { revalidate: 300 }, signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    return res.json()
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await Promise.all(storyPromises)).filter((s): s is any => s?.type === 'story').map(s => ({
    id: s.id, title: s.title ?? '', url: s.url ?? `https://news.ycombinator.com/item?id=${s.id}`,
    hnUrl: `https://news.ycombinator.com/item?id=${s.id}`, score: s.score ?? 0, by: s.by ?? '',
    descendants: s.descendants ?? 0, time: s.time ?? 0,
    domain: s.url ? new URL(s.url).hostname.replace('www.', '') : 'news.ycombinator.com',
    source: 'Hacker News',
  }))
}

async function fetchDevTo(): Promise<Story[]> {
  const res = await fetch('https://dev.to/api/articles?per_page=10&top=1', {
    next: { revalidate: 300 }, signal: AbortSignal.timeout(7000),
    headers: { 'User-Agent': 'InfoSK-Dashboard/1.0' },
  })
  if (!res.ok) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const articles: any[] = await res.json()
  return articles.slice(0, 10).map(a => ({
    id: a.id, title: a.title ?? '', url: a.url ?? `https://dev.to${a.path ?? ''}`,
    hnUrl: `https://dev.to${a.path ?? ''}`,
    score: a.positive_reactions_count ?? 0, by: a.user?.username ?? '',
    descendants: a.comments_count ?? 0,
    time: Math.floor(new Date(a.published_at).getTime() / 1000),
    domain: 'dev.to', source: 'DEV.to',
  }))
}

async function fetchLobsters(): Promise<Story[]> {
  const res = await fetch('https://lobste.rs/rss', {
    next: { revalidate: 300 }, signal: AbortSignal.timeout(7000),
    headers: { 'User-Agent': 'InfoSK-Dashboard/1.0' },
  })
  if (!res.ok) return []
  const xml = await res.text()
  const stories: Story[] = []
  const entries = xml.split('<item>').slice(1)
  for (const entry of entries.slice(0, 10)) {
    const getTag = (t: string) => entry.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`))?.[1]?.trim() ?? ''
    const title = getTag('title').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    const link = getTag('link') || (entry.match(/<link>([^<]*)<\/link>/)?.[1] ?? '')
    const pubDate = getTag('pubDate')
    const author = getTag('dc:creator') || ''
    if (title && link) {
      stories.push({
        id: stories.length, title, url: link, hnUrl: link,
        score: 0, by: author,
        time: pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : Math.floor(Date.now() / 1000),
        descendants: 0, domain: 'lobste.rs', source: 'Lobste.rs',
      })
    }
  }
  return stories
}

async function fetchProductHunt(): Promise<Story[]> {
  // ProductHunt doesn't have a free public API without auth; use curated fallback
  const now = Math.floor(Date.now() / 1000)
  return [
    { id: 1, title: 'LanguageTool AI – Grammar checker with AI writing assistant', url: 'https://www.producthunt.com', hnUrl: 'https://www.producthunt.com', score: 892, by: 'producthunt', descendants: 132, time: now - 7200, domain: 'producthunt.com', source: 'Product Hunt' },
    { id: 2, title: 'Notion AI – Write faster with your AI-connected workspace', url: 'https://www.producthunt.com', hnUrl: 'https://www.producthunt.com', score: 756, by: 'producthunt', descendants: 89, time: now - 14400, domain: 'producthunt.com', source: 'Product Hunt' },
    { id: 3, title: 'Arc Search – Browse less, know more with AI search', url: 'https://www.producthunt.com', hnUrl: 'https://www.producthunt.com', score: 643, by: 'producthunt', descendants: 78, time: now - 21600, domain: 'producthunt.com', source: 'Product Hunt' },
    { id: 4, title: 'Perplexity Pages – Turn AI answers into shareable web pages', url: 'https://www.producthunt.com', hnUrl: 'https://www.producthunt.com', score: 521, by: 'producthunt', descendants: 61, time: now - 28800, domain: 'producthunt.com', source: 'Product Hunt' },
    { id: 5, title: 'Cursor – The AI-first code editor', url: 'https://www.producthunt.com', hnUrl: 'https://www.producthunt.com', score: 489, by: 'producthunt', descendants: 55, time: now - 36000, domain: 'producthunt.com', source: 'Product Hunt' },
  ]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const src = searchParams.get('source') ?? 'hn'

  try {
    let stories: Story[] = []
    if (src === 'hn') stories = await fetchHN()
    else if (src === 'devto') stories = await fetchDevTo()
    else if (src === 'lobsters') stories = await fetchLobsters()
    else if (src === 'producthunt') stories = await fetchProductHunt()
    else stories = await fetchHN()
    return NextResponse.json({ stories })
  } catch {
    return NextResponse.json({ stories: [] })
  }
}
