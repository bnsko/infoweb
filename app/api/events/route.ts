import { NextResponse } from 'next/server'

export const revalidate = 3600 // refresh hourly

interface SKEvent {
  title: string
  date: string
  venue: string
  city: string
  category: 'concert' | 'sport' | 'culture' | 'festival' | 'other'
  emoji: string
  url?: string
}

// Generate upcoming events based on date patterns, real Slovak venues and recurring events
function generateEvents(): SKEvent[] {
  const now = new Date()
  const events: SKEvent[] = []

  // Real recurring Slovak events and venues
  const concerts: Omit<SKEvent, 'date' | 'emoji'>[] = [
    { title: 'Koncert vo Filharmónii', venue: 'Slovenská filharmónia', city: 'Bratislava', category: 'concert' },
    { title: 'Jazz Evening', venue: 'Nu Spirit Club', city: 'Bratislava', category: 'concert' },
    { title: 'Koncert Slovenského národného divadla', venue: 'SND', city: 'Bratislava', category: 'concert' },
    { title: 'Live Music Night', venue: 'Randal Club', city: 'Bratislava', category: 'concert' },
    { title: 'Organ Concert', venue: 'Dóm sv. Martina', city: 'Bratislava', category: 'concert' },
    { title: 'Rock Night', venue: 'Majestic Music Club', city: 'Bratislava', category: 'concert' },
    { title: 'Koncert Štátneho divadla', venue: 'ŠD Košice', city: 'Košice', category: 'concert' },
    { title: 'Folk Music Festival', venue: 'Amfiteáter', city: 'Banská Bystrica', category: 'concert' },
  ]

  const sports: Omit<SKEvent, 'date' | 'emoji'>[] = [
    { title: 'Fortuna liga zápas', venue: 'Tehelné pole', city: 'Bratislava', category: 'sport' },
    { title: 'HC Slovan – hokej', venue: 'Zimný štadión', city: 'Bratislava', category: 'sport' },
    { title: 'HC Košice – hokej', venue: 'Steel Aréna', city: 'Košice', category: 'sport' },
    { title: 'Spartak Trnava – futbal', venue: 'Štadión Antona Malatinského', city: 'Trnava', category: 'sport' },
    { title: 'MŠK Žilina – futbal', venue: 'Štadión MŠK', city: 'Žilina', category: 'sport' },
    { title: 'Bežecký maratón', venue: 'Staré Mesto', city: 'Bratislava', category: 'sport' },
    { title: 'Tenis – ATP Challenger', venue: 'NTC', city: 'Bratislava', category: 'sport' },
  ]

  const culture: Omit<SKEvent, 'date' | 'emoji'>[] = [
    { title: 'Výstava v Danubiane', venue: 'Danubiana Meulensteen', city: 'Bratislava', category: 'culture' },
    { title: 'Divadelný festival', venue: 'Divadlo Aréna', city: 'Bratislava', category: 'culture' },
    { title: 'Noc múzeí', venue: 'Mestské múzeum', city: 'Bratislava', category: 'culture' },
    { title: 'Letné kino', venue: 'Amfiteáter', city: 'Košice', category: 'culture' },
    { title: 'Výstava súčasného umenia', venue: 'Kunsthalle', city: 'Bratislava', category: 'culture' },
    { title: 'Bábkové divadlo pre deti', venue: 'Bibiana', city: 'Bratislava', category: 'culture' },
  ]

  const festivals: Omit<SKEvent, 'date' | 'emoji'>[] = [
    { title: 'Pohoda Festival', venue: 'Letisko', city: 'Trenčín', category: 'festival' },
    { title: 'Grape Festival', venue: 'Letisko', city: 'Piešťany', category: 'festival' },
    { title: 'Vianočné trhy', venue: 'Hlavné námestie', city: 'Bratislava', category: 'festival' },
    { title: 'Trnavský jarmok', venue: 'Centrum', city: 'Trnava', category: 'festival' },
    { title: 'Radvanský jarmok', venue: 'Námestie', city: 'Banská Bystrica', category: 'festival' },
    { title: 'Festival jedla', venue: 'Tyršovo nábrežie', city: 'Bratislava', category: 'festival' },
  ]

  const categoryEmojis: Record<string, string> = {
    concert: '🎵',
    sport: '⚽',
    culture: '🎭',
    festival: '🎪',
    other: '📅',
  }

  // Use day-of-year as seed for deterministic but varied generation
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)

  const allSources = [
    { list: concerts, weight: 3 },
    { list: sports, weight: 3 },
    { list: culture, weight: 2 },
    { list: festivals, weight: 1 },
  ]

  // Generate events for next 14 days
  for (let d = 0; d < 14; d++) {
    const eventDate = new Date(now)
    eventDate.setDate(eventDate.getDate() + d)
    const dateStr = eventDate.toISOString().split('T')[0]

    // 2-4 events per day, seeded by date
    const seed = dayOfYear + d
    const eventsPerDay = 2 + (seed % 3)

    for (let e = 0; e < eventsPerDay; e++) {
      const srcIdx = (seed * 7 + e * 13) % allSources.length
      const src = allSources[srcIdx]
      const itemIdx = (seed * 3 + e * 11 + d * 5) % src.list.length
      const item = src.list[itemIdx]

      const urlQuery = encodeURIComponent(`${item.title} ${item.city}`)
      const url = item.category === 'concert' || item.category === 'festival'
        ? `https://www.ticketportal.sk/event.aspx?id=search&q=${urlQuery}`
        : `https://www.google.com/search?q=${urlQuery}+${dateStr}`

      events.push({
        ...item,
        date: dateStr,
        emoji: categoryEmojis[item.category],
        url,
      })
    }
  }

  // Remove duplicates (same title on same date)
  const seen = new Set<string>()
  return events.filter(e => {
    const key = `${e.date}-${e.title}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 20)
}

// Country ticket portals for proper event URLs
const TICKET_PORTALS: Record<string, string> = {
  sk: 'https://www.ticketportal.sk/event.aspx?id=search&q=',
  cz: 'https://www.ticketportal.cz/search/?query=',
  pl: 'https://www.ebilet.pl/szukaj/?q=',
  at: 'https://www.oeticket.com/search/?term=',
  hu: 'https://www.jegy.hu/search?q=',
  de: 'https://www.eventim.de/search/?searchterm=',
  ua: 'https://concert.ua/en/search?query=',
}

// Neighboring countries events
const NEIGHBOR_EVENTS: Record<string, (Omit<SKEvent, 'date' | 'emoji'> & { ticketUrl?: string })[]> = {
  cz: [
    { title: 'Rock for People', venue: 'Hradec Králové', city: 'Hradec Králové', category: 'festival', ticketUrl: 'https://www.rockforpeople.cz/' },
    { title: 'Colours of Ostrava', venue: 'Dolní oblast Vítkovice', city: 'Ostrava', category: 'festival', ticketUrl: 'https://www.colours.cz/' },
    { title: 'Národní divadlo', venue: 'Národní divadlo', city: 'Praha', category: 'culture', ticketUrl: 'https://www.narodni-divadlo.cz/en/programme' },
    { title: 'Sparta Praha – fotbal', venue: 'Letná', city: 'Praha', category: 'sport', ticketUrl: 'https://www.sparta.cz/en/tickets/' },
    { title: 'HC Oceláři – hokej', venue: 'Ostravar Aréna', city: 'Třinec', category: 'sport' },
    { title: 'Signal Festival', venue: 'Centrum', city: 'Praha', category: 'festival', ticketUrl: 'https://www.signalfestival.com/' },
    { title: 'Koncert v Rudolfinu', venue: 'Rudolfinum', city: 'Praha', category: 'concert', ticketUrl: 'https://www.ceskafilharmonie.cz/en/programme/' },
    { title: 'Brněnské Vánoce', venue: 'Náměstí Svobody', city: 'Brno', category: 'festival' },
    { title: 'Metronome Prague', venue: 'Holešovice', city: 'Praha', category: 'festival', ticketUrl: 'https://www.metronomeprague.cz/' },
    { title: 'Karlovy Vary Filmový Festival', venue: 'Hotel Thermal', city: 'Karlovy Vary', category: 'culture', ticketUrl: 'https://www.kviff.com/' },
  ],
  pl: [
    { title: 'Open\'er Festival', venue: 'Lotnisko', city: 'Gdynia', category: 'festival', ticketUrl: 'https://opener.pl/' },
    { title: 'OFF Festival', venue: 'Dolina Trzech Stawów', city: 'Katowice', category: 'festival', ticketUrl: 'https://off-festival.pl/' },
    { title: 'Legia Warszawa – piłka nożna', venue: 'Stadion Legii', city: 'Warszawa', category: 'sport', ticketUrl: 'https://legia.com/bilety' },
    { title: 'Teatr Wielki', venue: 'Teatr Wielki', city: 'Warszawa', category: 'culture', ticketUrl: 'https://teatrwielki.pl/en/repertoire/' },
    { title: 'Krakowski Festiwal Filmowy', venue: 'Kino Kijów', city: 'Kraków', category: 'culture', ticketUrl: 'https://www.krakowfilmfestival.pl/' },
    { title: 'Wrocław Jazz Festival', venue: 'Hala Stulecia', city: 'Wrocław', category: 'concert' },
    { title: 'Tauron Nowa Muzyka', venue: 'Strefa Kultury', city: 'Katowice', category: 'festival', ticketUrl: 'https://nowamuzyka.pl/' },
    { title: 'Unsound Festival', venue: 'Centrum', city: 'Kraków', category: 'festival', ticketUrl: 'https://www.unsound.pl/' },
  ],
  at: [
    { title: 'Wiener Festwochen', venue: 'Rathaus', city: 'Wien', category: 'festival', ticketUrl: 'https://www.festwochen.at/' },
    { title: 'Donauinselfest', venue: 'Donauinsel', city: 'Wien', category: 'festival', ticketUrl: 'https://donauinselfest.at/' },
    { title: 'Salzburger Festspiele', venue: 'Großes Festspielhaus', city: 'Salzburg', category: 'culture', ticketUrl: 'https://www.salzburgerfestspiele.at/' },
    { title: 'Rapid Wien – Fußball', venue: 'Allianz Stadion', city: 'Wien', category: 'sport', ticketUrl: 'https://www.skrapid.at/en/tickets/' },
    { title: 'Konzert im Musikverein', venue: 'Musikverein', city: 'Wien', category: 'concert', ticketUrl: 'https://www.musikverein.at/' },
    { title: 'Ars Electronica', venue: 'Ars Electronica Center', city: 'Linz', category: 'culture', ticketUrl: 'https://ars.electronica.art/' },
    { title: 'Frequency Festival', venue: 'Green Park', city: 'St. Pölten', category: 'festival', ticketUrl: 'https://www.frequency.at/' },
  ],
  hu: [
    { title: 'Sziget Festival', venue: 'Hajógyári-sziget', city: 'Budapest', category: 'festival', ticketUrl: 'https://szigetfestival.com/' },
    { title: 'Ferencváros – labdarúgás', venue: 'Groupama Aréna', city: 'Budapest', category: 'sport', ticketUrl: 'https://www.fradi.hu/en/tickets' },
    { title: 'VOLT Fesztivál', venue: 'Lővér kemping', city: 'Sopron', category: 'festival', ticketUrl: 'https://www.voltfestival.hu/' },
    { title: 'Operaház előadás', venue: 'Magyar Állami Operaház', city: 'Budapest', category: 'culture', ticketUrl: 'https://www.opera.hu/en/programme/' },
    { title: 'Budapest Jazz Klub', venue: 'Budapest Jazz Club', city: 'Budapest', category: 'concert', ticketUrl: 'https://www.bjc.hu/en/' },
    { title: 'Balaton Sound', venue: 'Zamárdi', city: 'Zamárdi', category: 'festival', ticketUrl: 'https://www.balatonsound.com/' },
  ],
  de: [
    { title: 'Rock am Ring', venue: 'Nürburgring', city: 'Nürburg', category: 'festival', ticketUrl: 'https://www.rock-am-ring.com/' },
    { title: 'Wacken Open Air', venue: 'Wacken', city: 'Wacken', category: 'festival', ticketUrl: 'https://www.wacken.com/' },
    { title: 'Berlinale', venue: 'Potsdamer Platz', city: 'Berlin', category: 'culture', ticketUrl: 'https://www.berlinale.de/' },
    { title: 'Bayerische Staatsoper', venue: 'Nationaltheater', city: 'München', category: 'culture', ticketUrl: 'https://www.staatsoper.de/en/' },
    { title: 'Borussia Dortmund – Bundesliga', venue: 'Signal Iduna Park', city: 'Dortmund', category: 'sport', ticketUrl: 'https://www.bvb.de/eng/Tickets' },
    { title: 'Lollapalooza Berlin', venue: 'Olympiastadion', city: 'Berlin', category: 'festival', ticketUrl: 'https://www.lollapaloozade.com/' },
    { title: 'Berliner Philharmoniker', venue: 'Philharmonie', city: 'Berlin', category: 'concert', ticketUrl: 'https://www.berliner-philharmoniker.de/' },
    { title: 'Oktoberfest', venue: 'Theresienwiese', city: 'München', category: 'festival', ticketUrl: 'https://www.oktoberfest.de/' },
  ],
  ua: [
    { title: 'Atlas Weekend', venue: 'VDNH', city: 'Kyiv', category: 'festival', ticketUrl: 'https://atlasweekend.com/' },
    { title: 'Leopolis Jazz Fest', venue: 'Rynok Square', city: 'Lviv', category: 'concert', ticketUrl: 'https://leopolisjazz.com/' },
    { title: 'GogolFest', venue: 'Art Zavod', city: 'Kyiv', category: 'culture', ticketUrl: 'https://gogolfest.ua/' },
    { title: 'Kyiv Opera', venue: 'Národná opera', city: 'Kyiv', category: 'culture', ticketUrl: 'https://opera.com.ua/en/' },
    { title: 'Dynamo Kyiv – futbal', venue: 'Olympijskyj štadión', city: 'Kyiv', category: 'sport' },
    { title: 'Lviv BookForum', venue: 'Potocki Palace', city: 'Lviv', category: 'culture', ticketUrl: 'https://bookforum.ua/' },
  ],
}

function generateNeighborEvents(country: string): SKEvent[] {
  const templates = NEIGHBOR_EVENTS[country] ?? []
  if (!templates.length) return []

  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  const emoji: Record<string, string> = { concert: '🎵', sport: '⚽', culture: '🎭', festival: '🎪', other: '📅' }
  const portal = TICKET_PORTALS[country] ?? TICKET_PORTALS.sk
  const events: SKEvent[] = []

  for (let d = 0; d < 14; d++) {
    const date = new Date(now)
    date.setDate(date.getDate() + d)
    const dateStr = date.toISOString().split('T')[0]
    const seed = dayOfYear + d
    const count = 1 + (seed % 3)
    for (let e = 0; e < count; e++) {
      const idx = (seed * 7 + e * 11) % templates.length
      const t = templates[idx]
      const url = t.ticketUrl ?? `${portal}${encodeURIComponent(t.title)}`
      events.push({ title: t.title, venue: t.venue, city: t.city, category: t.category, date: dateStr, emoji: emoji[t.category] ?? '📅', url })
    }
  }

  const seen = new Set<string>()
  return events.filter(e => {
    const key = `${e.date}-${e.title}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 20)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country') ?? 'sk'
  const city = searchParams.get('city') ?? ''
  const type = searchParams.get('type') ?? 'events'

  // Cinema programs
  if (type === 'cinema') {
    const cinemaEvents = await fetchCinemaPrograms(city || 'Bratislava')
    return NextResponse.json({ events: cinemaEvents.slice(0, 15), country: 'sk', today: new Date().toISOString().slice(0, 10) })
  }

  // Theater programs
  if (type === 'theater') {
    const theaterEvents = await fetchTheaterPrograms(city || 'Bratislava')
    return NextResponse.json({ events: theaterEvents.slice(0, 15), country: 'sk', today: new Date().toISOString().slice(0, 10) })
  }

  let events: SKEvent[]
  if (country === 'sk') {
    const all = generateEvents()
    events = city
      ? all.filter(e => e.city.toLowerCase().startsWith(city.toLowerCase()))
      : all
  } else {
    events = generateNeighborEvents(country)
  }
  const today = new Date().toISOString().slice(0, 10)
  return NextResponse.json({ events: events.slice(0, 25), country, today })
}

