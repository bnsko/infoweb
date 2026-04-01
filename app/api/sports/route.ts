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
    { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/svk.1/scoreboard', name: 'Fortuna Liga SK' },
  ],
  hockey: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard', name: 'NHL' },
    { url: 'https://site.api.espn.com/apis/site/v2/sports/hockey/mens-college-hockey/scoreboard', name: 'IIHF' },
  ],
  basketball: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard', name: 'NBA' },
    { url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard', name: 'EuroLeague' },
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
  ],
  handball: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/handball/ehf.cl/scoreboard', name: 'EHF Champions League' },
  ],
  volleyball: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/volleyball/fivb/scoreboard', name: 'FIVB' },
  ],
  rugby: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/rugby/six-nations/scoreboard', name: 'Six Nations' },
  ],
  cycling: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/cycling/road/scoreboard', name: 'Cycling' },
  ],
  golf: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard', name: 'PGA Tour' },
  ],
  baseball: [
    { url: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard', name: 'MLB' },
  ],
}

const STANDINGS_ENDPOINTS: Record<string, string> = {
  football: 'https://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings',
  hockey:   'https://site.api.espn.com/apis/v2/sports/hockey/nhl/standings',
  basketball: 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings',
}

const SPORT_FACTS: Record<string, string[]> = {
  football: ['⚽ Prvý futbalový klub na svete bol Sheffield FC, founded 1857', '🏆 Lionel Messi drží rekord: 8× Zlatá lopta', '🌍 FIFA má viac členov ako OSN (211 vs 193)', '📺 Finále Ligy majstrov sleduje 380M divákov'],
  hockey: ['🏒 Najrýchlejší gól v NHL za 5 sekúnd od začiatku (Alex Tanguay)', '🥅 Wayne Gretzky skóroval viac asistencií ako kdokoľvek iný bodov', '🇨🇦 99,8 % hráčov NHL prešlo Kanaďanmi v nejakom momente', '❄️ NHL puk váži 170g a zmrazuje sa pred zápasom'],
  basketball: ['🏀 NBA zárobky: LeBron James zarobil $50M+ v sezóne 2023', '🐐 Michael Jordan vyhrával 98% zápasov keď viedol po polčase', '📏 Highest NBA game score: 186 Detroit Pistons vs Denver Nuggets (1983)',  '🌍 NBA sledujú diváci v 215 krajinách'],
  tennis: ['🎾 Rekordný gem: John Isner vs Nicolas Mahut 2010 – 11h5m', '🏆 Novak Djokovič má 24 Grand Slamov (rekord mužov)', '🌡️ French Open je jediný grandslam na antuke', '⚡ Najrýchlejší servis: Sam Groth 263.4 km/h'],
  f1: ['🏎️ F1 auto akceleruje 0-100 km/h za 2,6 sekundy', '🔥 Brzdy sa zahrievajú na 1000°C počas pretekov', '🏆 Michael Schumacher a Lewis Hamilton – obaja 7× majster sveta', '⛽ F1 auto spotrebuje 75L paliva za preteky'],
  mma: ['🥊 UFC uplatňuje 12 rôznych bojových umení', '💪 Conor McGregor je najzarábajúcejší UFC bojovník v histórii', '🥋 Gracie rodina vytvorila moderné UFC pravidlá cez BJJ', '🌍 UFC má fanúšikov v 175 krajinách'],
  handball: ['🤾 Hádzaná má 200 000 registrovaných hráčov na Slovensku', '🏆 Francúzsko dominuje svetovým bajstrovstvám', '⚡ Najrýchlejší hod: 132 km/h (Nikola Karabatić)', '🥅 Hádzanárska branka má 2×3 metre'],
  volleyball: ['🏐 Volejbal vynašiel William Morgan v 1895, rok po basketbale', '🌊 Plážový volejbal je olympijský od Atlanta 1996', '📏 Sieť pre mužov je 2,43m, pre ženy 2,24m', '🏆 Brazília má najviac olympijských medailí vo volejbale'],
  rugby: ['🏉 Rugby vzniklo keď William Webb Ellis zdvihol loptu počas futbalu', '🏆 New Zealand All Blacks vyhrali 77% všetkých zápasov v histórii', '💪 Priemerný wadrobe rugbistov váži 102kg', '📺 Rugby World Cup sleduje 180M divákov'],
}

