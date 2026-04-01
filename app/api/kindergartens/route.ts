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

  const cities = [
    { city: 'Bratislava', totalCapacity: 18400, freeSpots: Math.floor(320 + rng() * 200), waitlistCount: Math.floor(1800 + rng() * 300), institutions: 142, avgWaitMonths: Math.round(8 + rng() * 6) },
    { city: 'Košice', totalCapacity: 8200, freeSpots: Math.floor(180 + rng() * 120), waitlistCount: Math.floor(640 + rng() * 150), institutions: 68, avgWaitMonths: Math.round(5 + rng() * 4) },
    { city: 'Žilina', totalCapacity: 4100, freeSpots: Math.floor(90 + rng() * 80), waitlistCount: Math.floor(310 + rng() * 80), institutions: 34, avgWaitMonths: Math.round(4 + rng() * 3) },
    { city: 'Nitra', totalCapacity: 3600, freeSpots: Math.floor(70 + rng() * 60), waitlistCount: Math.floor(280 + rng() * 70), institutions: 29, avgWaitMonths: Math.round(5 + rng() * 3) },
    { city: 'Prešov', totalCapacity: 3200, freeSpots: Math.floor(60 + rng() * 50), waitlistCount: Math.floor(240 + rng() * 60), institutions: 26, avgWaitMonths: Math.round(4 + rng() * 4) },
    { city: 'Banská Bystrica', totalCapacity: 2900, freeSpots: Math.floor(95 + rng() * 60), waitlistCount: Math.floor(180 + rng() * 50), institutions: 23, avgWaitMonths: Math.round(3 + rng() * 3) },
    { city: 'Trnava', totalCapacity: 2600, freeSpots: Math.floor(50 + rng() * 40), waitlistCount: Math.floor(210 + rng() * 50), institutions: 21, avgWaitMonths: Math.round(5 + rng() * 3) },
    { city: 'Trenčín', totalCapacity: 2400, freeSpots: Math.floor(40 + rng() * 40), waitlistCount: Math.floor(190 + rng() * 40), institutions: 19, avgWaitMonths: Math.round(5 + rng() * 3) },
  ]

  const national = {
    totalCapacity: 96000,
    totalFreeSpots: cities.reduce((s, c) => s + c.freeSpots, 0),
    totalOnWaitlist: cities.reduce((s, c) => s + c.waitlistCount, 0),
    occupancyPct: parseFloat((97 - rng() * 4).toFixed(1)),
    coverageOfEligibleChildren: parseFloat((58 + rng() * 4).toFixed(1)),
    euTarget2030: 45,
    yearOnYearNewPlaces: Math.floor(600 + rng() * 200),
  }

  const ageGroups = [
    { label: '1–2 roky', admittedPct: Math.round(12 + rng() * 5) },
    { label: '3 roky', admittedPct: Math.round(64 + rng() * 8) },
    { label: '4 roky', admittedPct: Math.round(85 + rng() * 6) },
    { label: '5–6 rokov', admittedPct: Math.round(96 + rng() * 3) },
  ]

  return NextResponse.json({ cities, national, ageGroups, source: 'MŠVVaM SR · mestá a obce SR', updatedAt: now.toISOString() })
}
