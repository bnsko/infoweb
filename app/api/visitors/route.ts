import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const SESSION_TTL = 120 // 2 minutes

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const sid = searchParams.get('sid') ?? ''
  const today = todayKey()

  try {
    if (action === 'visit') {
      const p = redis.pipeline()
      p.incr('visitors:total_views')
      p.incr(`visitors:daily:${today}`)
      p.expire(`visitors:daily:${today}`, 90000) // 25h
      if (sid) p.set(`visitors:session:${sid}`, '1', { ex: SESSION_TTL })
      await p.exec()
    } else if (action === 'ping' && sid) {
      await redis.set(`visitors:session:${sid}`, '1', { ex: SESSION_TTL })
    }

    // Read stats
    const p = redis.pipeline()
    p.get('visitors:total_views')
    p.get(`visitors:daily:${today}`)
    const [totalRaw, todayRaw] = await p.exec()

    // Count active sessions
    let activeNow = 0
    let cursor = 0
    do {
      const [next, keys] = await redis.scan(cursor, { match: 'visitors:session:*', count: 100 })
      cursor = Number(next)
      activeNow += keys.length
    } while (cursor !== 0)

    return NextResponse.json({
      lifetimeViews: Number(totalRaw) || 0,
      activeNow,
      todayPageViews: Number(todayRaw) || 0,
    })
  } catch (err) {
    console.error('Redis visitors error:', err)
    return NextResponse.json({ lifetimeViews: 0, activeNow: 0, todayPageViews: 0 })
  }
}
