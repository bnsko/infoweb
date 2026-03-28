import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface SteamNewsItem {
  title: string; url: string; author: string; date: number; appid: number; feedlabel: string
}

export async function GET() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    const [featuredRes, newsRes, mostPlayedRes] = await Promise.allSettled([
      fetch(
        'https://store.steampowered.com/api/featuredcategories?cc=sk&l=english',
        { cache: 'no-store', headers: { 'User-Agent': 'InfoSK-Dashboard/1.0' }, signal: controller.signal }
      ),
      // Steam news for multiple popular games
      fetch(
        'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=730&count=4&maxlength=300',
        { cache: 'no-store', headers: { 'User-Agent': 'InfoSK-Dashboard/1.0' }, signal: controller.signal }
      ),
      // Most played (SteamCharts data via Steam API – top games by player count)
      fetch(
        'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/',
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

    // Most played games
    let mostPlayed: { appid: number; name: string; currentPlayers: number; peakToday: number }[] = []
    if (mostPlayedRes.status === 'fulfilled' && mostPlayedRes.value.ok) {
      try {
        const mpData = await mostPlayedRes.value.json()
        const ranks = mpData?.response?.ranks ?? []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mostPlayed = ranks.slice(0, 12).map((r: any) => ({
          appid: r.appid,
          name: r.name ?? `App ${r.appid}`,
          currentPlayers: r.concurrent_in_game ?? 0,
          peakToday: r.peak_in_game ?? 0,
        }))
      } catch { /* ignore */ }
    }

    // Fallback most played
    if (mostPlayed.length === 0) {
      mostPlayed = [
        { appid: 730, name: 'Counter-Strike 2', currentPlayers: 850000, peakToday: 1200000 },
        { appid: 570, name: 'Dota 2', currentPlayers: 450000, peakToday: 700000 },
        { appid: 578080, name: 'PUBG: BATTLEGROUNDS', currentPlayers: 350000, peakToday: 500000 },
        { appid: 440, name: 'Team Fortress 2', currentPlayers: 120000, peakToday: 180000 },
        { appid: 1172470, name: 'Apex Legends', currentPlayers: 200000, peakToday: 300000 },
        { appid: 252490, name: 'Rust', currentPlayers: 80000, peakToday: 130000 },
        { appid: 1623730, name: 'Palworld', currentPlayers: 50000, peakToday: 90000 },
        { appid: 271590, name: 'Grand Theft Auto V', currentPlayers: 110000, peakToday: 170000 },
      ]
    }

    // Steam Deck price history (static curated data)
    const deckPriceHistory = [
      { date: '2022-02', model: 'LCD 64GB', priceEur: 419 },
      { date: '2022-02', model: 'LCD 256GB', priceEur: 549 },
      { date: '2022-02', model: 'LCD 512GB', priceEur: 679 },
      { date: '2023-11', model: 'OLED 512GB', priceEur: 569 },
      { date: '2023-11', model: 'OLED 1TB', priceEur: 679 },
      { date: '2024-11', model: 'OLED LE 1TB', priceEur: 679 },
    ]

    return NextResponse.json({ newReleases, topSellers, upcomingGames, newsItems, deckPrice, mostPlayed, deckPriceHistory })
  } catch (err) {
    clearTimeout(timer)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Steam fetch failed' },
      { status: 500 }
    )
  }
}
