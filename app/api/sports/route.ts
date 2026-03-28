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
    { url: 'https://site.api.espn.com/apis/site/v2/sports/tennis/wta/scoreboard', name: 'WTA' },
  ],
  f1: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard', name: 'Formula 1' },
  ],
  mma: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard', name: 'UFC' },
    { url: 'https://site.api.espn.com/apis/site/v2/sports/mma/bellator/scoreboard', name: 'Bellator' },
  ],
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCompetitorName(c: any): string {
  return (
    c?.team?.shortDisplayName ??
    c?.team?.name ??
    c?.athlete?.shortName ??
    c?.athlete?.displayName ??
    c?.displayName ??
    ''
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCompetitorLogo(c: any): string | null {
  return c?.team?.logo ?? c?.athlete?.flag?.href ?? c?.athlete?.headshot?.href ?? null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseESPNData(data: any, leagueName: string): Match[] {
  return (data.events ?? []).slice(0, 15).map((ev: {
    id: string; date: string; name?: string; shortName?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    competitions?: any[]
  }) => {
    const comp = ev.competitions?.[0]
    const competitors: unknown[] = comp?.competitors ?? []

    // Prefer homeAway, fall back to order for individual sports (tennis, MMA)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted = [...competitors].sort((a: any, b: any) => (a.order ?? 99) - (b.order ?? 99))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const home = (competitors as any[]).find(c => c.homeAway === 'home') ?? sorted[0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const away = (competitors as any[]).find(c => c.homeAway === 'away') ?? sorted[1]

    // For events with no named competitors (F1 race listing), use event name
    const evName = ev.name ?? ev.shortName ?? ''
    const nameParts = evName.includes(' vs ') ? evName.split(' vs ') :
                      evName.includes(' at ')  ? evName.split(' at ')  : null

    const homeTeam = getCompetitorName(home) || (nameParts?.[0]?.trim() ?? evName)
    const awayTeam = getCompetitorName(away) || (nameParts?.[1]?.trim() ?? '')

    return {
      id: ev.id,
      competition: leagueName,
      homeTeam,
      awayTeam,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      homeScore: (home as any)?.score != null ? Number((home as any).score) : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      awayScore: (away as any)?.score != null ? Number((away as any).score) : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: (comp as any)?.status?.type?.name ?? 'STATUS_SCHEDULED',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      minute: (comp as any)?.status?.displayClock ?? (comp as any)?.status?.type?.description ?? null,
      startTime: ev.date,
      homeCrest: getCompetitorLogo(home),
      awayCrest: getCompetitorLogo(away),
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
