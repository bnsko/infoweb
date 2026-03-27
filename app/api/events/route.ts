import { NextResponse } from 'next/server'

export const revalidate = 3600 // refresh hourly

interface SKEvent {
  title: string
  date: string
  venue: string
  city: string
  category: 'concert' | 'sport' | 'culture' | 'festival' | 'other'
  emoji: string
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

      events.push({
        ...item,
        date: dateStr,
        emoji: categoryEmojis[item.category],
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

export async function GET() {
  const events = generateEvents()
  return NextResponse.json({ events })
}
