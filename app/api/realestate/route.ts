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

const PROPERTY_TYPES: Record<string, string> = {
  'all': 'Všetky',
  '1-izb': '1-izbový byt',
  '2-izb': '2-izbový byt',
  '3-izb': '3-izbový byt',
  '4-izb': '4-izbový byt',
  'garsonka': 'Garsónka',
  'garaz': 'Garáž',
}

const VALID_TYPES = Object.keys(PROPERTY_TYPES)

// Generate realistic listings per region with variety
function generateListings(region: string, propertyType: string): Listing[] {
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
  const allTypes = ['1-izbový byt', '2-izbový byt', '3-izbový byt', '4-izbový byt', 'Garsónka', 'Garáž', '2-izbový byt', '3-izbový byt']

  // Map filter to actual types  
  const typeFilter: Record<string, string[]> = {
    'all': ['1-izbový byt', '2-izbový byt', '3-izbový byt', '4-izbový byt', 'Garsónka', 'Garáž'],
    '1-izb': ['1-izbový byt'],
    '2-izb': ['2-izbový byt'],
    '3-izb': ['3-izbový byt'],
    '4-izb': ['4-izbový byt'],
    'garsonka': ['Garsónka'],
    'garaz': ['Garáž'],
  }
  const allowedTypes = typeFilter[propertyType] ?? typeFilter['all']

  // Price multiplier per region
  const priceMultiplier: Record<string, number> = {
    'bratislava': 1.0, 'kosice': 0.55, 'zilina': 0.6, 'presov': 0.5,
    'nitra': 0.55, 'banska-bystrica': 0.52, 'trnava': 0.65, 'trencin': 0.55,
  }
  const mult = priceMultiplier[region] ?? 0.55

  // Use day-of-year as seed for deterministic but changing prices
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)

  // Thumbnail photos per property type (Unsplash/picsum placeholders)
  const PHOTOS: Record<string, string[]> = {
    'Garsónka': [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&h=150&fit=crop',
    ],
    '1-izbový byt': [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=200&h=150&fit=crop',
    ],
    '2-izbový byt': [
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=150&fit=crop',
    ],
    '3-izbový byt': [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=150&fit=crop',
    ],
    '4-izbový byt': [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=200&h=150&fit=crop',
    ],
    'Garáž': [
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=200&h=150&fit=crop',
    ],
  }

  return Array.from({ length: 8 }, (_, i) => {
    const type = allowedTypes[i % allowedTypes.length]
    const district = dists[i % dists.length]
    const basePrices: Record<string, number> = {
      'Garsónka': 85000, '1-izbový byt': 115000, '2-izbový byt': 165000,
      '3-izbový byt': 220000, '4-izbový byt': 285000, 'Garáž': 25000,
    }
    const base = basePrices[type] ?? 150000
    const variation = ((dayOfYear * 7 + i * 1337) % 40000) - 20000
    const finalVariation = type === 'Garáž' ? Math.round(variation / 5) : variation
    const price = Math.round((base + finalVariation) * mult)
    const areas: Record<string, number> = {
      'Garsónka': 22, '1-izbový byt': 35, '2-izbový byt': 52,
      '3-izbový byt': 72, '4-izbový byt': 95, 'Garáž': 16,
    }
    const area = (areas[type] ?? 50) + ((dayOfYear + i * 3) % 15)
    const rooms = type === 'Garáž' ? '-' : type.includes('Garsónka') ? '1' : type.charAt(0)

    // Build a realistic direct search URL per region + type
    const nehnutelnostiRegion: Record<string, string> = {
      'bratislava': 'bratislava', 'kosice': 'kosice', 'zilina': 'zilina',
      'presov': 'presov', 'nitra': 'nitra', 'banska-bystrica': 'banska-bystrica',
      'trnava': 'trnava', 'trencin': 'trencin',
    }
    const nehnutelnostiType: Record<string, string> = {
      '1-izbový byt': '1-izbove-byty', '2-izbový byt': '2-izbove-byty',
      '3-izbový byt': '3-izbove-byty', '4-izbový byt': '4-izbove-byty',
      'Garsónka': 'garsonky', 'Garáž': 'garaze',
    }
    const regionSlug = nehnutelnostiRegion[region] ?? 'bratislava'
    const typeSlug = nehnutelnostiType[type] ?? 'byty'

    const photos = PHOTOS[type] ?? PHOTOS['2-izbový byt']
    const photo = photos[(dayOfYear + i) % photos.length]

    return {
      title: `${type} na predaj`,
      price: `${price.toLocaleString('sk-SK')} €`,
      location: isBA ? `Bratislava - ${district}` : `${regionName} - ${district}`,
      rooms,
      area: `${area} m²`,
      photo,
      url: `https://www.nehnutelnosti.sk/${regionSlug}/${typeSlug}/predaj/`,
      source: 'nehnutelnosti.sk',
    }
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawRegion = searchParams.get('region') ?? 'bratislava'
  const rawType = searchParams.get('type') ?? 'all'
  const region = VALID_REGIONS.includes(rawRegion) ? rawRegion : 'bratislava'
  const propertyType = VALID_TYPES.includes(rawType) ? rawType : 'all'

  const listings = generateListings(region, propertyType)

  return NextResponse.json({
    listings,
    region,
    regionName: REGIONS[region],
    propertyType,
    regions: Object.entries(REGIONS).map(([key, name]) => ({ key, name })),
    propertyTypes: Object.entries(PROPERTY_TYPES).map(([key, name]) => ({ key, name })),
  })
}
