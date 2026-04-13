import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const SESSION_TTL = 120 // 2 minutes
const VISITOR_LOG_MAX = 300

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function weekKey(): string {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7)
}

function maskIP(ip: string): string {
  if (ip === 'unknown' || !ip) return 'unknown'
  // IPv4: keep first 3 octets, mask last
  const v4 = ip.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/)
  if (v4) return `${v4[1]}.xxx`
  // IPv6: keep first 3 groups
  const v6parts = ip.split(':')
  if (v6parts.length >= 4) return `${v6parts.slice(0, 3).join(':')}:xxxx`
  return ip.slice(0, 8) + '...'
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() ?? real ?? 'unknown'
}

function parseUA(ua: string): string {
  if (!ua) return 'Unknown'
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('curl') || ua.includes('python') || ua.includes('bot') || ua.includes('Bot')) return 'Bot/Script'
  return 'Other'
}

function getCountry(request: Request): string {
  // Netlify, Cloudflare, Vercel all inject country headers
  return (
    request.headers.get('x-nf-country-code') ??
    request.headers.get('cf-ipcountry') ??
    request.headers.get('x-vercel-ip-country') ??
    ''
  ).toUpperCase().slice(0, 2)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const sid = searchParams.get('sid') ?? ''
  const path = searchParams.get('path') ?? '/'
  const today = todayKey()
  const week = weekKey()
  const month = monthKey()

  try {
    if (action === 'visit') {
      const ip = getClientIP(request)
      const ua = request.headers.get('user-agent') ?? ''
      const maskedIP = maskIP(ip)
      const browser = parseUA(ua)

      const country = getCountry(request)
      const logEntry = JSON.stringify({
        ts: Date.now(),
        ip: maskedIP,
        browser,
        path,
        country,
      })

      const p = redis.pipeline()
      p.incr('visitors:total_views')
      p.incr(`visitors:daily:${today}`)
      p.expire(`visitors:daily:${today}`, 90000) // 25h
      p.incr(`visitors:weekly:${week}`)
      p.expire(`visitors:weekly:${week}`, 7 * 86400 + 3600)
      p.incr(`visitors:monthly:${month}`)
      p.expire(`visitors:monthly:${month}`, 32 * 86400)
      if (sid) p.set(`visitors:session:${sid}`, '1', { ex: SESSION_TTL })
      p.rpush('visitors:log', logEntry)
      p.ltrim('visitors:log', -VISITOR_LOG_MAX, -1)
      await p.exec()
    } else if (action === 'ping' && sid) {
      await redis.set(`visitors:session:${sid}`, '1', { ex: SESSION_TTL })
    } else if (action === 'history') {
      // Return last 14 days of daily views
      const days: string[] = []
      for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        days.push(d.toISOString().slice(0, 10))
      }
      const p = redis.pipeline()
      days.forEach(d => p.get(`visitors:daily:${d}`))
      const vals = await p.exec()
      return NextResponse.json({
        history: days.map((d, i) => ({ date: d, views: Number(vals[i]) || 0 })),
      })
    }

    // Read stats
    const p = redis.pipeline()
    p.get('visitors:total_views')
    p.get(`visitors:daily:${today}`)
    p.get(`visitors:weekly:${week}`)
    p.get(`visitors:monthly:${month}`)
    const [totalRaw, todayRaw, weekRaw, monthRaw] = await p.exec()

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
      weekPageViews: Number(weekRaw) || 0,
      monthPageViews: Number(monthRaw) || 0,
    })
  } catch (err) {
    console.error('Redis visitors error:', err)
    return NextResponse.json({ lifetimeViews: 0, activeNow: 0, todayPageViews: 0, weekPageViews: 0, monthPageViews: 0 })
  }
}

export async function POST(request: Request) {
  // Admin-only: reset/adjust visitor stats (requires auth token in header)
  const authHeader = request.headers.get('x-admin-action')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { op, value } = body

    if (op === 'resetAll') {
      const today = todayKey()
      const week = weekKey()
      const month = monthKey()
      await redis.del('visitors:total_views', `visitors:daily:${today}`, `visitors:weekly:${week}`, `visitors:monthly:${month}`)
      return NextResponse.json({ ok: true, message: 'All counters reset' })
    }

    if (op === 'resetToday') {
      const today = todayKey()
      await redis.del(`visitors:daily:${today}`)
      return NextResponse.json({ ok: true, message: 'Today reset' })
    }

    if (op === 'setTotal' && typeof value === 'number') {
      await redis.set('visitors:total_views', String(value))
      return NextResponse.json({ ok: true, message: `Total set to ${value}` })
    }

    if (op === 'addViews' && typeof value === 'number') {
      const today = todayKey(); const week = weekKey(); const month = monthKey()
      const p = redis.pipeline()
      p.incrby('visitors:total_views', value)
      p.incrby(`visitors:daily:${today}`, value)
      p.incrby(`visitors:weekly:${week}`, value)
      p.incrby(`visitors:monthly:${month}`, value)
      await p.exec()
      return NextResponse.json({ ok: true, message: `Added ${value} views` })
    }

    return NextResponse.json({ error: 'Unknown op' }, { status: 400 })
  } catch (err) {
    console.error('Visitors POST error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
