import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

const ADMIN_CODE = process.env.ADMIN_CODE ?? 'idealnyja'
const CONFIG_FILE = join(process.cwd(), '.admin-config.json')
const VISITOR_FILE = join(process.cwd(), '.visitor-data.json')
const BANLIST_FILE = join(process.cwd(), '.admin-bans.json')

const MAX_ATTEMPTS = 3
const BAN_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

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

type BanList = Record<string, BanRecord>

function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() ?? real ?? 'unknown'
}

function readBanList(): BanList {
  if (!existsSync(BANLIST_FILE)) return {}
  try { return JSON.parse(readFileSync(BANLIST_FILE, 'utf-8')) }
  catch { return {} }
}

function writeBanList(list: BanList) {
  writeFileSync(BANLIST_FILE, JSON.stringify(list, null, 2), 'utf-8')
}

function checkBan(ipHash: string): { blocked: boolean; shadowBanned: boolean } {
  const bans = readBanList()
  const record = bans[ipHash]
  if (!record) return { blocked: false, shadowBanned: false }
  if (record.shadowBanned) return { blocked: false, shadowBanned: true }
  if (record.banned) {
    if (Date.now() - record.lastAttempt > BAN_DURATION_MS) {
      record.banned = false
      record.attempts = 0
      writeBanList(bans)
      return { blocked: false, shadowBanned: false }
    }
    return { blocked: true, shadowBanned: false }
  }
  return { blocked: false, shadowBanned: false }
}

function recordFailedAttempt(ipHash: string): boolean {
  const bans = readBanList()
  const record = bans[ipHash] ?? { attempts: 0, lastAttempt: 0, banned: false, shadowBanned: false }
  record.attempts += 1
  record.lastAttempt = Date.now()
  if (record.attempts >= MAX_ATTEMPTS) {
    record.banned = true
  }
  bans[ipHash] = record
  writeBanList(bans)
  return record.banned
}

function getDefaultConfig(): AdminConfig {
  return {
    siteName: 'InfoSK',
    refreshRates: {},
    enabledWidgets: ['weather', 'stats', 'currency', 'crypto', 'flights', 'iss', 'earthquakes', 'launches', 'reddit', 'onthisday', 'news', 'population', 'nameday'],
    announcement: '',
    maintenanceMode: false,
  }
}

function readConfig(): AdminConfig {
  if (!existsSync(CONFIG_FILE)) return getDefaultConfig()
  try { return { ...getDefaultConfig(), ...JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) } }
  catch { return getDefaultConfig() }
}

function writeConfig(config: AdminConfig) {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
}

function verifyAuth(request: Request, code: string | null): NextResponse | null {
  const ip = getClientIP(request)
  const ipHash = hashIP(ip)
  const ban = checkBan(ipHash)

  if (ban.blocked) {
    return NextResponse.json({ error: 'Prístup zablokovaný. Príliš veľa neúspešných pokusov.' }, { status: 403 })
  }

  if (ban.shadowBanned) {
    // Shadow ban: pretend it's wrong even with correct code
    return NextResponse.json({ error: 'Neplatný prístupový kód' }, { status: 401 })
  }

  if (code !== ADMIN_CODE) {
    recordFailedAttempt(ipHash)
    return NextResponse.json({ error: 'Neplatný prístupový kód' }, { status: 401 })
  }

  return null // auth OK
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const action = searchParams.get('action')

  const authError = verifyAuth(request, code)
  if (authError) return authError

  if (action === 'stats') {
    let visitors = { totalPageViews: 0, uniqueVisitors: 0, activeSessions: 0 }
    if (existsSync(VISITOR_FILE)) {
      try {
        const data = JSON.parse(readFileSync(VISITOR_FILE, 'utf-8'))
        const now = Date.now()
        const active = (data.activeSessions ?? []).filter((s: { lastSeen: number }) => now - s.lastSeen < 5 * 60 * 1000)
        visitors = {
          totalPageViews: data.totalPageViews ?? 0,
          uniqueVisitors: (data.uniqueVisitors ?? []).length,
          activeSessions: active.length,
        }
      } catch { /* empty */ }
    }
    const banList = readBanList()
    return NextResponse.json({ visitors, config: readConfig(), banList })
  }

  if (action === 'config') {
    return NextResponse.json({ config: readConfig() })
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
    const config = readConfig()
    if (body.siteName !== undefined) config.siteName = String(body.siteName)
    if (body.announcement !== undefined) config.announcement = String(body.announcement)
    if (body.maintenanceMode !== undefined) config.maintenanceMode = Boolean(body.maintenanceMode)
    if (body.enabledWidgets !== undefined) config.enabledWidgets = body.enabledWidgets
    writeConfig(config)
    return NextResponse.json({ ok: true, config })
  }

  if (action === 'resetVisitors') {
    if (existsSync(VISITOR_FILE)) {
      writeFileSync(VISITOR_FILE, JSON.stringify({ totalPageViews: 0, uniqueVisitors: [], activeSessions: [] }), 'utf-8')
    }
    return NextResponse.json({ ok: true })
  }

  if (action === 'clearCache') {
    return NextResponse.json({ ok: true, message: 'Cache cleared' })
  }

  if (action === 'shadowBan') {
    const targetHash = body.ipHash
    if (!targetHash) return NextResponse.json({ error: 'Missing ipHash' }, { status: 400 })
    const bans = readBanList()
    bans[targetHash] = { ...(bans[targetHash] ?? { attempts: 0, lastAttempt: Date.now(), banned: false, shadowBanned: false }), shadowBanned: true }
    writeBanList(bans)
    return NextResponse.json({ ok: true })
  }

  if (action === 'unban') {
    const targetHash = body.ipHash
    if (!targetHash) return NextResponse.json({ error: 'Missing ipHash' }, { status: 400 })
    const bans = readBanList()
    delete bans[targetHash]
    writeBanList(bans)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
