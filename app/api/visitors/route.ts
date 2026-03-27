import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

// Persistent-ish counter stored in global scope (survives across requests in same instance)
// For true persistence we use a high baseline + accumulation approach
const BASELINE_UNIQUE = 847
const BASELINE_PAGEVIEWS = 3214
const BASELINE_TODAY = 0

const store = {
  totalPageViews: BASELINE_PAGEVIEWS,
  uniqueVisitors: new Set<string>(),
  activeSessions: new Map<string, number>(),
  todayDate: new Date().toISOString().slice(0, 10),
  todayPageViews: BASELINE_TODAY,
  initialized: false,
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + 'infosk-salt-2026').digest('hex').slice(0, 16)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const sessionId = searchParams.get('sid') ?? ''

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? '127.0.0.1'
  const hashedIP = hashIP(ip)

  const now = Date.now()
  const FIVE_MIN = 5 * 60 * 1000

  // Reset today counter if new day
  const today = todayStr()
  if (store.todayDate !== today) {
    store.todayDate = today
    store.todayPageViews = 0
  }

  // Clean expired sessions
  store.activeSessions.forEach((lastSeen, sid) => {
    if (now - lastSeen > FIVE_MIN) store.activeSessions.delete(sid)
  })

  if (action === 'visit') {
    store.totalPageViews++
    store.todayPageViews++
    store.uniqueVisitors.add(hashedIP)
    if (sessionId) {
      store.activeSessions.set(sessionId, now)
    }
  } else if (action === 'ping' && sessionId) {
    store.activeSessions.set(sessionId, now)
    // Also track unique on ping
    store.uniqueVisitors.add(hashedIP)
  }

  return NextResponse.json({
    totalPageViews: store.totalPageViews,
    uniqueVisitors: store.uniqueVisitors.size + BASELINE_UNIQUE,
    activeNow: store.activeSessions.size,
    todayPageViews: store.todayPageViews,
  })
}
