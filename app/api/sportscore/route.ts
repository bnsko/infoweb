import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    // Football (soccer) live scores from API-Football free tier via RapidAPI-like endpoint
    // Using football-data.org free tier instead
    const res = await fetch(
      'https://api.football-data.org/v4/matches?status=LIVE,IN_PLAY,PAUSED,FINISHED&limit=15',
      {
        cache: 'no-store',
        headers: {
          'X-Auth-Token': process.env.FOOTBALL_API_KEY ?? '3c1d6c9a3d5e4e3b8d4b6c1f2a3b4c5d',
          'User-Agent': 'InfoSK-Dashboard/1.0',
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timer)

    if (!res.ok) {
      // Fallback: try free ESPN API
      return await fetchESPNScores()
    }

    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matches = (data.matches ?? []).map((m: any) => ({
      id: m.id,
      competition: m.competition?.name ?? '',
      homeTeam: m.homeTeam?.shortName ?? m.homeTeam?.name ?? '',
      awayTeam: m.awayTeam?.shortName ?? m.awayTeam?.name ?? '',
      homeScore: m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? null,
      status: m.status,
      minute: m.minute ?? null,
      startTime: m.utcDate,
      homeCrest: m.homeTeam?.crest ?? null,
      awayCrest: m.awayTeam?.crest ?? null,
    }))

    return NextResponse.json({ matches, source: 'football-data.org' })
  } catch {
    clearTimeout(timer)
    return await fetchESPNScores()
  }
}

async function fetchESPNScores() {
  try {
    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
      {
        cache: 'no-store',
        headers: { 'User-Agent': 'InfoSK-Dashboard/1.0' },
        signal: AbortSignal.timeout(8000),
      }
    )
    if (!res.ok) throw new Error(`ESPN ${res.status}`)
    const data = await res.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matches = (data.events ?? []).slice(0, 15).map((ev: any) => {
      const comp = ev.competitions?.[0]
      const home = comp?.competitors?.find((c: { homeAway: string }) => c.homeAway === 'home')
      const away = comp?.competitors?.find((c: { homeAway: string }) => c.homeAway === 'away')
      return {
        id: ev.id,
        competition: data.leagues?.[0]?.name ?? 'Premier League',
        homeTeam: home?.team?.shortDisplayName ?? home?.team?.name ?? '',
        awayTeam: away?.team?.shortDisplayName ?? away?.team?.name ?? '',
        homeScore: home?.score ? Number(home.score) : null,
        awayScore: away?.score ? Number(away.score) : null,
        status: comp?.status?.type?.name ?? 'STATUS_SCHEDULED',
        minute: comp?.status?.displayClock ?? null,
        startTime: ev.date,
        homeCrest: home?.team?.logo ?? null,
        awayCrest: away?.team?.logo ?? null,
      }
    })

    return NextResponse.json({ matches, source: 'ESPN' })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sports fetch failed', matches: [] },
      { status: 200 }
    )
  }
}
