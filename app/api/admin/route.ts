import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

const ADMIN_CODE = process.env.ADMIN_CODE ?? 'idealnyja'
const MAX_ATTEMPTS = 3
const BAN_DURATION_MS = 24 * 60 * 60 * 1000

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

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

const DEFAULT_CONFIG: AdminConfig = {
  siteName: 'InfoSK',
  refreshRates: {},
  enabledWidgets: [
    'main:daysummary', 'main:nameday', 'main:news', 'main:events',
    'main:food', 'main:fuel', 'main:environment', 'main:wiki',
    'tab:doprava', 'tab:zdravie', 'tab:financie', 'tab:sport',
    'tab:tech', 'tab:gaming', 'tab:ostatne',
  ],
  announcement: '',
  maintenanceMode: false,
}

async function getConfig(): Promise<AdminConfig> {
  try {
    const raw = await redis.get<AdminConfig>('admin:config')
    if (raw) return { ...DEFAULT_CONFIG, ...raw }
  } catch { /* fallback */ }
  return { ...DEFAULT_CONFIG }
}

async function saveConfig(cfg: AdminConfig): Promise<void> {
  await redis.set('admin:config', JSON.stringify(cfg))
}

async function getBans(): Promise<Record<string, BanRecord>> {
  try {
    const raw = await redis.hgetall('admin:bans')
    if (!raw) return {}
    const bans: Record<string, BanRecord> = {}
    for (const [k, v] of Object.entries(raw)) {
      try { bans[k] = typeof v === 'string' ? JSON.parse(v) : (v as BanRecord) } catch { /* skip */ }
    }
    return bans
  } catch { return {} }
}

async function saveBan(ipHash: string, record: BanRecord): Promise<void> {
  await redis.hset('admin:bans', { [ipHash]: JSON.stringify(record) })
  await redis.expire('admin:bans', 30 * 24 * 3600)
}

async function deleteBan(ipHash: string): Promise<void> {
  await redis.hdel('admin:bans', ipHash)
}

