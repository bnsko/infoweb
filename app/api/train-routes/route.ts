import { NextResponse } from 'next/server'

export const revalidate = 1800

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const ROUTES = [
  { id: 'BA-KE', from: 'Bratislava', to: 'Košice', distance: 401, durationMin: 235 },
  { id: 'BA-BB', from: 'Bratislava', to: 'Banská Bystrica', distance: 218, durationMin: 140 },
  { id: 'BA-PP', from: 'Bratislava', to: 'Poprad', distance: 336, durationMin: 200 },
  { id: 'BA-ZA', from: 'Bratislava', to: 'Žilina', distance: 197, durationMin: 120 },
  { id: 'KE-PP', from: 'Košice', to: 'Poprad', distance: 131, durationMin: 85 },
  { id: 'BA-PO', from: 'Bratislava', to: 'Prešov', distance: 418, durationMin: 250 },
]

const OPERATORS = ['RegioJet', 'Leo Express', 'ZSSK']

export async function GET() {
  const now = new Date()
  const hourSeed = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours()
  const rng = seededRng(hourSeed + 303)

  const departures = ROUTES.flatMap(route =>
    OPERATORS.slice(0, 2 + Math.floor(rng() * 2)).map((op, i) => {
      const basePrice = route.distance < 200 ? 8 : route.distance < 350 ? 14 : 20
      const price = +(basePrice * (0.7 + rng() * 0.6)).toFixed(2)
      const occupancy = Math.floor(20 + rng() * 75)
      const depHour = 6 + Math.floor(rng() * 15)
      const depMin = Math.floor(rng() * 4) * 15
      const depTime = `${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`
      const arrTime = (() => {
        const total = depHour * 60 + depMin + route.durationMin
        return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
      })()
      return {
        id: `${route.id}-${op}-${i}`,
        operator: op,
        from: route.from,
        to: route.to,
        distance: route.distance,
        departureTime: depTime,
        arrivalTime: arrTime,
        durationMin: route.durationMin,
        price,
        occupancyPct: occupancy,
        occupancyStatus: occupancy > 80 ? 'plný' : occupancy > 50 ? 'obsadený' : 'voľný',
        seatsLeft: Math.floor((100 - occupancy) * 0.8),
        hasWifi: op !== 'ZSSK',
        hasBistro: op === 'RegioJet' || (op === 'Leo Express' && rng() > 0.4),
        bookingUrl: op === 'RegioJet' ? `https://www.regiojet.sk/spojenia/?fromLocationId=10204012&fromLocationType=STATION&toLocationId=10204001&toLocationType=STATION`
          : op === 'Leo Express' ? `https://www.leoexpress.com/sk`
          : `https://www.zssk.sk`,
        delayMin: rng() > 0.85 ? Math.floor(2 + rng() * 25) : 0,
      }
    })
  ).sort((a, b) => a.price - b.price)

  const priceStats = {
    cheapestToday: Math.min(...departures.map(d => d.price)),
    avgPrice: +(departures.reduce((s, d) => s + d.price, 0) / departures.length).toFixed(2),
    mostOccupiedRoute: departures.sort((a, b) => b.occupancyPct - a.occupancyPct)[0]?.from + ' → ' + departures[0]?.to,
  }

  return NextResponse.json({
    departures,
    priceStats,
    updatedAt: now.toISOString(),
  })
}
