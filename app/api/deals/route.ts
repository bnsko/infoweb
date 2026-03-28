import { NextResponse } from 'next/server'
import { XMLParser } from 'fast-xml-parser'

export const dynamic = 'force-dynamic'

interface Deal {
  title: string
  price: string
  originalPrice?: string
  discount?: string
  store: string
  link: string
}

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

async function fetchAlzaDeals(): Promise<Deal[]> {
  const deals: Deal[] = []
  try {
    // Alza.sk XML product feed
    const res = await fetch('https://www.alza.sk/Services/RSSService.ashx', {
      cache: 'no-store',
      headers: { 'User-Agent': UA, Accept: 'text/xml, application/xml, */*' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error('Alza RSS failed')
    const xml = await res.text()
    const parsed = parser.parse(xml)
    const items = parsed?.rss?.channel?.item ?? []
    const arr = Array.isArray(items) ? items : [items]
    for (const item of arr.slice(0, 8)) {
      const title = (item.title?.['#text'] ?? item.title ?? '').toString().trim()
      const link = (item.link?.['#text'] ?? item.link ?? '').toString().trim()
      const desc = (item.description?.['#text'] ?? item.description ?? '').toString()
      const priceMatch = desc.match(/(\d[\d\s,.]*)\s*€/) ?? desc.match(/(\d[\d\s,.]*)\s*Kč/)
      const discMatch = desc.match(/-(\d+)\s*%/) ?? title.match(/-(\d+)\s*%/)
      if (title) {
        deals.push({
          title: title.slice(0, 100),
          price: priceMatch ? `${priceMatch[1].trim()} €` : '',
          discount: discMatch ? `-${discMatch[1]}%` : undefined,
          store: 'Alza.sk',
          link: link || 'https://www.alza.sk',
        })
      }
    }
  } catch { /* ignore */ }

  // Fallback: Alza akcie page scraping
  if (deals.length === 0) {
    try {
      const res = await fetch('https://www.alza.sk/akce', {
        cache: 'no-store',
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        const html = await res.text()
        // Extract from JSON-LD
        const ldBlocks = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) ?? []
        for (const ld of ldBlocks) {
          try {
            const json = JSON.parse(ld.replace(/<\/?script[^>]*>/gi, ''))
            const items = json.itemListElement ?? (Array.isArray(json) ? json : [json])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const it of items.slice(0, 10)) {
              const item = it.item ?? it
              if (item.name && item.offers?.price) {
                deals.push({
                  title: String(item.name).slice(0, 100),
                  price: `${item.offers.price} €`,
                  store: 'Alza.sk',
                  link: item.url ?? 'https://www.alza.sk',
                })
              }
            }
          } catch { /* ignore bad JSON-LD */ }
        }
        // Fallback: product links from HTML
        if (deals.length === 0) {
          const productRe = /<a[^>]*href="(\/[^"]*\.htm[l]?)"[^>]*>\s*<img[^>]*alt="([^"]+)"/gi
          let m: RegExpExecArray | null
          while ((m = productRe.exec(html)) !== null && deals.length < 8) {
            deals.push({
              title: m[2].slice(0, 100),
              price: '',
              store: 'Alza.sk',
              link: `https://www.alza.sk${m[1]}`,
            })
          }
        }
      }
    } catch { /* ignore */ }
  }
  return deals.slice(0, 6)
}

async function fetchHeurekaDeals(): Promise<Deal[]> {
  const deals: Deal[] = []
  // Try Heureka RSS
  const urls = [
    'https://www.heureka.sk/rss/top-produkty/',
    'https://www.heureka.sk/rss/',
  ]
  for (const url of urls) {
    if (deals.length > 0) break
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { 'User-Agent': UA, Accept: 'text/xml, application/xml, */*' },
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) continue
      const xml = await res.text()
      if (!xml.includes('<item')) continue
      const parsed = parser.parse(xml)
      const items = parsed?.rss?.channel?.item ?? []
      const arr = Array.isArray(items) ? items : [items]
      for (const item of arr.slice(0, 8)) {
        const title = (item.title?.['#text'] ?? item.title ?? '').toString().trim()
        const link = (item.link?.['#text'] ?? item.link ?? '').toString().trim()
        const desc = (item.description?.['#text'] ?? item.description ?? '').toString()
        const priceMatch = desc.match(/(\d[\d\s,.]*)\s*€/)
        if (title) {
          deals.push({
            title: title.slice(0, 100),
            price: priceMatch ? `od ${priceMatch[1].trim()} €` : '',
            store: 'Heureka.sk',
            link: link || 'https://www.heureka.sk',
          })
        }
      }
    } catch { /* try next */ }
  }

  // Fallback: scrape Heureka main products
  if (deals.length === 0) {
    try {
      const res = await fetch('https://www.heureka.sk/', {
        cache: 'no-store',
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        const html = await res.text()
        const linkRe = /<a[^>]*href="(https:\/\/[^"]*heureka\.sk\/[^"]*)"[^>]*title="([^"]+)"/gi
        let m: RegExpExecArray | null
        while ((m = linkRe.exec(html)) !== null && deals.length < 6) {
          deals.push({
            title: m[2].slice(0, 100),
            price: '',
            store: 'Heureka.sk',
            link: m[1],
          })
        }
      }
    } catch { /* ignore */ }
  }
  return deals.slice(0, 6)
}

export async function GET() {
  const [alza, heureka] = await Promise.allSettled([fetchAlzaDeals(), fetchHeurekaDeals()])

  const deals: Deal[] = [
    ...(alza.status === 'fulfilled' ? alza.value : []),
    ...(heureka.status === 'fulfilled' ? heureka.value : []),
  ].slice(0, 12)

  return NextResponse.json({ deals, timestamp: Date.now() })
}