function todayKey() { return new Date().toISOString().slice(0, 10) }
function weekKey() {
  const d = new Date(); const jan1 = new Date(d.getFullYear(), 0, 1)
  const w = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(w).padStart(2, '0')}`
}
function monthKey() { return new Date().toISOString().slice(0, 7) }

function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() ?? real ?? 'unknown'
}

async function verifyAuth(request: Request, code: string | null): Promise<NextResponse | null> {
  const ip = getClientIP(request)
  const ipHash = hashIP(ip)
  const bans = await getBans()
  const record = bans[ipHash]

  if (record) {
    if (record.shadowBanned) return NextResponse.json({ error: 'Neplatný prístupový kód' }, { status: 401 })
    if (record.banned) {
      if (Date.now() - record.lastAttempt > BAN_DURATION_MS) {
        await deleteBan(ipHash)
      } else {
        return NextResponse.json({ error: 'Prístup zablokovaný' }, { status: 403 })
      }
    }
  }

  if (code !== ADMIN_CODE) {
    const existing = bans[ipHash] ?? { attempts: 0, lastAttempt: 0, banned: false, shadowBanned: false }
    existing.attempts += 1
    existing.lastAttempt = Date.now()
    if (existing.attempts >= MAX_ATTEMPTS) existing.banned = true
    await saveBan(ipHash, existing)
    return NextResponse.json({ error: 'Neplatný prístupový kód' }, { status: 401 })
  }
  return null
}

async function getVisitorStats() {
  const today = todayKey(); const week = weekKey(); const month = monthKey()
  const p = redis.pipeline()
  p.get('visitors:total_views')
  p.get(`visitors:daily:${today}`)
  p.get(`visitors:weekly:${week}`)
  p.get(`visitors:monthly:${month}`)
  const [total, daily, weekly, monthly] = await p.exec()

  let activeNow = 0; let cursor = 0
  do {
    const [next, keys] = await redis.scan(cursor, { match: 'visitors:session:*', count: 100 })
    cursor = Number(next); activeNow += keys.length
  } while (cursor !== 0)

  return {
    totalPageViews: Number(total) || 0,
    todayPageViews: Number(daily) || 0,
    weekPageViews: Number(weekly) || 0,
    monthPageViews: Number(monthly) || 0,
    activeSessions: activeNow,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const action = searchParams.get('action')

  // Public endpoint — no auth required
  if (action === 'publicConfig') {
    const cfg = await getConfig()
    return NextResponse.json({
      enabledWidgets: cfg.enabledWidgets,
      maintenanceMode: cfg.maintenanceMode,
      announcement: cfg.announcement,
    })
  }

  const authError = await verifyAuth(request, code)
  if (authError) return authError

  if (action === 'stats') {
    const [visitors, config, banList] = await Promise.all([
      getVisitorStats().catch(() => ({ totalPageViews: 0, todayPageViews: 0, weekPageViews: 0, monthPageViews: 0, activeSessions: 0 })),
      getConfig(),
      getBans(),
    ])
    return NextResponse.json({ visitors, config, banList })
  }

  if (action === 'liveCount') {
    let activeNow = 0; let cursor = 0
    do {
      const [next, keys] = await redis.scan(cursor, { match: 'visitors:session:*', count: 100 })
      cursor = Number(next); activeNow += keys.length
    } while (cursor !== 0)
    const today = await redis.get(`visitors:daily:${todayKey()}`)
    return NextResponse.json({ activeNow, todayViews: Number(today) || 0 })
  }

  if (action === 'history') {
    const days: string[] = []
    for (let i = 29; i >= 0; i--) {
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

  if (action === 'visitorsRecent') {
    try {
      const raw = await redis.lrange('visitors:log', -200, -1)
      const entries = (raw as string[])
        .map(s => { try { return JSON.parse(s) } catch { return null } })
        .filter(Boolean)
        .reverse()
      return NextResponse.json({ entries })
    } catch {
      return NextResponse.json({ entries: [] })
    }
  }

  if (action === 'config') {
    const config = await getConfig()
    return NextResponse.json({ config })
  }

  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  const authError = await verifyAuth(request, code)
  if (authError) return authError

  const body = await request.json()
  const action = body.action

  if (action === 'updateConfig') {
    const config = await getConfig()
    if (body.siteName !== undefined) config.siteName = String(body.siteName)
    if (body.announcement !== undefined) config.announcement = String(body.announcement)
    if (body.maintenanceMode !== undefined) config.maintenanceMode = Boolean(body.maintenanceMode)
    if (body.enabledWidgets !== undefined) config.enabledWidgets = body.enabledWidgets
    await saveConfig(config)
    return NextResponse.json({ ok: true, config })
  }

  if (action === 'resetAll') {
    const today = todayKey(); const week = weekKey(); const month = monthKey()
    await redis.del('visitors:total_views', `visitors:daily:${today}`, `visitors:weekly:${week}`, `visitors:monthly:${month}`)
    return NextResponse.json({ ok: true, message: 'Všetky počítadlá resetované' })
  }

  if (action === 'resetToday') {
    await redis.del(`visitors:daily:${todayKey()}`)
    return NextResponse.json({ ok: true, message: 'Dnešné počítadlo resetované' })
  }

  if (action === 'resetWeek') {
    await redis.del(`visitors:weekly:${weekKey()}`)
    return NextResponse.json({ ok: true, message: 'Týždenné počítadlo resetované' })
  }

  if (action === 'resetMonth') {
    await redis.del(`visitors:monthly:${monthKey()}`)
    return NextResponse.json({ ok: true, message: 'Mesačné počítadlo resetované' })
  }

  if (action === 'clearLog') {
    await redis.del('visitors:log')
    return NextResponse.json({ ok: true, message: 'Log návštevníkov vymazaný' })
  }

  if (action === 'setTotal') {
    const val = Number(body.value)
    if (isNaN(val) || val < 0) return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
    await redis.set('visitors:total_views', String(val))
    return NextResponse.json({ ok: true, message: `Total nastavený na ${val}` })
  }

  if (action === 'addViews') {
    const val = Number(body.value)
    if (isNaN(val) || val <= 0) return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
    const today = todayKey(); const week = weekKey(); const month = monthKey()
    const p = redis.pipeline()
    p.incrby('visitors:total_views', val)
    p.incrby(`visitors:daily:${today}`, val)
    p.incrby(`visitors:weekly:${week}`, val)
    p.incrby(`visitors:monthly:${month}`, val)
    await p.exec()
    return NextResponse.json({ ok: true, message: `Pridaných ${val} zobrazení` })
  }

  if (action === 'clearCache') {
    return NextResponse.json({ ok: true, message: 'Cache invalidation signaled' })
  }

  if (action === 'testApis') {
    const apis = [
      '/api/weather', '/api/news', '/api/stats', '/api/traffic', '/api/currency',
      '/api/crypto', '/api/flights', '/api/reddit', '/api/flashnews',
      '/api/randomfact', '/api/pollen', '/api/flu', '/api/doctors',
      '/api/unemployment', '/api/jobs', '/api/lunchmenu', '/api/fuelprices',
      '/api/events', '/api/tourism', '/api/wikipedia', '/api/airquality',
    ]
    const origin = new URL(request.url).origin
    const results: { api: string; status: number; ok: boolean; ms: number }[] = []
    for (const api of apis) {
      const start = Date.now()
      try {
        const res = await fetch(`${origin}${api}`, { cache: 'no-store', signal: AbortSignal.timeout(6000) })
        results.push({ api, status: res.status, ok: res.ok, ms: Date.now() - start })
      } catch {
        results.push({ api, status: 0, ok: false, ms: Date.now() - start })
      }
    }
    return NextResponse.json({ ok: true, results })
  }

  if (action === 'shadowBan') {
    const targetHash = body.ipHash
    if (!targetHash) return NextResponse.json({ error: 'Missing ipHash' }, { status: 400 })
    const bans = await getBans()
    const existing = bans[targetHash] ?? { attempts: 0, lastAttempt: Date.now(), banned: false, shadowBanned: false }
    existing.shadowBanned = true
    await saveBan(targetHash, existing)
    return NextResponse.json({ ok: true })
  }

  if (action === 'unban') {
    const targetHash = body.ipHash
    if (!targetHash) return NextResponse.json({ error: 'Missing ipHash' }, { status: 400 })
    await deleteBan(targetHash)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
