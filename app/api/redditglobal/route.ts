import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    // Fetch top posts from r/all (most upvoted today)
    const res = await fetch(
      'https://www.reddit.com/r/all/top.json?limit=10&t=day&raw_json=1',
      {
        cache: 'no-store',
        headers: {
          'User-Agent': 'InfoSK-Dashboard/1.0 (by /u/infoskoverview)',
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timer)
    if (!res.ok) throw new Error(`Reddit API ${res.status}`)
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
        thumbnail:
          d.thumbnail && !['self', 'default', 'nsfw', '', 'image'].includes(d.thumbnail) && d.thumbnail.startsWith('http')
            ? d.thumbnail
            : null,
      }
    })

    return NextResponse.json({ posts })
  } catch (err) {
    clearTimeout(timer)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Reddit global fetch failed' },
      { status: 500 }
    )
  }
}
