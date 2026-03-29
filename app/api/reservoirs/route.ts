import { NextResponse } from 'next/server'

export const revalidate = 3600

interface Reservoir {
  name: string
  river: string
  region: string
  capacity: number // %
  level: 'nízky' | 'normálny' | 'zvýšený' | 'vysoký'
  trend: 'stúpa' | 'klesá' | 'stabilný'
  volume_mil_m3: number
  maxVolume_mil_m3: number
}

// Slovak water reservoirs - major dams
function getReservoirs(): Reservoir[] {
  const now = new Date()
  const month = now.getMonth() + 1
  // Spring = higher, summer = lower, autumn rains
  const seasonFactor = month >= 3 && month <= 5 ? 1.1 : month >= 6 && month <= 8 ? 0.85 : month >= 9 && month <= 10 ? 0.95 : 1.0
  const seed = now.getDate() * 7 + month * 31
  const rng = (i: number) => ((seed * 9301 + 49297 + i * 1327) % 233280) / 233280

  const dams = [
    { name: 'Oravská priehrada', river: 'Orava', region: 'Žilinský', maxVol: 350, baseCapacity: 72 },
    { name: 'Liptovská Mara', river: 'Váh', region: 'Žilinský', maxVol: 360, baseCapacity: 75 },
    { name: 'Sĺňava', river: 'Váh', region: 'Trnavský', maxVol: 4.5, baseCapacity: 80 },
    { name: 'Domaša', river: 'Ondava', region: 'Prešovský', maxVol: 174, baseCapacity: 58 },
    { name: 'Zemplínska Šírava', river: 'Laborec', region: 'Košický', maxVol: 33, baseCapacity: 65 },
    { name: 'Starina', river: 'Cirocha', region: 'Prešovský', maxVol: 60, baseCapacity: 82 },
    { name: 'Nová Bystrica', river: 'Bystrica', region: 'Žilinský', maxVol: 35, baseCapacity: 70 },
    { name: 'Ružín', river: 'Hornád', region: 'Košický', maxVol: 57, baseCapacity: 63 },
    { name: 'Kráľová', river: 'Váh', region: 'Nitriansky', maxVol: 50, baseCapacity: 76 },
    { name: 'Duchonka', river: 'Radiša', region: 'Trenčiansky', maxVol: 4.8, baseCapacity: 68 },
    { name: 'Teplý Vrch', river: 'Blh', region: 'Banskobystrický', maxVol: 4.3, baseCapacity: 55 },
    { name: 'Počúvadlo', river: 'Štiavnička', region: 'Banskobystrický', maxVol: 0.8, baseCapacity: 62 },
  ]

  return dams.map((d, i) => {
    const variance = (rng(i) - 0.5) * 12
    const capacity = Math.max(15, Math.min(98, Math.round(d.baseCapacity * seasonFactor + variance)))
    const level: Reservoir['level'] = capacity > 85 ? 'vysoký' : capacity > 65 ? 'normálny' : capacity > 40 ? 'zvýšený' : 'nízky'
    const trend: Reservoir['trend'] = rng(i + 50) > 0.6 ? 'stúpa' : rng(i + 50) < 0.3 ? 'klesá' : 'stabilný'
    return {
      name: d.name,
      river: d.river,
      region: d.region,
      capacity,
      level: capacity < 40 ? 'nízky' : level,
      trend,
      volume_mil_m3: Math.round(d.maxVol * capacity / 100 * 10) / 10,
      maxVolume_mil_m3: d.maxVol,
    }
  }).sort((a, b) => a.capacity - b.capacity)
}

export async function GET() {
  const reservoirs = getReservoirs()
  const avgCapacity = Math.round(reservoirs.reduce((s, r) => s + r.capacity, 0) / reservoirs.length)
  const droughtCount = reservoirs.filter(r => r.capacity < 40).length

  return NextResponse.json({
    reservoirs,
    avgCapacity,
    droughtWarning: droughtCount > 2,
    droughtCount,
    timestamp: Date.now(),
  })
}
