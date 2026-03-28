import { NextResponse } from 'next/server'

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

async function fetchAlzaDeals(): Promise<Deal[]> {
  const deals: Deal[] = []
  // Try Alza RSS feed first (product feed / deals)
  const urls = [
    'https://www.alza.sk/Services/RSSService.ashx?type=visual',
    'https://www.alza.sk/Services/RSSService.ashx',
  ]
  for (const url of urls) {
    if (deals.length > 0) break
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml, */*' },
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) continue
      const xml = await res.text()
      const items = xml.split(/<item[ >]/).slice(1, 10)
      for (const item of items) {
        const title = (item.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim()
        const link = (item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1] ?? '').trim()
        const desc = (item.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        const priceMatch = desc.match(/(\d[\d\s,.]*)\s*€/) ?? desc.match(/cena[:\s]*(\d[\d\s,.]*)/i)
        const discMatch = desc.match(/-(\d+)\s*%/) ?? desc.match(/zľava[:\s]*(\d+)/i)
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
    } catch { /* try next */ }
  }

  // Fallback: scrape main page for product tiles
  if (deals.length === 0) {
    try {
      const res = await fetch('https://www.alza.sk/', {
        cache: 'no-store',
        headers: { 'User-Agent': UA, Accept: 'text/html' },
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        const html = await res.text()
        // Extract product titles + prices from JSON-LD or meta tags
        const ldMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) ?? []
        for (const ld of ldMatch) {
          try {
            const json = JSON.parse(ld.replace(/<\/?script[^>]*>/gi, ''))
            const items = json.itemListElement ?? (Array.isArray(json) ? json : [json])
            for (const it of items.slice(0, 8)) {
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
      }
    } catch { /* ignore */ }
  }
  return deals.slice(0, 6)
}

async function fetchHeurekaDeals(): Promise<Deal[]> {
  const deals: Deal[] = []
  // Try Heureka popular/best products
  const urls = [
    'https://www.heureka.sk/rss/top-produkty/',
    'https://www.heureka.sk/rss/',
  ]
  for (const url of urls) {
    if (deals.length > 0) break
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml, */*' },
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) continue
      const xml = await res.text()
      const items = xml.split(/<item[ >]/).slice(1, 10)
      for (const item of items) {
        const title = (item.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim()
        const link = (item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1] ?? '').trim()
        const desc = (item.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        const priceMatch = desc.match(/(\d[\d\s,.]*)\s*€/) ?? desc.match(/od\s*(\d[\d\s,.]*)/i)
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

  // Fallback: scrape Heureka main page
  if (deals.length === 0) {
    try {
      const res = await fetch('https://www.heureka.sk/', {
        cache: 'no-store',
        headers: { 'User-Agent': UA, Accept: 'text/html' },
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        const html = await res.text()
        // Look for product links with titles
        const productLinks: RegExpExecArray[] = []
        const linkRe = /<a[^>]*href="(https:\/\/[^"]*heureka\.sk\/[^"]*)"[^>]*title="([^"]+)"/gi
        let m: RegExpExecArray | null
        while ((m = linkRe.exec(html)) !== null) productLinks.push(m)
        for (const pm of productLinks.slice(0, 6)) {
          const priceContext = html.slice(html.indexOf(pm[0]), html.indexOf(pm[0]) + 300)
          const priceMatch = priceContext.match(/(\d[\d\s,.]*)\s*€/)
          deals.push({
            title: pm[2].slice(0, 100),
            price: priceMatch ? `${priceMatch[1].trim()} €` : '',
            store: 'Heureka.sk',
            link: pm[1],
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
