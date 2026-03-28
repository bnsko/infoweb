import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'

export const dynamic = 'force-dynamic'

const SESSION_TIMEOUT = 2 * 60 * 1000
// File-based persistence: survives Lambda warm restarts on Vercel
const PERSIST_FILE = process.env.VISITORS_PERSIST_FILE ?? '/tmp/slovakia-visitors.json'

interface PersistedData {
  lifetimeViews: number
  lifetimeUnique: number
  uniqueHashes: string[]
  todayDate: string
  todayViews: number
}

function loadPersisted(): PersistedData {
  try {
    const raw = readFileSync(PERSIST_FILE, 'utf-8')
    return JSON.parse(raw) as PersistedData
  } catch {
    return { lifetimeViews: 0, lifetimeUnique: 0, uniqueHashes: [], todayDate: '', todayViews: 0 }
  }
}

function savePersisted() {
  try {
    mkdirSync(dirname(PERSIST_FILE), { recursive: true })
    writeFileSync(PERSIST_FILE, JSON.stringify({
      lifetimeViews: store.lifetimeViews,
      lifetimeUnique: store.lifetimeUnique,
      // Cap at 20k hashes to limit file size
      uniqueHashes: Array.from(store.uniqueHashes).slice(-20000),
      todayDate: store.todayDate,
      todayViews: store.todayViews,
    } as PersistedData))
  } catch { /* ignore if /tmp unavailable */ }
}

// Load once at module init (warm start reuses this)
const _p = loadPersisted()
const store = {
  lifetimeViews: _p.lifetimeViews,
  lifetimeUnique: _p.lifetimeUnique,
  uniqueHashes: new Set<string>(_p.uniqueHashes),
  todayDate: _p.todayDate,
  todayViews: _p.todayViews,
  // Sessions are always in-memory only (not persisted)
  sessions: new Map<string, number>(),
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + 'slovakia-info-2026').digest('hex').slice(0, 16)
}

function cleanExpiredSessions() {
  const entries = Array.from(store.sessions.entries())
  const now = Date.now()
  for (let i = 0; i < entries.length; i++) {
    if (now - entries[i][1] > SESSION_TIMEOUT) store.sessions.delete(entries[i][0])
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const sid = searchParams.get('sid') ?? ''

  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? '127.0.0.1'
  const hashedIP = hashIP(ip)

  // Reset daily counter at midnight
  const today = new Date().toISOString().slice(0, 10)
  if (store.todayDate !== today) {
    store.todayDate = today
    store.todayViews = 0
  }

  cleanExpiredSessions()

  let needsSave = false
  if (action === 'visit') {
    store.lifetimeViews++
    store.todayViews++
    if (!store.uniqueHashes.has(hashedIP)) {
      store.uniqueHashes.add(hashedIP)
      store.lifetimeUnique++
    }
    if (sid) store.sessions.set(sid, Date.now())
    needsSave = true
  } else if (action === 'ping' && sid) {
    store.sessions.set(sid, Date.now())
    if (!store.uniqueHashes.has(hashedIP)) {
      store.uniqueHashes.add(hashedIP)
      store.lifetimeUnique++
      needsSave = true
    }
  }

  if (needsSave) savePersisted()

  const deployTime = parseInt(process.env.NEXT_PUBLIC_BUILD_TIME ?? '0', 10)
  return NextResponse.json({
    lifetimeViews: store.lifetimeViews,
    lifetimeUnique: store.lifetimeUnique,
    activeNow: store.sessions.size,
    todayPageViews: store.todayViews,
    uptimeMs: deployTime ? Date.now() - deployTime : 0,
  })
}