async function fetchCinemaPrograms(city: string): Promise<SKEvent[]> {
  const events: SKEvent[] = []
  // Try CSFD.cz cinema program RSS
  try {
    const citySlug = city.toLowerCase().replace(/\s+/g, '-')
    const urls = [
      `https://www.csfd.sk/kino/program/?city=${encodeURIComponent(city)}`,
      `https://www.kino.sk/program/${citySlug}`,
    ]
    for (const url of urls) {
      if (events.length > 0) break
      try {
        const res = await fetch(url, {
          cache: 'no-store',
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(8000),
        })
        if (!res.ok) continue
        const html = await res.text()
        // Extract movie titles and showtimes from HTML
        const movieBlocks = html.match(/<h[23][^>]*>([^<]+)<\/h[23]>/gi) ?? []
        for (const block of movieBlocks.slice(0, 12)) {
          const title = block.replace(/<[^>]*>/g, '').trim()
          if (title && title.length > 2 && title.length < 100) {
            events.push({
              title: `🎬 ${title}`,
              date: new Date().toISOString().slice(0, 10),
              venue: 'Kino',
              city,
              category: 'culture',
              emoji: '🎬',
              url: url,
            })
          }
        }
      } catch { /* try next */ }
    }
  } catch { /* ignore */ }

  // Fallback: generate cinema program from known SK cinemas
  if (events.length === 0) {
    const movies = [
      'Thunderbolts*', 'Mission: Impossible 8', 'Inside Out 3', 'Avatar 3',
      'Jurassic World 4', 'The Fantastic Four', 'Duna: Časť tretia',
      'Deadpool & Wolverine 2', 'Oppenheimer', 'Spider-Man: Brand New Day',
      'Barbie 2', 'Minecraft Movie', 'Kúzelné zvieratá 4',
    ]
    const cinemas: Record<string, string[]> = {
      'Bratislava': ['Cinema City Aupark', 'Cinema City Bory', 'Kino Lumière', 'Kino Mladosť'],
      'Košice': ['Cinema City Optima', 'Kino Úsmev'],
      'Žilina': ['Cinema City'],
      'Banská Bystrica': ['Cinema City Europa'],
    }
    const citycinemas = cinemas[city] ?? ['Kino']
    const now = new Date()
    for (let i = 0; i < Math.min(10, movies.length); i++) {
      const d = new Date(now)
      d.setDate(d.getDate() + Math.floor(i / 4))
      events.push({
        title: movies[i],
        date: d.toISOString().slice(0, 10),
        venue: citycinemas[i % citycinemas.length],
        city,
        category: 'culture',
        emoji: '🎬',
        url: `https://www.csfd.sk/hledat/?q=${encodeURIComponent(movies[i])}`,
      })
    }
  }
  return events
}

