import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang') || 'sk'
  const date = searchParams.get('date') || ''

  if (!date || !/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
    return NextResponse.json({ items: [] })
  }

  const allowedLangs = ['sk', 'en', 'cs', 'de']
  const safeLang = allowedLangs.includes(lang) ? lang : 'sk'

  try {
    const res = await fetch(
      `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${safeLang}.wikipedia/all-access/${date}`,
      { headers: { 'User-Agent': 'InfowebSK/1.0' }, next: { revalidate: 600 } }
    )
    if (!res.ok) return NextResponse.json({ items: [] })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ items: [] })
  }
}
