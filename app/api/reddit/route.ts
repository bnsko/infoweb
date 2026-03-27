import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VALID_SORTS = ['hot', 'new', 'best', 'top']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawSort = searchParams.get('sort') ?? 'hot'
  const sort = VALID_SORTS.includes(rawSort) ? rawSort : 'hot'

  const urls = sort === 'best'
    ? [
        `https://old.reddit.com/r/Slovakia/top.json?limit=25&t=week&raw_json=1`,
        `https://www.reddit.com/r/Slovakia/top.json?limit=25&t=week&raw_json=1`,
      ]
    : [
        `https://old.reddit.com/r/Slovakia/${sort}.json?limit=25&raw_json=1`,
        `https://www.reddit.com/r/Slovakia/${sort}.json?limit=25&raw_json=1`,
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
          headers: {
            'User-Agent': ua,
            Accept: 'application/json',
          },
          signal: controller.signal,
        })
        clearTimeout(timer)

        if (!res.ok) {
          lastError = `HTTP ${res.status}`
          continue
        }

        const json = await res.json()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const posts = (json.data?.children ?? []).map((child: any) => {
          const d = child.data
          return {
            id: d.id,
            title: d.title,
            url: d.url,
            permalink: `https://reddit.com${d.permalink}`,
            score: d.score,
            numComments: d.num_comments,
            author: d.author,
            createdUtc: d.created_utc,
            flair: d.link_flair_text ?? null,
            isSelf: d.is_self,
            selftext: (d.selftext ?? '').slice(0, 250),
            thumbnail: null,
          }
        })

        if (posts.length === 0) {
          lastError = 'Empty response'
          continue
        }

        return NextResponse.json({ posts, sort })
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'fetch failed'
      }
    }
  }

  return NextResponse.json(
    { error: `Reddit fetch failed: ${lastError}`, posts: [], sort },
    { status: 200 } // Return 200 with empty posts so widget shows gracefully
  )
}
