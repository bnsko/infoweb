import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface SteamNewsItem {
  title: string; url: string; author: string; date: number; appid: number; feedlabel: string
}

export async function GET() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    const [featuredRes, newsRes] = await Promise.allSettled([
      fetch(
        'https://store.steampowered.com/api/featuredcategories?cc=sk&l=english',
        { cache: 'no-store', headers: { 'User-Agent': 'InfoSK-Dashboard/1.0' }, signal: controller.signal }
      ),
      // Steam news for popular games (CS2=730, Dota2=570, TF2=440, Hollow Knight=367520)
      fetch(
        'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=730&count=6&maxlength=300',
        { cache: 'no-store', headers: { 'User-Agent': 'InfoSK-Dashboard/1.0' }, signal: controller.signal }
      ),
    ])
    clearTimeout(timer)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let newReleases: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let topSellers: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let upcomingGames: any[] = []
    let deckPrice: { usd: string; eur: string } | null = null

    if (featuredRes.status === 'fulfilled' && featuredRes.value.ok) {
      const data = await featuredRes.value.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      newReleases = (data.new_releases?.items ?? []).slice(0, 10).map((g: any) => ({
        id: g.id, name: g.name, discountPercent: g.discount_percent ?? 0,
        originalPrice: g.original_price ? (g.original_price / 100).toFixed(2) : null,
        finalPrice: g.final_price ? (g.final_price / 100).toFixed(2) : 'Free',
        headerImage: g.header_image ?? null,
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      topSellers = (data.top_sellers?.items ?? []).slice(0, 10).map((g: any) => ({
        id: g.id, name: g.name, discountPercent: g.discount_percent ?? 0,
        originalPrice: g.original_price ? (g.original_price / 100).toFixed(2) : null,
        finalPrice: g.final_price ? (g.final_price / 100).toFixed(2) : 'Free',
        headerImage: g.header_image ?? null,
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      upcomingGames = (data.upcoming_games?.items ?? []).slice(0, 8).map((g: any) => ({
        id: g.id, name: g.name, releaseDate: g.release_date ?? null,
        headerImage: g.header_image ?? null,
        discountPercent: g.discount_percent ?? 0,
        finalPrice: g.final_price ? (g.final_price / 100).toFixed(2) : null,
      }))
      // Steam Deck bundle (appid 1675200 = Steam Deck)
      const deckItem = data.specials?.items?.find((g: any) => g.id === 1675200) ?? null
      if (deckItem) {
        deckPrice = {
          usd: (deckItem.final_price / 100).toFixed(2),
          eur: (deckItem.final_price / 100).toFixed(2),
        }
      }
    }

    let newsItems: SteamNewsItem[] = []
    if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
      const newsData = await newsRes.value.json()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      newsItems = (newsData.appnews?.newsitems ?? []).slice(0, 8).map((n: any) => ({
        title: n.title, url: n.url, author: n.author, date: n.date,
        appid: n.appid, feedlabel: n.feedlabel ?? 'Steam',
      }))
    }

    // Add static Steam Deck prices if not found
    if (!deckPrice) {
      deckPrice = { usd: '399.00', eur: '419.00' }
    }

    return NextResponse.json({ newReleases, topSellers, upcomingGames, newsItems, deckPrice })
  } catch (err) {
    clearTimeout(timer)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Steam fetch failed' },
      { status: 500 }
    )
  }
}
