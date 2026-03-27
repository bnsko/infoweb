import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const VALID_SORTS = ['hot', 'new', 'best', 'top']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawSort = searchParams.get('sort') ?? 'hot'
  const sort = VALID_SORTS.includes(rawSort) ? rawSort : 'hot'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const url = sort === 'best'
      ? `https://old.reddit.com/r/Slovakia/top.json?limit=25&t=week&raw_json=1`
      : `https://old.reddit.com/r/Slovakia/${sort}.json?limit=25&raw_json=1`
    
    let res: Response | null = null
    for (const ua of [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
      'Mozilla/5.0 (compatible; InfoSK/1.0)',
    ]) {
      try {
        res = await fetch(url, {
          cache: 'no-store',
          headers: { 'User-Agent': ua, Accept: 'application/json' },
          signal: controller.signal,
        })
        if (res.ok) break
      } catch { /* try next */ }
    }
    clearTimeout(timer)
    if (!res || !res.ok) throw new Error(`Reddit API ${res?.status ?? 'unreachable'}`)
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
        thumbnail:
          d.thumbnail &&
          !['self', 'default', 'nsfw', '', 'image'].includes(d.thumbnail) &&
          d.thumbnail.startsWith('http')
            ? d.thumbnail
            : null,
      }
    })

    return NextResponse.json({ posts, sort })
  } catch (err) {
    clearTimeout(timer)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Reddit fetch failed' },
      { status: 500 }
    )
  }
}
