import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VALID_SORTS = ['hot', 'new', 'best', 'top']

function parseRSSPosts(xml: string) {
  const posts: {
    id: string; title: string; url: string; permalink: string; score: number;
    numComments: number; author: string; createdUtc: number; flair: string | null;
    isSelf: boolean; selftext: string; thumbnail: string | null
  }[] = []

  // Parse <entry> elements from Atom feed
  const entries = xml.split('<entry>').slice(1)
  for (const entry of entries.slice(0, 25)) {
    const getTag = (tag: string) => {
      const match = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
      return match?.[1]?.trim() ?? ''
    }
    const getLinkHref = () => {
      const match = entry.match(/<link\s+href="([^"]*)"/)
      return match?.[1] ?? ''
    }
    const title = getTag('title').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    const permalink = getLinkHref()
    const author = entry.match(/<name>\/u\/([^<]*)<\/name>/)?.[1] ?? ''
    const updated = getTag('updated')
    const id = entry.match(/\/comments\/([a-z0-9]+)\//)?.[1] ?? Math.random().toString(36).slice(2, 8)
    const content = getTag('content')
    // Try to extract score from content (reddit RSS includes it in HTML content)
    const scoreMatch = content.match(/(\d+)\s*point/)
    const commentsMatch = content.match(/(\d+)\s*comment/)

    if (title) {
      posts.push({
        id,
        title,
        url: permalink,
        permalink,
        score: scoreMatch ? parseInt(scoreMatch[1]) : 0,
        numComments: commentsMatch ? parseInt(commentsMatch[1]) : 0,
        author,
        createdUtc: updated ? Math.floor(new Date(updated).getTime() / 1000) : Math.floor(Date.now() / 1000),
        flair: null,
        isSelf: permalink.includes('/comments/'),
        selftext: '',
        thumbnail: null,
      })
    }
  }
  return posts
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawSort = searchParams.get('sort') ?? 'hot'
  const sort = VALID_SORTS.includes(rawSort) ? rawSort : 'hot'
  const rssSort = sort === 'best' ? 'top' : sort

  // Try JSON API first (has proper scores and comment counts)
  const jsonUrls = sort === 'best'
    ? [`https://www.reddit.com/r/Slovakia/top.json?limit=25&t=week&raw_json=1`]
    : [`https://www.reddit.com/r/Slovakia/${sort}.json?limit=25&raw_json=1`]

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
      const posts = (json.data?.children ?? []).map((child: any) => {
        const d = child.data
        return {
          id: d.id, title: d.title, url: d.url,
          permalink: `https://reddit.com${d.permalink}`,
          score: d.score, numComments: d.num_comments, author: d.author,
          createdUtc: d.created_utc, flair: d.link_flair_text ?? null,
          isSelf: d.is_self, selftext: (d.selftext ?? '').slice(0, 250), thumbnail: null,
        }
      })
      if (posts.length > 0) return NextResponse.json({ posts, sort })
    } catch { /* try next */ }
  }

  // Fallback: try RSS feed
  const rssUrls = [
    `https://www.reddit.com/r/Slovakia/${rssSort}.rss?limit=25`,
    `https://old.reddit.com/r/Slovakia/${rssSort}.rss?limit=25`,
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
      const posts = parseRSSPosts(xml)
      if (posts.length > 0) {
        return NextResponse.json({ posts, sort })
      }
    } catch { /* try next */ }
  }

  return NextResponse.json({ error: 'Reddit fetch failed', posts: [], sort }, { status: 200 })
}
