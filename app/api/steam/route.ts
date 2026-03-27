import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    // Steam new releases via Steam's unofficial API
    const res = await fetch(
      'https://store.steampowered.com/api/featuredcategories?cc=sk&l=english',
      {
        cache: 'no-store',
        headers: { 'User-Agent': 'InfoSK-Dashboard/1.0' },
        signal: controller.signal,
      }
    )
    clearTimeout(timer)
    if (!res.ok) throw new Error(`Steam API ${res.status}`)
    const data = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newReleases = (data.new_releases?.items ?? []).slice(0, 10).map((g: any) => ({
      id: g.id,
      name: g.name,
      discountPercent: g.discount_percent ?? 0,
      originalPrice: g.original_price ? (g.original_price / 100).toFixed(2) : null,
      finalPrice: g.final_price ? (g.final_price / 100).toFixed(2) : 'Free',
      headerImage: g.header_image ?? null,
      largeCapsule: g.large_capsule_image ?? null,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topSellers = (data.top_sellers?.items ?? []).slice(0, 10).map((g: any) => ({
      id: g.id,
      name: g.name,
      discountPercent: g.discount_percent ?? 0,
      originalPrice: g.original_price ? (g.original_price / 100).toFixed(2) : null,
      finalPrice: g.final_price ? (g.final_price / 100).toFixed(2) : 'Free',
      headerImage: g.header_image ?? null,
    }))

    return NextResponse.json({ newReleases, topSellers })
  } catch (err) {
    clearTimeout(timer)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Steam fetch failed' },
      { status: 500 }
    )
  }
}
