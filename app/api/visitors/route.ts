import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

const DATA_FILE = join(process.cwd(), '.visitor-data.json')

interface ActiveSession {
  id: string
  lastSeen: number
}

interface VisitorData {
  totalPageViews: number
  uniqueVisitors: string[]      // hashed IPs
  activeSessions: ActiveSession[]
}

function readData(): VisitorData {
  if (!existsSync(DATA_FILE)) {
    return { totalPageViews: 0, uniqueVisitors: [], activeSessions: [] }
  }
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return { totalPageViews: 0, uniqueVisitors: [], activeSessions: [] }
  }
}

function writeData(data: VisitorData) {
  writeFileSync(DATA_FILE, JSON.stringify(data), 'utf-8')
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + 'infosk-salt-2026').digest('hex').slice(0, 16)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const sessionId = searchParams.get('sid') ?? ''

  // Get client IP
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? '127.0.0.1'
  const hashedIP = hashIP(ip)

  const data = readData()
  const now = Date.now()
  const FIVE_MIN = 5 * 60 * 1000

  // Clean expired sessions
  data.activeSessions = data.activeSessions.filter(s => now - s.lastSeen < FIVE_MIN)

  if (action === 'visit') {
    // Increment page views
    data.totalPageViews++

    // Track unique visitor by hashed IP
    if (!data.uniqueVisitors.includes(hashedIP)) {
      data.uniqueVisitors.push(hashedIP)
    }

    // Add/update active session
    const existing = data.activeSessions.find(s => s.id === sessionId)
    if (existing) {
      existing.lastSeen = now
    } else if (sessionId) {
      data.activeSessions.push({ id: sessionId, lastSeen: now })
    }
  } else if (action === 'ping' && sessionId) {
    const existing = data.activeSessions.find(s => s.id === sessionId)
    if (existing) {
      existing.lastSeen = now
    } else {
      data.activeSessions.push({ id: sessionId, lastSeen: now })
    }
  }

  writeData(data)

  return NextResponse.json({
    totalPageViews: data.totalPageViews,
    uniqueVisitors: data.uniqueVisitors.length,
    activeNow: data.activeSessions.length,
  })
}
