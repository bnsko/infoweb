import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function parseRSSEntries(xml: string) {
  const posts: {
    id: string; title: string; subreddit: string; permalink: string;
    score: number; numComments: number; author: string; createdUtc: number; thumbnail: string | null
  }[] = []

  const entries = xml.split('<entry>').slice(1)
  for (const entry of entries.slice(0, 10)) {
    const getTag = (tag: string) => {
      const match = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
      return match?.[1]?.trim() ?? ''
    }
    const getLinkHref = () => {
      const match = entry.match(/<link\s+href="([^"]*)"/)
      return match?.[1] ?? ''
    }
    const categoryTerm = entry.match(/<category\s+term="([^"]*)"/)
    const title = getTag('title').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    const permalink = getLinkHref()
    const author = entry.match(/<name>\/u\/([^<]*)<\/name>/)?.[1] ?? ''
    const updated = getTag('updated')
    const id = entry.match(/\/comments\/([a-z0-9]+)\//)?.[1] ?? Math.random().toString(36).slice(2, 8)
    const content = getTag('content')
    const scoreMatch = content.match(/(\d+)\s*point/)
    const commentsMatch = content.match(/(\d+)\s*comment/)

    if (title) {
      posts.push({
        id,
        title,
        subreddit: categoryTerm?.[1] ? `r/${categoryTerm[1]}` : 'r/all',
        permalink,
        score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
        numComments: commentsMatch ? parseInt(commentsMatch[1]) : 0,
        author,
        createdUtc: updated ? Math.floor(new Date(updated).getTime() / 1000) : Math.floor(Date.now() / 1000),
        thumbnail: null,
      })
    }
  }
  return posts
}

export async function GET() {
  // Try RSS first
  const rssUrls = [
    'https://www.reddit.com/r/all/top.rss?t=day&limit=10',
    'https://old.reddit.com/r/all/top.rss?t=day&limit=10',
  ]

  for (const url of rssUrls) {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) continue
      const xml = await res.text()
      const posts = parseRSSEntries(xml)
      if (posts.length > 0) return NextResponse.json({ posts })
    } catch { /* try next */ }
  }

  // Fallback: JSON
  const jsonUrls = [
    'https://www.reddit.com/r/all/top.json?limit=10&t=day&raw_json=1',
  ]

  for (const url of jsonUrls) {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) continue
      const json = await res.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posts = (json.data?.children ?? []).slice(0, 10).map((child: any) => {
        const d = child.data
        return {
          id: d.id, title: d.title, subreddit: d.subreddit_name_prefixed,
          permalink: `https://reddit.com${d.permalink}`, score: d.score,
          numComments: d.num_comments, author: d.author, createdUtc: d.created_utc, thumbnail: null,
        }
      })
      if (posts.length > 0) return NextResponse.json({ posts })
    } catch { /* try next */ }
  }

  return NextResponse.json({ error: 'Reddit fetch failed', posts: [] }, { status: 200 })
}
