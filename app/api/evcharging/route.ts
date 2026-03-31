import { NextResponse } from 'next/server'

export const revalidate = 600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getHours() * 100 + now.getDate()
  const rng = seededRng(seed)

  const stations = [
    { name: 'ZSE Drive Eurovea', city: 'Bratislava', address: 'Pribinova 8', provider: 'ZSE', connectors: 4, power: '150 kW' },
    { name: 'GreenWay Aupark', city: 'Bratislava', address: 'Einsteinova 18', provider: 'GreenWay', connectors: 6, power: '50 kW' },
    { name: 'ZSE Drive Nivy', city: 'Bratislava', address: 'Mlynské nivy 16', provider: 'ZSE', connectors: 8, power: '150 kW' },
    { name: 'GreenWay Trnava', city: 'Trnava', address: 'City Arena', provider: 'GreenWay', connectors: 4, power: '50 kW' },
    { name: 'ZSE Drive Nitra', city: 'Nitra', address: 'Galeria Mlyny', provider: 'ZSE', connectors: 4, power: '100 kW' },
    { name: 'Tesla Supercharger D1', city: 'Piešťany', address: 'D1 Exit 70', provider: 'Tesla', connectors: 8, power: '250 kW' },
    { name: 'Ionity Liptovský Mikuláš', city: 'Liptovský Mikuláš', address: 'D1 Exit 250', provider: 'Ionity', connectors: 6, power: '350 kW' },
    { name: 'GreenWay Košice', city: 'Košice', address: 'Optima', provider: 'GreenWay', connectors: 4, power: '50 kW' },
  ]

  const stationData = stations.map(s => ({
    ...s,
    available: Math.max(0, Math.floor(s.connectors * (0.3 + rng() * 0.7))),
    price: (0.30 + rng() * 0.20).toFixed(2) + ' €/kWh',
    status: rng() > 0.1 ? 'online' as const : 'offline' as const,
  }))

  return NextResponse.json({ stations: stationData, total: stations.length, timestamp: Date.now() })
}
