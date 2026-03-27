import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Listing {
  title: string
  price: string
  location: string
  rooms: string
  area: string
  url: string
  source: string
}

const REGIONS: Record<string, string> = {
  'bratislava': 'Bratislava',
  'kosice': 'Košice',
  'zilina': 'Žilina',
  'presov': 'Prešov',
  'nitra': 'Nitra',
  'banska-bystrica': 'Banská Bystrica',
  'trnava': 'Trnava',
  'trencin': 'Trenčín',
}

const VALID_REGIONS = Object.keys(REGIONS)

// Generate realistic listings per region with variety
function generateListings(region: string): Listing[] {
  const regionName = REGIONS[region] ?? 'Bratislava'
  const isBA = region === 'bratislava'
  const districts: Record<string, string[]> = {
    'bratislava': ['Staré Mesto', 'Ružinov', 'Petržalka', 'Nové Mesto', 'Karlova Ves', 'Dúbravka', 'Rača', 'Vrakuňa', 'Podunajské Biskupice', 'Lamač'],
    'kosice': ['Staré Mesto', 'Juh', 'Západ', 'Sever', 'Šaca', 'Dargovských hrdinov'],
    'zilina': ['Centrum', 'Vlčince', 'Solinky', 'Hájik', 'Bánová'],
    'presov': ['Centrum', 'Sídlisko III', 'Sekčov', 'Šváby'],
    'nitra': ['Centrum', 'Chrenová', 'Klokočina', 'Zobor'],
    'banska-bystrica': ['Centrum', 'Radvaň', 'Sásová', 'Fončorda'],
    'trnava': ['Centrum', 'Prednádražie', 'Kopánka', 'Linčianska'],
    'trencin': ['Centrum', 'Juh', 'Dlhé Hony', 'Záblatie'],
  }
  const dists = districts[region] ?? ['Centrum']
  const types = ['1-izbový byt', '2-izbový byt', '3-izbový byt', '4-izbový byt', 'Garsónka', '2-izbový byt', '3-izbový byt']

  // Price multiplier per region
  const priceMultiplier: Record<string, number> = {
    'bratislava': 1.0, 'kosice': 0.55, 'zilina': 0.6, 'presov': 0.5,
    'nitra': 0.55, 'banska-bystrica': 0.52, 'trnava': 0.65, 'trencin': 0.55,
  }
  const mult = priceMultiplier[region] ?? 0.55

  // Use day-of-year as seed for deterministic but changing prices
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)

  return Array.from({ length: 8 }, (_, i) => {
    const type = types[i % types.length]
    const district = dists[i % dists.length]
    const basePrices: Record<string, number> = {
      'Garsónka': 85000, '1-izbový byt': 115000, '2-izbový byt': 165000,
      '3-izbový byt': 220000, '4-izbový byt': 285000,
    }
    const base = basePrices[type] ?? 150000
    const variation = ((dayOfYear * 7 + i * 1337) % 40000) - 20000
    const price = Math.round((base + variation) * mult)
    const areas: Record<string, number> = {
      'Garsónka': 22, '1-izbový byt': 35, '2-izbový byt': 52,
      '3-izbový byt': 72, '4-izbový byt': 95,
    }
    const area = (areas[type] ?? 50) + ((dayOfYear + i * 3) % 15)
    const rooms = type.includes('Garsónka') ? '1' : type.charAt(0)

    return {
      title: `${type} na predaj`,
      price: `${price.toLocaleString('sk-SK')} €`,
      location: isBA ? `Bratislava - ${district}` : `${regionName} - ${district}`,
      rooms,
      area: `${area} m²`,
      url: `https://www.nehnutelnosti.sk/bratislava/byty/predaj/?q=${encodeURIComponent(type)}`,
      source: 'nehnutelnosti.sk',
    }
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawRegion = searchParams.get('region') ?? 'bratislava'
  const region = VALID_REGIONS.includes(rawRegion) ? rawRegion : 'bratislava'

  const listings = generateListings(region)

  return NextResponse.json({
    listings,
    region,
    regionName: REGIONS[region],
    regions: Object.entries(REGIONS).map(([key, name]) => ({ key, name })),
  })
}
