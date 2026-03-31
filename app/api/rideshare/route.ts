import { NextResponse } from 'next/server'

export const revalidate = 300

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getHours() * 100 + now.getMinutes()
  const rng = seededRng(seed + now.getDate())

  const isRushHour = (now.getHours() >= 7 && now.getHours() <= 9) || (now.getHours() >= 16 && now.getHours() <= 19)
  const isNight = now.getHours() >= 23 || now.getHours() < 6

  const services = [
    { name: 'Bolt', icon: '⚡', color: '#34D186', basePrice: 3.5, baseSurge: 1.0, baseWait: 4, available: true },
    { name: 'Uber', icon: '🚘', color: '#000000', basePrice: 4.0, baseSurge: 1.0, baseWait: 5, available: true },
    { name: 'Hopin', icon: '🟢', color: '#00B140', basePrice: 3.8, baseSurge: 1.0, baseWait: 6, available: true },
    { name: 'Liftago', icon: '🔶', color: '#FF6B00', basePrice: 4.2, baseSurge: 1.0, baseWait: 7, available: true },
  ]

  const rides = services.map(s => {
    const surgeFactor = isRushHour ? 1.3 + rng() * 0.5 : isNight ? 1.5 + rng() * 0.3 : 1.0 + rng() * 0.2
    const wait = Math.max(2, Math.round(s.baseWait * (isRushHour ? 1.5 : isNight ? 2 : 1) + (rng() * 4 - 2)))
    const carsNearby = isNight ? Math.floor(rng() * 5) : Math.floor(5 + rng() * 15)
    return {
      name: s.name,
      icon: s.icon,
      color: s.color,
      estimatedPrice: (s.basePrice * surgeFactor).toFixed(2) + ' €',
      surge: Math.round(surgeFactor * 10) / 10,
      waitMinutes: wait,
      carsNearby,
      available: carsNearby > 0,
    }
  })

  const scooters = [
    { name: 'Bolt', icon: '⚡', color: '#34D186' },
    { name: 'Tier', icon: '🟦', color: '#69D2E7' },
    { name: 'Lime', icon: '🟩', color: '#32CD32' },
  ]

  const scooterData = scooters.map(s => ({
    ...s,
    available: Math.floor(rng() * 20) + (isNight ? 0 : 5),
    price: '0.15 €/min',
    unlockFee: '1.00 €',
    battery: Math.floor(40 + rng() * 60),
  }))

  return NextResponse.json({
    rides,
    scooters: scooterData,
    isRushHour,
    isNight,
    timestamp: Date.now(),
  })
}
