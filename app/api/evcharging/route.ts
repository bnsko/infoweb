import { NextResponse } from 'next/server'

export const revalidate = 600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

function mapsLink(lat: number, lng: number, name: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&ll=${lat},${lng}`
}

export async function GET() {
  const now = new Date()
  const seed = now.getHours() * 100 + now.getDate()
  const rng = seededRng(seed)

  const stations = [
    { name: 'ZSE Drive Eurovea', city: 'Bratislava', address: 'Pribinova 8', provider: 'ZSE', connectors: 4, power: '150 kW', lat: 48.1454, lng: 17.1170 },
    { name: 'GreenWay Aupark', city: 'Bratislava', address: 'Einsteinova 18', provider: 'GreenWay', connectors: 6, power: '50 kW', lat: 48.1163, lng: 17.1072 },
    { name: 'ZSE Drive Nivy', city: 'Bratislava', address: 'Mlynské nivy 16', provider: 'ZSE', connectors: 8, power: '150 kW', lat: 48.1484, lng: 17.1278 },
    { name: 'GreenWay Trnava', city: 'Trnava', address: 'City Arena', provider: 'GreenWay', connectors: 4, power: '50 kW', lat: 48.3820, lng: 17.5880 },
    { name: 'ZSE Drive Nitra', city: 'Nitra', address: 'Galeria Mlyny', provider: 'ZSE', connectors: 4, power: '100 kW', lat: 48.3097, lng: 18.0847 },
    { name: 'Tesla Supercharger D1', city: 'Piešťany', address: 'D1 Exit 70', provider: 'Tesla', connectors: 8, power: '250 kW', lat: 48.5700, lng: 17.7985 },
    { name: 'Ionity Liptovský Mikuláš', city: 'Liptovský Mikuláš', address: 'D1 Exit 250', provider: 'Ionity', connectors: 6, power: '350 kW', lat: 49.0831, lng: 19.6072 },
    { name: 'GreenWay Košice', city: 'Košice', address: 'Optima', provider: 'GreenWay', connectors: 4, power: '50 kW', lat: 48.7078, lng: 21.2611 },
  ]

  const connectorTypes = ['CCS2', 'CHAdeMO', 'Type 2']

  const stationData = stations.map(s => {
    const powerNum = parseInt(s.power)
    const conns = Array.from({ length: s.connectors }, (_, i) => {
      const r = rng()
      return {
        type: connectorTypes[i % connectorTypes.length],
        power: powerNum,
        status: r > 0.6 ? 'available' as const : r > 0.15 ? 'occupied' as const : 'offline' as const,
      }
    })
    return {
      name: s.name,
      operator: s.provider,
      city: s.city,
      address: s.address,
      lat: s.lat,
      lng: s.lng,
      connectors: conns,
      pricePerKwh: +(0.30 + rng() * 0.20).toFixed(2),
      mapsUrl: mapsLink(s.lat, s.lng, s.name),
    }
  })

  const allConns = stationData.flatMap(s => s.connectors)
  const stats = {
    totalStations: stationData.length,
    totalConnectors: allConns.length,
    available: allConns.filter(c => c.status === 'available').length,
    occupied: allConns.filter(c => c.status === 'occupied').length,
  }

  return NextResponse.json({ stations: stationData, stats, timestamp: Date.now() })
}
