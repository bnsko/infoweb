import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang') || 'sk'
  const date = searchParams.get('date') || ''
  const days = Math.min(parseInt(searchParams.get('days') || '1', 10) || 1, 7)

  if (!date || !/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
    return NextResponse.json({ items: [] })
  }

  const allowedLangs = ['sk', 'en', 'cs', 'de']
  const safeLang = allowedLangs.includes(lang) ? lang : 'sk'
  const headers = { 'User-Agent': 'InfowebSK/1.0' }

  try {
    if (days === 1) {
      const res = await fetch(
        `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${safeLang}.wikipedia/all-access/${date}`,
        { headers, next: { revalidate: 600 } }
      )
      if (!res.ok) return NextResponse.json({ items: [] })
      return NextResponse.json(await res.json())
    }

    // Aggregate multiple days
    const [y, m, d] = date.split('/').map(Number)
    const baseDate = new Date(y, m - 1, d)
    const fetches = Array.from({ length: days }, (_, i) => {
      const dt = new Date(baseDate)
      dt.setDate(dt.getDate() - i)
      const ds = `${dt.getFullYear()}/${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`
      return fetch(
        `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${safeLang}.wikipedia/all-access/${ds}`,
        { headers, next: { revalidate: 3600 } }
      ).then(r => r.ok ? r.json() : null).catch(() => null)
    })

    const results = await Promise.all(fetches)
    const viewMap = new Map<string, number>()
    for (const result of results) {
      if (!result?.items?.[0]?.articles) continue
      for (const a of result.items[0].articles) {
        viewMap.set(a.article, (viewMap.get(a.article) || 0) + a.views)
      }
    }

    const articles = Array.from(viewMap.entries())
      .map(([article, views], i) => ({ article, views, rank: i + 1 }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 50)
      .map((a, i) => ({ ...a, rank: i + 1 }))

    return NextResponse.json({ items: [{ articles }] })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
