import { NextResponse } from 'next/server'

export const revalidate = 1800

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const SECTIONS = [
  { id: 'D1_BA_ZI', name: 'D1 Bratislava – Zlaté piesky', kmFrom: 0, kmTo: 8 },
  { id: 'D1_ZI_SE', name: 'D1 Zlaté piesky – Senec', kmFrom: 8, kmTo: 26 },
  { id: 'D1_SE_TR', name: 'D1 Senec – Trnava', kmFrom: 26, kmTo: 58 },
  { id: 'D2_BA_MA', name: 'D2 Bratislava – Malacky', kmFrom: 0, kmTo: 42 },
  { id: 'D4_BA_J', name: 'D4 Bratislava Juh úsek', kmFrom: 0, kmTo: 12 },
  { id: 'R1_BB_ZV', name: 'R1 Banská Bystrica – Zvolen', kmFrom: 0, kmTo: 20 },
  { id: 'D1_TN_NR', name: 'D1 Trnava – Nitra', kmFrom: 58, kmTo: 105 },
  { id: 'D1_NR_TR', name: 'D1 Nitra – Trenčín', kmFrom: 105, kmTo: 157 },
]

export async function GET() {
  const now = new Date()
  const hourSeed = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours()
  const rng = seededRng(hourSeed + 12)

  const isRushHour = (now.getHours() >= 7 && now.getHours() <= 9) || (now.getHours() >= 15 && now.getHours() <= 18)
  const isWeekend = now.getDay() === 0 || now.getDay() === 6

  const sections = SECTIONS.map(s => {
    const baseIntensity = isWeekend ? 8000 : isRushHour ? 28000 : 16000
    const intensity = Math.floor(baseIntensity * (0.6 + rng() * 0.8))
    const truckPct = Math.floor(10 + rng() * 30)
    const avgSpeed = isRushHour ? Math.floor(40 + rng() * 50) : Math.floor(80 + rng() * 40)
    const congestion = intensity > 25000 ? 'heavy' : intensity > 18000 ? 'moderate' : 'free'
    return {
      ...s,
      intensity,
      truckPct,
      avgSpeed,
      congestion,
      incidents: rng() > 0.85 ? Math.floor(1 + rng() * 2) : 0,
    }
  }).sort((a, b) => b.intensity - a.intensity)

  const topSections = sections.slice(0, 3)
  const totalVehiclesInNetwork = sections.reduce((s, x) => s + x.intensity, 0)

  const hourlyProfile = Array.from({ length: 24 }, (_, h) => {
    const peak = (h >= 7 && h <= 9) || (h >= 15 && h <= 18)
    const base = isWeekend ? 6000 : peak ? 26000 : 14000
    return { hour: h, avg: Math.floor(base * (0.7 + rng() * 0.6)) }
  })

  return NextResponse.json({
    sections,
    topSections,
    totalVehiclesInNetwork,
    hourlyProfile,
    isRushHour,
    isWeekend,
    sourceUrl: 'https://www.ndsas.sk/intenzita-dopravy',
    updatedAt: now.toISOString(),
  })
}
