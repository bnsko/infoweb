import { NextResponse } from 'next/server'

export const revalidate = 300

export async function GET() {
  try {
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    })
    if (!topRes.ok) throw new Error(`HN ${topRes.status}`)
    const ids: number[] = await topRes.json()

    const storyPromises = ids.slice(0, 10).map(async (id) => {
      const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) return null
      return res.json()
    })

    const stories = (await Promise.all(storyPromises))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((s): s is any => s !== null && s.type === 'story')
      .map((s) => ({
        id: s.id,
        title: s.title ?? '',
        url: s.url ?? `https://news.ycombinator.com/item?id=${s.id}`,
        hnUrl: `https://news.ycombinator.com/item?id=${s.id}`,
        score: s.score ?? 0,
        by: s.by ?? '',
        descendants: s.descendants ?? 0,
        time: s.time ?? 0,
        domain: s.url ? new URL(s.url).hostname.replace('www.', '') : 'news.ycombinator.com',
      }))

    return NextResponse.json({ stories })
  } catch {
    return NextResponse.json({ stories: [] })
  }
}
