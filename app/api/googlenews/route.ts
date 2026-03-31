import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch('https://news.google.com/rss/search?q=when:1d&hl=sk&gl=SK&ceid=SK:sk', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)' },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error('Google News fetch failed')
    const xml = await res.text()

    const items: { title: string; link: string; source: string; pubDate: string }[] = []
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []

    for (const item of itemMatches.slice(0, 20)) {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? item.match(/<title>(.*?)<\/title>/)?.[1] ?? ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? ''
      const source = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] ?? ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''
      if (title) items.push({ title: title.trim(), link, source, pubDate })
    }

    return NextResponse.json({ items, timestamp: Date.now() })
  } catch {
    return NextResponse.json({ items: [], timestamp: Date.now() })
  }
}
