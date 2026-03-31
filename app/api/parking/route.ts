import { NextResponse } from 'next/server'

export const revalidate = 300

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + now.getHours()
  const rng = seededRng(seed)

  const garages = [
    { name: 'Aupark', address: 'Einsteinova 18', total: 1200, lat: 48.1322, lng: 17.1068 },
    { name: 'Eurovea', address: 'Pribinova 8', total: 800, lat: 48.1395, lng: 17.1215 },
    { name: 'Bory Mall', address: 'Lamač 6780', total: 3000, lat: 48.1878, lng: 17.0472 },
    { name: 'Central', address: 'Metodova 6', total: 600, lat: 48.1525, lng: 17.1234 },
    { name: 'Nivy', address: 'Mlynské nivy 16', total: 2200, lat: 48.1457, lng: 17.1325 },
    { name: 'Avion', address: 'Ivanská cesta 16', total: 2500, lat: 48.1633, lng: 17.1788 },
    { name: 'Polus City', address: 'Vajnorská 100', total: 1400, lat: 48.1714, lng: 17.1422 },
    { name: 'Galleria Eurovea 2', address: 'Pribinova 10', total: 1000, lat: 48.1401, lng: 17.1230 },
  ]

  const parking = garages.map(g => {
    const occupancy = 0.3 + rng() * 0.6
    const free = Math.max(5, Math.floor(g.total * (1 - occupancy)))
    return {
      ...g,
      free,
      occupancy: Math.round(occupancy * 100),
      price: (1.5 + rng() * 2).toFixed(2) + ' €/h',
    }
  }).sort((a, b) => b.free - a.free)

  return NextResponse.json({ parking, timestamp: Date.now() })
}