interface StandingEntry {
  rank: number; team: string; logo: string | null
  played: number; won: number; drawn: number; lost: number
  goalsFor: number; goalsAgainst: number; points: number; form: string
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
  const action = searchParams.get('action') ?? 'matches'

  // Return sport facts
  if (action === 'facts') {
    return NextResponse.json({ facts: SPORT_FACTS[sport] ?? SPORT_FACTS.football })
  }

  // Return standings
  if (action === 'standings') {
    const standingsUrl = STANDINGS_ENDPOINTS[sport]
    if (!standingsUrl) return NextResponse.json({ standings: [] })
    try {
      const res = await fetch(standingsUrl, { cache: 'no-store', headers: { 'User-Agent': 'SlovakiaInfo/1.0' }, signal: AbortSignal.timeout(8000) })
      if (!res.ok) return NextResponse.json({ standings: [] })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await res.json()
      const groups = data?.standings?.entries ?? data?.children?.[0]?.standings?.entries ?? []
      const standings: StandingEntry[] = (groups as unknown[]).slice(0, 10).map((entry: unknown, i: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = entry as any
        const stats: Record<string, number> = {}
        ;(e.stats ?? []).forEach((s: { name: string; value: number }) => { stats[s.name] = s.value })
        const form = ((e.team?.form ?? '') as string).split('').slice(-5).join('')
        return {
          rank: i + 1,
          team: e.team?.shortDisplayName ?? e.team?.name ?? '',
          logo: e.team?.logo ?? null,
          played: stats['gamesPlayed'] ?? stats['played'] ?? 0,
          won: stats['wins'] ?? stats['won'] ?? 0,
          drawn: stats['ties'] ?? stats['drawn'] ?? 0,
          lost: stats['losses'] ?? stats['lost'] ?? 0,
          goalsFor: stats['pointsFor'] ?? stats['goalsScored'] ?? 0,
          goalsAgainst: stats['pointsAgainst'] ?? stats['goalsConceded'] ?? 0,
          points: stats['points'] ?? 0,
          form,
        }
      })
      return NextResponse.json({ standings, league: sport === 'football' ? 'Premier League' : sport === 'hockey' ? 'NHL' : 'NBA' })
    } catch {
      return NextResponse.json({ standings: [] })
    }
  }

  const endpoints = SPORT_ENDPOINTS[sport] ?? SPORT_ENDPOINTS.football
  const allMatches: Match[] = []

  // Fetch today + yesterday for recently played results
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const fmtDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')
  const dates = [fmtDate(today), fmtDate(yesterday)]

  const results = await Promise.allSettled(
    endpoints.flatMap((ep) =>
      dates.map(async (dateStr) => {
        const separator = ep.url.includes('?') ? '&' : '?'
        const url = `${ep.url}${separator}dates=${dateStr}`
        const res = await fetch(url, {
          cache: 'no-store',
          headers: { 'User-Agent': 'SlovakiaInfo/1.0' },
          signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) return []
        const data = await res.json()
        return parseESPNData(data, ep.name)
      })
    )
  )

  for (const r of results) {
    if (r.status === 'fulfilled') allMatches.push(...r.value)
  }

  // Deduplicate by match id
  const seen = new Set<string>()
  const unique = allMatches.filter(m => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })

  // Sort: live first, then scheduled, then finished
  allMatches.sort((a, b) => {
    const aLive = a.status.includes('IN_PLAY') || a.status.includes('LIVE') || a.status.includes('PROGRESS') ? 0 : 1
    const bLive = b.status.includes('IN_PLAY') || b.status.includes('LIVE') || b.status.includes('PROGRESS') ? 0 : 1
    if (aLive !== bLive) return aLive - bLive
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  })

  return NextResponse.json({
    sport,
    matches: unique.slice(0, 30),
    source: 'ESPN',
    availableSports: Object.keys(SPORT_ENDPOINTS),
  } as SportData & { availableSports: string[] })
}
