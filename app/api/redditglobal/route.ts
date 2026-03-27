import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const urls = [
    'https://old.reddit.com/r/all/top.json?limit=10&t=day&raw_json=1',
    'https://www.reddit.com/r/all/top.json?limit=10&t=day&raw_json=1',
  ]

  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  ]

  let lastError = ''

  for (const url of urls) {
    for (const ua of userAgents) {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 10000)

        const res = await fetch(url, {
          cache: 'no-store',
          headers: { 'User-Agent': ua, Accept: 'application/json' },
          signal: controller.signal,
        })
        clearTimeout(timer)

        if (!res.ok) { lastError = `HTTP ${res.status}`; continue }

        const json = await res.json()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const posts = (json.data?.children ?? []).slice(0, 10).map((child: any) => {
          const d = child.data
          return {
            id: d.id,
            title: d.title,
            subreddit: d.subreddit_name_prefixed,
            permalink: `https://reddit.com${d.permalink}`,
            score: d.score,
            numComments: d.num_comments,
            author: d.author,
            createdUtc: d.created_utc,
            thumbnail: null,
          }
        })

        if (posts.length === 0) { lastError = 'Empty'; continue }
        return NextResponse.json({ posts })
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'fetch failed'
      }
    }
  }

  return NextResponse.json({ error: lastError, posts: [] }, { status: 200 })
}
