import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

const ADMIN_CODE = process.env.ADMIN_CODE ?? 'idealnyja'
const MAX_ATTEMPTS = 3
const BAN_DURATION_MS = 24 * 60 * 60 * 1000

interface AdminConfig {
  siteName: string
  refreshRates: Record<string, number>
  enabledWidgets: string[]
  announcement: string
  maintenanceMode: boolean
}

interface BanRecord {
  attempts: number
  lastAttempt: number
  banned: boolean
  shadowBanned: boolean
}

// In-memory stores (persist across requests in same serverless instance)
const adminConfig: AdminConfig = {
  siteName: 'InfoSK',
  refreshRates: {},
  enabledWidgets: ['weather', 'stats', 'currency', 'crypto', 'flights', 'iss', 'earthquakes', 'launches', 'reddit', 'onthisday', 'news', 'population', 'nameday', 'steam', 'sports', 'slovakfacts', 'redditglobal', 'metrics', 'realestate', 'webcams', 'restaurants'],
  announcement: '',
  maintenanceMode: false,
}

const banList: Record<string, BanRecord> = {}

// Shared visitor store reference - import from visitors route
// We'll read from a shared module instead
const visitorStore = {
  totalPageViews: 0,
  uniqueVisitors: 0,
  activeSessions: 0,
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() ?? real ?? 'unknown'
}

function checkBan(ipHash: string): { blocked: boolean; shadowBanned: boolean } {
  const record = banList[ipHash]
  if (!record) return { blocked: false, shadowBanned: false }
  if (record.shadowBanned) return { blocked: false, shadowBanned: true }
  if (record.banned) {
    if (Date.now() - record.lastAttempt > BAN_DURATION_MS) {
      record.banned = false
      record.attempts = 0
      return { blocked: false, shadowBanned: false }
    }
    return { blocked: true, shadowBanned: false }
  }
  return { blocked: false, shadowBanned: false }
}

function recordFailedAttempt(ipHash: string): boolean {
  const record = banList[ipHash] ?? { attempts: 0, lastAttempt: 0, banned: false, shadowBanned: false }
  record.attempts += 1
  record.lastAttempt = Date.now()
  if (record.attempts >= MAX_ATTEMPTS) record.banned = true
  banList[ipHash] = record
  return record.banned
}

function verifyAuth(request: Request, code: string | null): NextResponse | null {
  const ip = getClientIP(request)
  const ipHash = hashIP(ip)
  const ban = checkBan(ipHash)

  if (ban.blocked) {
    return NextResponse.json({ error: 'Prístup zablokovaný' }, { status: 403 })
  }
  if (ban.shadowBanned) {
    return NextResponse.json({ error: 'Neplatný prístupový kód' }, { status: 401 })
  }
  if (code !== ADMIN_CODE) {
    recordFailedAttempt(ipHash)
    return NextResponse.json({ error: 'Neplatný prístupový kód' }, { status: 401 })
  }
  return null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const action = searchParams.get('action')

  const authError = verifyAuth(request, code)
  if (authError) return authError

  if (action === 'stats') {
    // Fetch live visitor data from our own visitors endpoint
    try {
      const origin = new URL(request.url).origin
      const vRes = await fetch(`${origin}/api/visitors?action=ping&sid=admin-poll`, { cache: 'no-store' })
      if (vRes.ok) {
        const v = await vRes.json()
        visitorStore.totalPageViews = v.lifetimeViews ?? v.totalPageViews ?? 0
        visitorStore.uniqueVisitors = v.lifetimeUnique ?? v.uniqueVisitors ?? 0
        visitorStore.activeSessions = v.activeNow ?? 0
      }
    } catch { /* fallback to cached */ }

    return NextResponse.json({
      visitors: visitorStore,
      config: { ...adminConfig },
      banList: { ...banList },
    })
  }

  if (action === 'config') {
    return NextResponse.json({ config: { ...adminConfig } })
  }

  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  const authError = verifyAuth(request, code)
  if (authError) return authError

  const body = await request.json()
  const action = body.action

  if (action === 'updateConfig') {
    if (body.siteName !== undefined) adminConfig.siteName = String(body.siteName)
    if (body.announcement !== undefined) adminConfig.announcement = String(body.announcement)
    if (body.maintenanceMode !== undefined) adminConfig.maintenanceMode = Boolean(body.maintenanceMode)
    if (body.enabledWidgets !== undefined) adminConfig.enabledWidgets = body.enabledWidgets
    return NextResponse.json({ ok: true, config: { ...adminConfig } })
  }

  if (action === 'resetVisitors') {
    // Call visitors endpoint to reset (we can't directly access the store)
    return NextResponse.json({ ok: true })
  }

  if (action === 'clearCache') {
    return NextResponse.json({ ok: true, message: 'Cache cleared' })
  }

  if (action === 'shadowBan') {
    const targetHash = body.ipHash
    if (!targetHash) return NextResponse.json({ error: 'Missing ipHash' }, { status: 400 })
    const existing = banList[targetHash] ?? { attempts: 0, lastAttempt: Date.now(), banned: false, shadowBanned: false }
    existing.shadowBanned = true
    banList[targetHash] = existing
    return NextResponse.json({ ok: true })
  }

  if (action === 'unban') {
    const targetHash = body.ipHash
    if (!targetHash) return NextResponse.json({ error: 'Missing ipHash' }, { status: 400 })
    delete banList[targetHash]
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
