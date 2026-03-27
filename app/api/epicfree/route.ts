import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    // Use the GraphQL endpoint which is more reliable
    const graphqlUrl = 'https://graphql.epicgames.com/graphql'
    const query = {
      query: `query promotionsQuery { Catalog { searchStore(category: "freegames", count: 20, sortBy: "effectiveDate", sortDir: "asc") { elements { title description keyImages { type url } promotions { promotionalOffers { promotionalOffers { startDate endDate discountSetting { discountPercentage } } } upcomingPromotionalOffers { promotionalOffers { startDate endDate discountSetting { discountPercentage } } } } price { totalPrice { fmtPrice { originalPrice } } } productSlug urlSlug } } }`,
    }

    let elements: unknown[] = []
    try {
      const gqlRes = await fetch(graphqlUrl, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
        body: JSON.stringify(query),
        signal: controller.signal,
      })
      if (gqlRes.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gqlData: any = await gqlRes.json()
        elements = gqlData?.data?.Catalog?.searchStore?.elements ?? []
      }
    } catch { /* fallback below */ }

    // Fallback to REST API
    if (elements.length === 0) {
      for (const country of ['SK', 'US']) {
        try {
          const res = await fetch(
            `https://store-site-backend-official.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=${country}&allowCountries=${country}`,
            { cache: 'no-store', headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }, signal: controller.signal }
          )
          if (res.ok) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const d: any = await res.json()
            elements = d?.data?.Catalog?.searchStore?.elements ?? []
            if (elements.length > 0) break
          }
        } catch { /* try next */ }
      }
    }
    clearTimeout(timer)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const games = (elements as any[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((g: any) => {
        const promos = g.promotions?.promotionalOffers ?? []
        const upcoming = g.promotions?.upcomingPromotionalOffers ?? []
        return promos.length > 0 || upcoming.length > 0
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((g: any) => {
        const promos = g.promotions?.promotionalOffers?.[0]?.promotionalOffers ?? []
        const upcoming = g.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers ?? []
        const activePromo = promos[0] ?? upcoming[0]
        const isFreeNow = promos.length > 0 && promos[0]?.discountSetting?.discountPercentage === 100
        const image = g.keyImages?.find((k: { type: string }) => k.type === 'OfferImageWide' || k.type === 'DieselStoreFrontWide' || k.type === 'Thumbnail')

        return {
          title: g.title,
          description: (g.description ?? '').slice(0, 150),
          isFreeNow,
          startDate: activePromo?.startDate ?? null,
          endDate: activePromo?.endDate ?? null,
          originalPrice: g.price?.totalPrice?.fmtPrice?.originalPrice ?? null,
          image: image?.url ?? null,
          slug: g.productSlug ?? g.urlSlug ?? null,
        }
      })

    return NextResponse.json({ games })
  } catch (err) {
    clearTimeout(timer)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Epic fetch failed' },
      { status: 500 }
    )
  }
}
