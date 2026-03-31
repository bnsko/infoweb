import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed + 42)

  const dayOfWeek = now.getDay()
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5

  const restaurants = [
    { name: 'Koliba u Medveďa', area: 'Staré Mesto', rating: 4.5, priceRange: '€€' },
    { name: 'Pizzeria Basilico', area: 'Ružinov', rating: 4.3, priceRange: '€' },
    { name: 'Jedáleň u Babky', area: 'Petržalka', rating: 4.1, priceRange: '€' },
    { name: 'Vietnamese Pho', area: 'Nové Mesto', rating: 4.6, priceRange: '€' },
    { name: 'Bistro Zelený Dvor', area: 'Karlova Ves', rating: 4.4, priceRange: '€€' },
    { name: 'Gastro Pub Central', area: 'Centrum', rating: 4.2, priceRange: '€€' },
    { name: 'Sushi Point', area: 'Mlynské Nivy', rating: 4.7, priceRange: '€€€' },
    { name: 'Veggie Corner', area: 'Obchodná', rating: 4.0, priceRange: '€' },
  ]

  const soups = ['Slepačí vývar s rezancami', 'Fazuľová polievka', 'Gulášová polievka', 'Hubový krém', 'Šošovicová polievka', 'Kapustnica', 'Paradajková polievka', 'Brokolicový krém', 'Zemiaková polievka', 'Hrášková polievka']
  const mains = [
    { name: 'Vyprážaný rezeň s hranolkami', cal: 680 },
    { name: 'Kuracie prsia na grile so zeleninou', cal: 420 },
    { name: 'Bravčový steak s ryžou', cal: 550 },
    { name: 'Penne s kuracím ragú', cal: 490 },
    { name: 'Losos na masle so šalátom', cal: 380 },
    { name: 'Hovädzie na šampiňónoch', cal: 520 },
    { name: 'Bryndzové halušky', cal: 610 },
    { name: 'Morčacie kúsky na paprike', cal: 440 },
    { name: 'Grilovaný syr s tatarkou', cal: 350 },
    { name: 'Špagety carbonara', cal: 580 },
    { name: 'Rizoto s hubami', cal: 410 },
    { name: 'Pečená kačka s lokšami', cal: 720 },
    { name: 'Kurací wrap s dressingom', cal: 390 },
    { name: 'Svíčková na smotane s knedľou', cal: 640 },
    { name: 'Tofu stir-fry s rezancami', cal: 320 },
  ]

  const menus = restaurants.slice(0, isWeekday ? 6 : 3).map((r) => {
    const soupIdx = Math.floor(rng() * soups.length)
    const main1Idx = Math.floor(rng() * mains.length)
    let main2Idx = Math.floor(rng() * mains.length)
    while (main2Idx === main1Idx) main2Idx = Math.floor(rng() * mains.length)
    const price = +(4.5 + rng() * 4.5).toFixed(1)

    return {
      restaurant: r.name,
      area: r.area,
      rating: r.rating,
      priceRange: r.priceRange,
      soup: soups[soupIdx],
      dishes: [mains[main1Idx], mains[main2Idx]],
      price,
      available: rng() > 0.15,
      vegetarian: mains[main2Idx].cal < 400,
    }
  })

  return NextResponse.json({
    menus,
    isWeekday,
    dayName: ['Nedeľa', 'Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok', 'Sobota'][dayOfWeek],
    timestamp: Date.now(),
  })
}
