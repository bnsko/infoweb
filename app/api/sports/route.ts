import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Match {
  id: string
  competition: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  status: string
  minute: string | null
  startTime: string
  homeCrest?: string | null
  awayCrest?: string | null
}

interface SportData {
  sport: string
  matches: Match[]
  source: string
}

// ESPN API endpoints for different sports
const SPORT_ENDPOINTS: Record<string, { url: string; name: string }[]> = {
  football: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard', name: 'Premier League' },
    { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard', name: 'Bundesliga' },
    { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard', name: 'La Liga' },
    { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard', name: 'Serie A' },
    { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard', name: 'Champions League' },
  ],
  hockey: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard', name: 'NHL' },
  ],
  basketball: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard', name: 'NBA' },
  ],
  tennis: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard', name: 'ATP' },
  ],
  f1: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard', name: 'Formula 1' },
  ],
  mma: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard', name: 'UFC' },
  ],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseESPNData(data: any, leagueName: string): Match[] {
  return (data.events ?? []).slice(0, 10).map((ev: { id: string; date: string; competitions?: { competitors?: { homeAway: string; team?: { shortDisplayName?: string; name?: string; logo?: string }; score?: string }[]; status?: { type?: { name?: string }; displayClock?: string } }[] }) => {
    const comp = ev.competitions?.[0]
    const home = comp?.competitors?.find(c => c.homeAway === 'home')
    const away = comp?.competitors?.find(c => c.homeAway === 'away')
    return {
      id: ev.id,
      competition: leagueName,
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
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport') ?? 'football'

  const endpoints = SPORT_ENDPOINTS[sport] ?? SPORT_ENDPOINTS.football
  const allMatches: Match[] = []

  const results = await Promise.allSettled(
    endpoints.map(async (ep) => {
      const res = await fetch(ep.url, {
        cache: 'no-store',
        headers: { 'User-Agent': 'SlovakiaInfo/1.0' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) return []
      const data = await res.json()
      return parseESPNData(data, ep.name)
    })
  )

  for (const r of results) {
    if (r.status === 'fulfilled') allMatches.push(...r.value)
  }

  // Sort: live first, then scheduled, then finished
  allMatches.sort((a, b) => {
    const aLive = a.status.includes('IN_PLAY') || a.status.includes('LIVE') || a.status.includes('PROGRESS') ? 0 : 1
    const bLive = b.status.includes('IN_PLAY') || b.status.includes('LIVE') || b.status.includes('PROGRESS') ? 0 : 1
    if (aLive !== bLive) return aLive - bLive
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  })

  return NextResponse.json({
    sport,
    matches: allMatches.slice(0, 20),
    source: 'ESPN',
    availableSports: Object.keys(SPORT_ENDPOINTS),
  } as SportData & { availableSports: string[] })
}
