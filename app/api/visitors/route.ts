import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

// In-memory storage (persists across requests in same serverless instance)
interface ActiveSession { id: string; lastSeen: number }

const store = {
  totalPageViews: 0,
  uniqueVisitors: new Set<string>(),
  activeSessions: new Map<string, number>(),
  todayDate: new Date().toISOString().slice(0, 10),
  todayPageViews: 0,
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
  Array.from(store.activeSessions.entries()).forEach(([sid, lastSeen]) => {
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
  }

  return NextResponse.json({
    totalPageViews: store.totalPageViews,
    uniqueVisitors: store.uniqueVisitors.size,
    activeNow: store.activeSessions.size,
    todayPageViews: store.todayPageViews,
  })
}
