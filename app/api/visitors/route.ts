import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

// ── Persistent-ish store ────────────────────────────────────────────────
// On Vercel serverless, globals persist across warm invocations in the same instance.
// We accumulate during the instance lifetime.
const DEPLOY_TIME = parseInt(process.env.NEXT_PUBLIC_BUILD_TIME ?? String(Date.now()), 10)

const store = {
  pageViews: 0,
  uniqueIPs: new Set<string>(),
  sessions: new Map<string, number>(),
  todayDate: '',
  todayPageViews: 0,
}

const SESSION_TIMEOUT = 2 * 60 * 1000

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + 'slovakia-info-2026').digest('hex').slice(0, 16)
}

function cleanExpiredSessions() {
  const now = Date.now()
  const entries = Array.from(store.sessions.entries())
  for (let i = 0; i < entries.length; i++) {
    const [sid, lastSeen] = entries[i]
    if (now - lastSeen > SESSION_TIMEOUT) {
      store.sessions.delete(sid)
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const sid = searchParams.get('sid') ?? ''

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? '127.0.0.1'
  const hashedIP = hashIP(ip)

  const today = new Date().toISOString().slice(0, 10)
  if (store.todayDate !== today) {
    store.todayDate = today
    store.todayPageViews = 0
  }

  cleanExpiredSessions()

  if (action === 'visit') {
    store.pageViews++
    store.todayPageViews++
    store.uniqueIPs.add(hashedIP)
    if (sid) store.sessions.set(sid, Date.now())
  } else if (action === 'ping' && sid) {
    store.sessions.set(sid, Date.now())
    store.uniqueIPs.add(hashedIP)
  }

  return NextResponse.json({
    totalPageViews: store.pageViews,
    uniqueVisitors: store.uniqueIPs.size,
    activeNow: store.sessions.size,
    todayPageViews: store.todayPageViews,
    deployTime: DEPLOY_TIME,
    uptimeMs: Date.now() - DEPLOY_TIME,
  })
}
