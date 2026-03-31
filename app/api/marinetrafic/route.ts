import { NextResponse } from 'next/server'

export const revalidate = 600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getHours() * 100 + now.getDate()
  const rng = seededRng(seed + 444)

  const vessels = [
    { name: 'MS Bratislava', type: 'cargo', flag: '🇸🇰', direction: 'upstream' as const, from: 'Budapest', to: 'Bratislava' },
    { name: 'Viking Egil', type: 'cruise', flag: '🇨🇭', direction: 'downstream' as const, from: 'Passau', to: 'Budapest' },
    { name: 'TMS Dunajtrans', type: 'tanker', flag: '🇸🇰', direction: 'upstream' as const, from: 'Komárno', to: 'Bratislava' },
    { name: 'Amadeus Silver', type: 'cruise', flag: '🇦🇹', direction: 'downstream' as const, from: 'Vienna', to: 'Budapest' },
    { name: 'MV Zemun', type: 'cargo', flag: '🇷🇸', direction: 'upstream' as const, from: 'Belgrade', to: 'Vienna' },
    { name: 'A-Rosa Donna', type: 'cruise', flag: '🇩🇪', direction: 'downstream' as const, from: 'Regensburg', to: 'Budapest' },
    { name: 'Cargo Danube IV', type: 'cargo', flag: '🇭🇺', direction: 'downstream' as const, from: 'Bratislava', to: 'Komárno' },
    { name: 'Twin City Liner', type: 'ferry', flag: '🇦🇹', direction: 'upstream' as const, from: 'Vienna', to: 'Bratislava' },
  ]

  const tracked = vessels.map(v => {
    const kmFromBA = Math.floor(rng() * 60)
    const speed = v.type === 'cruise' ? 15 + rng() * 5 : v.type === 'ferry' ? 30 + rng() * 10 : 10 + rng() * 8
    const eta = kmFromBA > 0 ? Math.floor((kmFromBA / speed) * 60) : 0
    return {
      ...v,
      speed: +speed.toFixed(1),
      kmFromBA,
      position: kmFromBA <= 5 ? 'V prístave BA' : `${kmFromBA} km ${v.direction === 'upstream' ? 'JV' : 'SZ'} od BA`,
      eta: eta > 0 ? `~${eta} min` : 'V prístave',
      cargo: v.type === 'cargo' ? ['uhlie', 'obilie', 'kontajnery', 'ropa', 'štrk'][Math.floor(rng() * 5)] : null,
      passengers: v.type === 'cruise' ? Math.floor(100 + rng() * 200) : v.type === 'ferry' ? Math.floor(20 + rng() * 80) : null,
    }
  })

  const waterLevel = +(150 + rng() * 400).toFixed(0)
  const flowRate = +(1500 + rng() * 1500).toFixed(0)
  const waterTemp = +(8 + rng() * 12).toFixed(1)

  return NextResponse.json({
    vessels: tracked,
    riverData: {
      waterLevel: +waterLevel,
      flowRate: +flowRate,
      waterTemp: +waterTemp,
      navigation: waterLevel > 200 ? 'open' : 'restricted',
    },
    stats: {
      totalVessels: tracked.length,
      cargo: tracked.filter(v => v.type === 'cargo').length,
      cruise: tracked.filter(v => v.type === 'cruise').length,
      ferry: tracked.filter(v => v.type === 'ferry').length,
    },
    timestamp: Date.now(),
  })
}
