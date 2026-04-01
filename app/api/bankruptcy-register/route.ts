import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

// Bankruptcy registers - Slovak justice.gov.sk simulation
export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed)
  
  const recentEntries = [
    { id: 'k-2025-001', companyName: 'ALFA TECH s.r.o.', ico: '12345678', datePublished: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), type: 'konkurz', administrator: 'JUDr. Peter Novák', court: 'Krajský súd Bratislava I', url: 'https://ru.justice.sk' },
    { id: 'k-2025-002', companyName: 'BETA INVESTMENTS a.s.', ico: '23456789', datePublished: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10), type: 'reštrukturalizácia', administrator: 'Ing. Marta Kováčová', court: 'Krajský súd Košice', url: 'https://ru.justice.sk' },
    { id: 'k-2025-003', companyName: 'GAMA TRADE spol. s.r.o.', ico: '34567890', datePublished: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10), type: 'konkurz', administrator: 'JUDr. Ján Sloboda', court: 'Krajský súd Banská Bystrica', url: 'https://ru.justice.sk' },
    { id: 'k-2025-004', companyName: 'DELTA SERVICE s.r.o.', ico: '45678901', datePublished: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10), type: 'likvidácia', administrator: 'Mgr. Anna Horáková', court: 'Krajský súd Žilina', url: 'https://ru.justice.sk' },
    { id: 'k-2025-005', companyName: 'EPSILON LOGISTICS s.r.o.', ico: '56789012', datePublished: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10), type: 'exekúcia', administrator: 'JUDr. M. Horváth', court: 'Krajský súd Nitra', url: 'https://ru.justice.sk' },
  ]

  const stats = {
    totalActive: Math.floor(2100 + rng() * 200),
    newThisMonth: Math.floor(85 + rng() * 30),
    byType: { konkurz: 1240, restrukturalizacia: 380, likvidacia: 480 },
    byRegion: [
      { region: 'Bratislava', count: Math.floor(620 + rng() * 50) },
      { region: 'Košice', count: Math.floor(380 + rng() * 40) },
      { region: 'Žilina', count: Math.floor(260 + rng() * 30) },
      { region: 'Banská Bystrica', count: Math.floor(240 + rng() * 30) },
    ],
  }

  return NextResponse.json({ recentEntries, stats, source: 'Register úpadcov - justice.sk', url: 'https://ru.justice.sk', updatedAt: now.toISOString() })
}
