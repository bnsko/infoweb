import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [wikipediaRes, githubRes, sunRes] = await Promise.allSettled([
    // Wikipedia: Most viewed articles today (Slovak Wikipedia)
    fetch('https://wikimedia.org/api/rest_v1/metrics/pageviews/top/sk.wikipedia/all-access/' +
      new Date(Date.now() - 86400000).toISOString().slice(0, 10).replace(/-/g, '/'),
      { signal: AbortSignal.timeout(5000), next: { revalidate: 3600 } }
    ),
    // GitHub trending (public API - events count)
    fetch('https://api.github.com/events?per_page=1', {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 600 },
      headers: { Accept: 'application/vnd.github.v3+json' },
    }),
    // Sun data for Bratislava
    fetch('https://api.open-meteo.com/v1/forecast?latitude=48.1486&longitude=17.1077&daily=sunrise,sunset,daylight_duration&timezone=Europe/Bratislava&forecast_days=1', {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 3600 },
    }),
  ])

  // Wikipedia top SK articles
  let wikiTopArticles: { title: string; views: number }[] = []
  if (wikipediaRes.status === 'fulfilled' && wikipediaRes.value.ok) {
    try {
      const j = await wikipediaRes.value.json()
      const articles = (j.items?.[0]?.articles ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((a: any) => a.article !== 'Hlavná_stránka' && !a.article.startsWith('Špeciálne:'))
        .slice(0, 5)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((a: any) => ({ title: a.article.replace(/_/g, ' '), views: a.views }))
      wikiTopArticles = articles
    } catch { /* ignore */ }
  }

  // Sun data
  let sunData = { sunrise: '', sunset: '', daylightMinutes: 0 }
  if (sunRes.status === 'fulfilled' && sunRes.value.ok) {
    try {
      const j = await sunRes.value.json()
      sunData = {
        sunrise: j.daily?.sunrise?.[0]?.split('T')[1] ?? '',
        sunset: j.daily?.sunset?.[0]?.split('T')[1] ?? '',
        daylightMinutes: Math.round((j.daily?.daylight_duration?.[0] ?? 0) / 60),
      }
    } catch { /* ignore */ }
  }

  // Internet stats (WorldOMeter-style calculations)
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const secondsToday = (now.getTime() - startOfDay.getTime()) / 1000

  const internetStats = {
    emailsSent: Math.round(secondsToday * 3_800_000 / 86400), // ~330B/day
    googleSearches: Math.round(secondsToday * 99_000 / 86400 * 1000), // ~8.5B/day
    tweetsToday: Math.round(secondsToday * 6_500 / 86400 * 1000), // ~500M/day
    websitesHacked: Math.round(secondsToday * 30000 / 86400), // ~30k/day
  }

  // Slovakia-related calculations
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const yearProgress = ((now.getTime() - yearStart.getTime()) / (365.25 * 86400000)) * 100

  return NextResponse.json({
    wikiTopArticles,
    sunData,
    internetStats,
    yearProgress: Math.round(yearProgress * 100) / 100,
    timestamp: Date.now(),
  })
}
