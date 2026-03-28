import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Deal {
  title: string
  price: string
  originalPrice?: string
  discount?: string
  store: string
  link: string
  image?: string
}

async function fetchAlzaDeals(): Promise<Deal[]> {
  const deals: Deal[] = []
  try {
    const res = await fetch('https://www.alza.sk/top-produkty', {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const html = await res.text()

    // Parse product blocks
    const blocks = html.match(/<div[^>]*class="[^"]*browsingitem[^"]*"[\s\S]*?<\/div>\s*<\/div>/g) ?? []
    for (const block of blocks.slice(0, 8)) {
      const titleMatch = block.match(/<a[^>]*class="[^"]*name[^"]*"[^>]*>([\s\S]*?)<\/a>/)
      const priceMatch = block.match(/<span[^>]*class="[^"]*price-box__price[^"]*"[^>]*>([\s\S]*?)<\/span>/)
      const origMatch = block.match(/<span[^>]*class="[^"]*price-box__compare-price[^"]*"[^>]*>([\s\S]*?)<\/span>/)
      const linkMatch = block.match(/<a[^>]*href="([^"]*)"[^>]*class="[^"]*name/)
      const discMatch = block.match(/-(\d+)\s*%/)

      const title = titleMatch?.[1]?.replace(/<[^>]+>/g, '').trim() ?? ''
      const price = priceMatch?.[1]?.replace(/<[^>]+>/g, '').trim() ?? ''

      if (title && price) {
        deals.push({
          title,
          price,
          originalPrice: origMatch?.[1]?.replace(/<[^>]+>/g, '').trim(),
          discount: discMatch?.[1] ? `-${discMatch[1]}%` : undefined,
          store: 'Alza.sk',
          link: linkMatch?.[1] ? `https://www.alza.sk${linkMatch[1]}` : 'https://www.alza.sk',
        })
      }
    }
  } catch { /* ignore */ }
  return deals
}

async function fetchHeurekaDeals(): Promise<Deal[]> {
  const deals: Deal[] = []
  try {
    const res = await fetch('https://www.heureka.sk/?t=deals', {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const html = await res.text()

    // Parse deal blocks
    const blocks = html.match(/<div[^>]*class="[^"]*deal[^"]*"[\s\S]*?<\/div>\s*<\/div>/gi) ?? []
    for (const block of blocks.slice(0, 8)) {
      const titleMatch = block.match(/<a[^>]*>([\s\S]*?)<\/a>/)
      const priceMatch = block.match(/(\d[\d\s,.]*\s*€)/)
      const discMatch = block.match(/-(\d+)\s*%/)
      const linkMatch = block.match(/<a[^>]*href="([^"]*)"/)

      const title = titleMatch?.[1]?.replace(/<[^>]+>/g, '').trim() ?? ''
      const price = priceMatch?.[1]?.trim() ?? ''

      if (title) {
        deals.push({
          title: title.slice(0, 80),
          price,
          discount: discMatch?.[1] ? `-${discMatch[1]}%` : undefined,
          store: 'Heureka.sk',
          link: linkMatch?.[1] ?? 'https://www.heureka.sk',
        })
      }
    }
  } catch { /* ignore */ }
  return deals
}

export async function GET() {
  const [alza, heureka] = await Promise.allSettled([fetchAlzaDeals(), fetchHeurekaDeals()])

  const deals: Deal[] = [
    ...(alza.status === 'fulfilled' ? alza.value : []),
    ...(heureka.status === 'fulfilled' ? heureka.value : []),
  ].slice(0, 12)

  return NextResponse.json({ deals, timestamp: Date.now() })
}
