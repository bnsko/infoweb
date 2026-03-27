import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Listing {
  title: string
  price: string
  location: string
  rooms: string
  area: string
  url: string
}

export async function GET() {
  // Use Sreality API (public JSON endpoint for Slovak real estate)
  try {
    const res = await fetch(
      'https://www.sreality.cz/api/cs/v2/estates?' +
      'category_main_cb=1&category_type_cb=1&' + // 1=byty, 1=predaj
      'locality_region_id=14&' + // Bratislava region
      'per_page=8&page=1&' +
      'tms=' + Date.now(),
      {
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 1800 },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
      }
    )

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listings: Listing[] = (json._embedded?.estates ?? []).map((e: any) => {
      const name = e.name ?? 'Byt'
      const localityStr = e.locality ?? ''
      const priceVal = e.price_czk?.value_raw ?? e.price ?? 0
      const priceFormatted = priceVal > 0 ? `${Math.round(priceVal).toLocaleString('sk-SK')} €` : 'Cena na vyžiadanie'
      const hashId = e.hash_id ?? ''

      return {
        title: name,
        price: priceFormatted,
        location: localityStr,
        rooms: '',
        area: '',
        url: hashId ? `https://www.sreality.cz/detail/prodej/byt/${hashId}` : '#',
      }
    })

    return NextResponse.json({ listings })
  } catch {
    // Fallback: generate sample data with realistic Bratislava listings
    const districts = ['Staré Mesto', 'Ružinov', 'Petržalka', 'Nové Mesto', 'Karlova Ves', 'Dúbravka', 'Rača', 'Vrakuňa']
    const types = ['1-izbový byt', '2-izbový byt', '3-izbový byt', '4-izbový byt', 'Garsónka']

    const listings: Listing[] = Array.from({ length: 6 }, (_, i) => {
      const type = types[i % types.length]
      const district = districts[i % districts.length]
      const base = [89000, 149000, 195000, 239000, 65000]
      const price = base[i % base.length] + Math.round(Math.random() * 20000)

      return {
        title: `${type} na predaj`,
        price: `${price.toLocaleString('sk-SK')} €`,
        location: `Bratislava - ${district}`,
        rooms: type.includes('Garsónka') ? '1' : type.charAt(0),
        area: `${30 + i * 12 + Math.round(Math.random() * 10)} m²`,
        url: '#',
      }
    })

    return NextResponse.json({ listings, fallback: true })
  }
}
