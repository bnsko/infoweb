import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const SESSION_TTL = 120 // 2 minutes in seconds
const DAY_TTL = 86400 + 3600 // 25h to handle timezone edge

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + 'slovakia-info-2026').digest('hex').slice(0, 16)
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10) // "2026-03-29"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const sid = searchParams.get('sid') ?? ''

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? '127.0.0.1'
  const hashedIP = hashIP(ip)
  const today = todayKey()

  try {
    if (action === 'visit') {
      // Increment total page views
      await redis.incr('visitors:total_views')

      // Increment today page views
      const todayViewsKey = `visitors:daily:${today}`
      const pipeline = redis.pipeline()
      pipeline.incr(todayViewsKey)
      pipeline.expire(todayViewsKey, DAY_TTL)

      // Track unique visitor (lifetime)
      pipeline.sadd('visitors:unique_ips', hashedIP)

      // Track today unique
      const todayUniqueKey = `visitors:daily_unique:${today}`
      pipeline.sadd(todayUniqueKey, hashedIP)
      pipeline.expire(todayUniqueKey, DAY_TTL)

      // Track active session (TTL-based)
      if (sid) {
        pipeline.set(`visitors:session:${sid}`, '1', { ex: SESSION_TTL })
      }

      await pipeline.exec()
    } else if (action === 'ping' && sid) {
      // Refresh session TTL
      await redis.set(`visitors:session:${sid}`, '1', { ex: SESSION_TTL })
    }

    // Gather all stats
    const pipeline = redis.pipeline()
    pipeline.get('visitors:total_views')                    // 0
    pipeline.scard('visitors:unique_ips')                   // 1
    pipeline.get(`visitors:daily:${today}`)                 // 2
    pipeline.scard(`visitors:daily_unique:${today}`)        // 3

    const results = await pipeline.exec()

    const totalViews = Number(results[0]) || 0
    const totalUnique = Number(results[1]) || 0
    const todayViews = Number(results[2]) || 0
    const todayUnique = Number(results[3]) || 0

    // Count active sessions by scanning session keys
    let activeNow = 0
    let cursor = 0
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: 'visitors:session:*', count: 100 })
      cursor = Number(nextCursor)
      activeNow += keys.length
    } while (cursor !== 0)

    return NextResponse.json({
      lifetimeViews: totalViews,
      lifetimeUnique: totalUnique,
      activeNow,
      todayPageViews: todayViews,
      todayUnique,
    })
  } catch (err) {
    console.error('Redis visitors error:', err)
    return NextResponse.json({
      lifetimeViews: 0,
      lifetimeUnique: 0,
      activeNow: 0,
      todayPageViews: 0,
      todayUnique: 0,
      error: 'Redis connection failed',
    })
  }
}
