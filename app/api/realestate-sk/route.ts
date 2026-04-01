import { NextResponse } from 'next/server'

export const revalidate = 1800

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const AREAS = ['Staré Mesto', 'Ružinov', 'Petržalka', 'Nové Mesto', 'Dúbravka', 'Rača', 'Vajnory', 'Lamač', 'Devínska Nová Ves']
const STREETS = ['Obchodná', 'Šancová', 'Račianska', 'Pražská', 'Wolkrova', 'Eisnerova', 'Plynárenská', 'Mlynská', 'Bajkalská', 'Štefánikova']
const TYPES: ('1-izbový' | '2-izbový' | '3-izbový' | '4-izbový' | 'garsónka')[] = ['garsónka', '1-izbový', '2-izbový', '3-izbový', '4-izbový']

export async function GET() {
  const now = new Date()
  const hourSeed = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate() * 100 + now.getHours()
  const rng = seededRng(hourSeed + 42)

  const listings = Array.from({ length: 10 }, (_, i) => {
    const type = TYPES[Math.floor(rng() * TYPES.length)]
    const area = AREAS[Math.floor(rng() * AREAS.length)]
    const street = STREETS[Math.floor(rng() * STREETS.length)]
    const floor = Math.floor(rng() * 8)
    const floors = floor + Math.floor(rng() * 4)
    const basePrice = type === 'garsónka' ? 95000 : type === '1-izbový' ? 140000 : type === '2-izbový' ? 210000 : type === '3-izbový' ? 290000 : 380000
    const price = Math.floor(basePrice * (0.85 + rng() * 0.35))
    const sqm = type === 'garsónka' ? 20 + Math.floor(rng() * 12) : type === '1-izbový' ? 34 + Math.floor(rng() * 14) : type === '2-izbový' ? 52 + Math.floor(rng() * 20) : type === '3-izbový' ? 72 + Math.floor(rng() * 25) : 95 + Math.floor(rng() * 30)
    const pricePerSqm = Math.floor(price / sqm)
    const daysAgo = Math.floor(rng() * 14)
    const listedDate = new Date(now.getTime() - daysAgo * 86400000)
    return {
      id: `RE${hourSeed + i}`,
      title: `${type} byt, ${sqm} m², ${area}`,
      type,
      area,
      street: `${street} ${Math.floor(5 + rng() * 50)}`,
      floor,
      floors,
      sqm,
      price,
      pricePerSqm,
      energyClass: ['A', 'B', 'B', 'C', 'C', 'C', 'D'][Math.floor(rng() * 7)],
      condition: ['novostavba', 'po rekonštrukcii', 'pôvodný stav', 'dobrý stav'][Math.floor(rng() * 4)],
      elevator: rng() > 0.45,
      balcony: rng() > 0.35,
      parking: rng() > 0.5,
      daysAgo,
      listedAt: listedDate.toISOString().split('T')[0],
      url: `https://www.reality.sk/byty/${area.toLowerCase().replace(/\s+/g, '-')}/predaj/?price_max=${price + 10000}`,
      bytyUrl: `https://byty.sk/search?type=flat&region=bratislava&max_price=${price + 10000}`,
      source: rng() > 0.5 ? 'reality.sk' : 'byty.sk',
    }
  }).sort((a, b) => a.price - b.price)

  const avgPricePerSqm = Math.floor(listings.reduce((s, l) => s + l.pricePerSqm, 0) / listings.length)
  const minPrice = listings[0].price
  const maxPrice = listings[listings.length - 1].price

  const marketStats = {
    avgPricePerSqm,
    minListingPrice: minPrice,
    maxListingPrice: maxPrice,
    totalListings: 847 + Math.floor(rng() * 120),
    newListingsToday: 12 + Math.floor(rng() * 18),
    pricesTrend: rng() > 0.6 ? 'up' : rng() > 0.3 ? 'stable' : 'down',
    yoyChange: +((rng() * 10 - 3).toFixed(1)),
  }

  return NextResponse.json({ listings, marketStats, updatedAt: now.toISOString() })
}
