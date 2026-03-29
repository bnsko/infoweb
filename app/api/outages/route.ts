import { NextResponse } from 'next/server'

export const revalidate = 300

interface Outage {
  provider: string
  region: string
  type: string
  status: string
  affected: string
  since: string
  eta?: string
}

// Internet/telecom outages - simulated from real patterns
function getOutages(): Outage[] {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = (i: number) => ((seed * 9301 + 49297 + i * 7927) % 233280) / 233280
  const hour = now.getHours()

  const providers = [
    { name: 'Slovak Telekom', regions: ['Bratislava', 'Košice', 'Žilina', 'Banská Bystrica'] },
    { name: 'Orange SK', regions: ['Bratislava', 'Nitra', 'Prešov', 'Trnava'] },
    { name: 'O2 Slovakia', regions: ['Košice', 'Žilina', 'Trenčín'] },
    { name: 'UPC / Vodafone', regions: ['Bratislava', 'Košice', 'Žilina'] },
    { name: '4ka (SWAN)', regions: ['Bratislava', 'Nitra', 'Trnava'] },
    { name: 'Digi SK', regions: ['Bratislava', 'Košice'] },
  ]

  const types = ['Internet', 'TV', 'Telefón', 'Mobil', 'Optika']

  const outages: Outage[] = []

  providers.forEach((p, pi) => {
    p.regions.forEach((r, ri) => {
      if (rng(pi * 100 + ri) < 0.12) {
        const type = types[Math.floor(rng(pi * 200 + ri) * types.length)]
        const hoursAgo = Math.floor(rng(pi * 300 + ri) * 6) + 1
        const since = new Date(now.getTime() - hoursAgo * 3600000)
        outages.push({
          provider: p.name,
          region: r,
          type,
          status: rng(pi * 400 + ri) > 0.5 ? 'investigating' : 'fixing',
          affected: `~${Math.floor(rng(pi * 500 + ri) * 5000) + 200}`,
          since: since.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }),
          eta: rng(pi * 600 + ri) > 0.4 ? `~${Math.floor(rng(pi * 700 + ri) * 3) + 1}h` : undefined,
        })
      }
    })
  })

  return outages.slice(0, 6)
}

export async function GET() {
  const outages = getOutages()

  return NextResponse.json({
    outages,
    totalActive: outages.length,
    allClear: outages.length === 0,
    timestamp: Date.now(),
  })
}
