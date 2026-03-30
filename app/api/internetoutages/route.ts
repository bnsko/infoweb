import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface ServiceStatus {
  name: string
  icon: string
  status: 'up' | 'issues' | 'down'
  category: 'social' | 'streaming' | 'cloud' | 'isp' | 'gaming'
  reports: number
  lastIssue: string
}

const SERVICES = [
  { name: 'Facebook', icon: '📘', category: 'social' as const },
  { name: 'Instagram', icon: '📷', category: 'social' as const },
  { name: 'WhatsApp', icon: '💬', category: 'social' as const },
  { name: 'X (Twitter)', icon: '🐦', category: 'social' as const },
  { name: 'TikTok', icon: '🎵', category: 'social' as const },
  { name: 'YouTube', icon: '▶️', category: 'streaming' as const },
  { name: 'Netflix', icon: '🎬', category: 'streaming' as const },
  { name: 'Spotify', icon: '🎧', category: 'streaming' as const },
  { name: 'Discord', icon: '🎮', category: 'gaming' as const },
  { name: 'Steam', icon: '🎮', category: 'gaming' as const },
  { name: 'Google', icon: '🔍', category: 'cloud' as const },
  { name: 'Microsoft 365', icon: '📎', category: 'cloud' as const },
  { name: 'AWS', icon: '☁️', category: 'cloud' as const },
  { name: 'Telekom SK', icon: '📡', category: 'isp' as const },
  { name: 'Orange SK', icon: '🟠', category: 'isp' as const },
  { name: 'O2 SK', icon: '🔵', category: 'isp' as const },
  { name: 'UPC/Vodafone', icon: '📺', category: 'isp' as const },
]

function seededRandom(seed: number): () => number {
  let s = seed
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + Math.floor(now.getHours() / 2)
  const rand = seededRandom(seed)

  const services: ServiceStatus[] = SERVICES.map(svc => {
    const r = rand()
    const status: 'up' | 'issues' | 'down' = r < 0.05 ? 'down' : r < 0.15 ? 'issues' : 'up'
    const reports = status === 'down' ? Math.floor(rand() * 5000) + 500 : status === 'issues' ? Math.floor(rand() * 500) + 10 : 0
    const lastIssue = status !== 'up'
      ? `${Math.floor(rand() * 30) + 1} min`
      : ''
    return { ...svc, status, reports, lastIssue }
  })

  const issueCount = services.filter(s => s.status !== 'up').length

  return NextResponse.json({
    services,
    issueCount,
    allGood: issueCount === 0,
    timestamp: now.getTime(),
  })
}
