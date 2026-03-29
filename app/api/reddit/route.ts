import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VALID_SORTS = ['hot', 'new', 'best', 'top']

function parseRSSPosts(xml: string) {
  const posts: {
    id: string; title: string; url: string; permalink: string; score: number;
    numComments: number; author: string; createdUtc: number; flair: string | null;
    isSelf: boolean; selftext: string; thumbnail: string | null
  }[] = []

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
    // Decode all HTML entities in content for reliable parsing
    const decoded = content
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    // Reddit RSS: scores in "submitted by ... <span>N points</span>" or plain "N points"
    const scoreMatch = decoded.match(/(\d+)\s*point/) ?? content.match(/(\d+)\s*point/)
    // Comment count from "[N comments]", "N comment", or the link text
    const commentsMatch = decoded.match(/(\d+)\s*comment/) ?? content.match(/(\d+)\s*comment/)

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

  // Try JSON API first — multiple endpoints for reliability
  const UAs = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
  ]
  const ua = UAs[Math.floor(Math.random() * UAs.length)]
  const jsonUrls = sort === 'best'
    ? [
        `https://old.reddit.com/r/Slovakia/top.json?limit=25&t=week&raw_json=1`,
        `https://www.reddit.com/r/Slovakia/top.json?limit=25&t=week&raw_json=1`,
      ]
    : [
        `https://old.reddit.com/r/Slovakia/${sort}.json?limit=25&raw_json=1`,
        `https://www.reddit.com/r/Slovakia/${sort}.json?limit=25&raw_json=1`,
      ]

  for (const url of jsonUrls) {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'User-Agent': ua,
          Accept: 'application/json, text/html;q=0.9, */*;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9,sk;q=0.8',
        },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const text = await res.text()
      // Verify it's actually JSON (Reddit sometimes returns HTML login pages)
      if (!text.startsWith('{') && !text.startsWith('[')) continue
      const json = JSON.parse(text)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posts = (json.data?.children ?? []).map((child: any) => {
        const d = child.data
        return {
          id: d.id, title: d.title, url: d.url,
          permalink: `https://reddit.com${d.permalink}`,
          score: d.score ?? 0, numComments: d.num_comments ?? 0, author: d.author,
          createdUtc: d.created_utc, flair: d.link_flair_text ?? null,
          isSelf: d.is_self, selftext: (d.selftext ?? '').slice(0, 250), thumbnail: null,
        }
      })
      if (posts.length > 0) return NextResponse.json({ posts, sort, source: 'json' })
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
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue

      const xml = await res.text()
      const posts = parseRSSPosts(xml)
      if (posts.length > 0) {
        // Try to enrich RSS posts with scores via individual JSON lookups
        const enriched = await enrichWithScores(posts.slice(0, 15))
        return NextResponse.json({ posts: enriched, sort, source: 'rss' })
      }
    } catch { /* try next */ }
  }

  return NextResponse.json({ error: 'Reddit fetch failed', posts: [], sort, source: 'none' }, { status: 200 })
}

// Try to get scores for RSS posts by fetching the subreddit JSON
async function enrichWithScores(posts: { id: string; title: string; url: string; permalink: string; score: number; numComments: number; author: string; createdUtc: number; flair: string | null; isSelf: boolean; selftext: string; thumbnail: string | null }[]) {
  // Only enrich if most posts have 0 score
  const zeroScores = posts.filter(p => p.score === 0).length
  if (zeroScores < posts.length / 2) return posts

  const enrichUrls = [
    'https://old.reddit.com/r/Slovakia/hot.json?limit=50&raw_json=1',
    'https://api.reddit.com/r/Slovakia/hot?limit=50&raw_json=1',
    'https://www.reddit.com/r/Slovakia/hot.json?limit=50&raw_json=1',
  ]

  for (const enrichUrl of enrichUrls) {
    try {
      const res = await fetch(enrichUrl, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          Accept: 'application/json, text/html;q=0.9, */*;q=0.7',
        },
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) continue
      const text = await res.text()
      if (!text.startsWith('{')) continue
      const json = JSON.parse(text)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scoreMap = new Map<string, { score: number; numComments: number; flair: string | null }>()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const child of (json.data?.children ?? []) as any[]) {
        const d = child.data
        scoreMap.set(d.id, { score: d.score ?? 0, numComments: d.num_comments ?? 0, flair: d.link_flair_text ?? null })
      }
      if (scoreMap.size > 0) {
        return posts.map(p => {
          const enrichment = scoreMap.get(p.id)
          if (enrichment) {
            return { ...p, score: enrichment.score, numComments: enrichment.numComments, flair: enrichment.flair ?? p.flair }
          }
          return p
        })
      }
    } catch { /* try next */ }
  }
  return posts
}