async function fetchTheaterPrograms(city: string): Promise<SKEvent[]> {
  const events: SKEvent[] = []
  // Try fetching theater program
  const theaterUrls: Record<string, { name: string; url: string; programUrl: string }[]> = {
    'Bratislava': [
      { name: 'SND', url: 'https://www.snd.sk', programUrl: 'https://www.snd.sk/?program' },
      { name: 'Divadlo Aréna', url: 'https://www.divadloarena.sk', programUrl: 'https://www.divadloarena.sk/program/' },
      { name: 'Astorka Korzo', url: 'https://www.astorkakorzotheatre.sk', programUrl: 'https://www.astorkakorzotheatre.sk/program/' },
    ],
    'Košice': [
      { name: 'ŠD Košice', url: 'https://www.sdke.sk', programUrl: 'https://www.sdke.sk/program/' },
    ],
  }

  const theaters = theaterUrls[city] ?? theaterUrls['Bratislava']
  
  for (const theater of theaters) {
    try {
      const res = await fetch(theater.programUrl, {
        cache: 'no-store',
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) continue
      const html = await res.text()
      // Try to extract event titles from program page
      const titles = html.match(/<h[234][^>]*class="[^"]*(?:title|name|event)[^"]*"[^>]*>([\s\S]*?)<\/h[234]>/gi) ?? []
      for (const t of titles.slice(0, 5)) {
        const title = t.replace(/<[^>]*>/g, '').trim()
        if (title && title.length > 2 && title.length < 120) {
          events.push({
            title,
            date: new Date().toISOString().slice(0, 10),
            venue: theater.name,
            city,
            category: 'culture',
            emoji: '🎭',
            url: theater.programUrl,
          })
        }
      }
    } catch { /* ignore */ }
  }

  // Fallback: generate theater shows
  if (events.length === 0) {
    const shows = [
      'Labutie jazero', 'Carmen', 'Hamlet', 'Sluha dvoch pánov',
      'Prodaná nevěsta', 'Don Giovanni', 'Jej pastorkyňa', 'Rómeo a Júlia',
      'Cyrano z Bergeracu', 'Nabucco',
    ]
    const now = new Date()
    for (let i = 0; i < shows.length; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() + i)
      events.push({
        title: shows[i],
        date: d.toISOString().slice(0, 10),
        venue: theaters[i % theaters.length]?.name ?? 'SND',
        city,
        category: 'culture',
        emoji: '🎭',
        url: theaters[i % theaters.length]?.programUrl ?? '#',
      })
    }
  }
  return events
}
