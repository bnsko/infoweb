import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed + 333)

  const categories = ['Koncert', 'Divadlo', 'Festival', 'Výstava', 'Film', 'Stand-up', 'Workshop', 'Prednáška']
  const venues = {
    BA: ['Stará Tržnica', 'Refinery Gallery', 'A4 - priestor', 'Istropolis', 'SND', 'Ateliér Babylon', 'Majestic Music Club', 'Incheba'],
    KE: ['Tabačka', 'Kulturpark', 'Steel Aréna', 'ŠD TUKE'],
    BB: ['Europa SC', 'Záhrada CNK', 'Radvanský kaštieľ'],
    ZA: ['Stanica Žilina-Záriečie', 'Mestské divadlo'],
  }
  const eventNames = [
    'Nočný trh na Hviezdoslavovom', 'Grape Festival 2026 warm-up', 'Výstava: Slovenský dizajn', 'Stand-up comedy night',
    'Jazz Fest Bratislava', 'TEDx Bratislava', 'Film screening: Slnečnica', 'Divadelný festival Dotyky',
    'Workshop: Keramika pre začiatočníkov', 'Koncert: Korben Dallas', 'Prednáška: AI v zdravotníctve',
    'Výstava fotografií: Slovensko z výšky', 'Koncert: Vec & IMT Smile', 'Open Air Cinema Eurovea',
    'Beer Fest BA', 'Koncert: Katarzia', 'Bratislava Christmas Market (preview)',
  ]

  const cities = ['BA', 'KE', 'BB', 'ZA'] as const
  const events = Array.from({ length: 12 }, (_, i) => {
    const city = cities[Math.floor(rng() * cities.length)]
    const cityVenues = venues[city]
    const dayOffset = Math.floor(rng() * 14)
    const eventDate = new Date(now.getTime() + dayOffset * 86400000)
    const hour = 16 + Math.floor(rng() * 5)
    return {
      id: i + 1,
      name: eventNames[Math.floor(rng() * eventNames.length)],
      category: categories[Math.floor(rng() * categories.length)],
      venue: cityVenues[Math.floor(rng() * cityVenues.length)],
      city,
      date: eventDate.toISOString().slice(0, 10),
      time: `${hour}:${rng() > 0.5 ? '00' : '30'}`,
      price: rng() > 0.3 ? `${Math.floor(5 + rng() * 40)} €` : 'Zadarmo',
      soldOut: rng() > 0.85,
      image: null,
    }
  }).sort((a, b) => a.date.localeCompare(b.date))

  return NextResponse.json({ events, timestamp: Date.now() })
}
