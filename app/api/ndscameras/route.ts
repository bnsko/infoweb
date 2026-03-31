import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed)

  const cameras = [
    { name: 'D1 Bratislava - Trnava', road: 'D1', km: '15.2', direction: 'BA → TT' },
    { name: 'D1 Trnava - Piešťany', road: 'D1', km: '58.3', direction: 'TT → PN' },
    { name: 'D2 Bratislava - Malacky', road: 'D2', km: '22.1', direction: 'BA → MA' },
    { name: 'R1 Nitra - Žiar nad Hronom', road: 'R1', km: '85.4', direction: 'NR → ZH' },
    { name: 'D1 Žilina - Martin', road: 'D1', km: '195.8', direction: 'ZA → MT' },
    { name: 'D1 Poprad - Prešov', road: 'D1', km: '315.2', direction: 'PP → PO' },
    { name: 'D3 Žilina - Čadca', road: 'D3', km: '12.5', direction: 'ZA → CA' },
    { name: 'R2 Zvolen - Lučenec', road: 'R2', km: '45.3', direction: 'ZV → LC' },
  ]

  const cameraData = cameras.map(c => ({
    ...c,
    traffic: rng() > 0.7 ? 'high' : rng() > 0.4 ? 'moderate' : 'low',
    speed: Math.floor(80 + rng() * 50),
    vehicles: Math.floor(50 + rng() * 200),
  }))

  return NextResponse.json({ cameras: cameraData, timestamp: Date.now() })
}
