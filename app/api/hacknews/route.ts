import { NextResponse } from 'next/server'
import type { HNItem } from '@/lib/types'

export const revalidate = 300

const TOP_N = 12

export async function GET() {
  try {
    const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      next: { revalidate: 300 },
    })
    if (!idsRes.ok) throw new Error('HN top stories failed')
    const ids: number[] = await idsRes.json()

    const items = await Promise.all(
      ids.slice(0, TOP_N).map(async (id): Promise<HNItem | null> => {
        try {
          const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            next: { revalidate: 300 },
          })
          return res.ok ? res.json() : null
        } catch {
          return null
        }
      })
    )

    return NextResponse.json({ items: items.filter(Boolean) })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'HN fetch failed' },
      { status: 500 }
    )
  }
}
