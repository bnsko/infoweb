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
    { name: 'Koliba u Medveďa', area: 'Staré Mesto', city: 'Bratislava', rating: 4.5, priceRange: '€€', url: 'https://www.google.com/maps/search/Koliba+u+Medveda+Bratislava', phone: '+421 2 5443 0111' },
    { name: 'Pizzeria Basilico', area: 'Ružinov', city: 'Bratislava', rating: 4.3, priceRange: '€', url: 'https://www.google.com/maps/search/Pizzeria+Basilico+Bratislava', phone: null },
    { name: 'Jedáleň u Babky', area: 'Petržalka', city: 'Bratislava', rating: 4.1, priceRange: '€', url: 'https://www.google.com/maps/search/Jedalnen+u+Babky+Bratislava', phone: null },
    { name: 'Vietnamese Pho', area: 'Nové Mesto', city: 'Bratislava', rating: 4.6, priceRange: '€', url: 'https://www.google.com/maps/search/Vietnamese+Pho+Bratislava', phone: null },
    { name: 'Bistro Zelený Dvor', area: 'Karlova Ves', city: 'Bratislava', rating: 4.4, priceRange: '€€', url: 'https://www.google.com/maps/search/Bistro+Zeleny+Dvor+Bratislava', phone: null },
    { name: 'Gastro Pub Central', area: 'Centrum', city: 'Bratislava', rating: 4.2, priceRange: '€€', url: 'https://www.google.com/maps/search/Gastro+Pub+Central+Bratislava', phone: null },
    { name: 'Sushi Point', area: 'Mlynské Nivy', city: 'Bratislava', rating: 4.7, priceRange: '€€€', url: 'https://www.google.com/maps/search/Sushi+Point+Bratislava', phone: null },
    { name: 'Veggie Corner', area: 'Obchodná', city: 'Bratislava', rating: 4.0, priceRange: '€', url: 'https://www.google.com/maps/search/Veggie+Corner+Bratislava', phone: null },
    // Košice
    { name: 'Reštaurácia Čas', area: 'Staré Mesto', city: 'Košice', rating: 4.3, priceRange: '€', url: 'https://www.google.com/maps/search/Restauracia+Cas+Kosice', phone: null },
    { name: 'Pivnica Aida', area: 'Centrum', city: 'Košice', rating: 4.5, priceRange: '€€', url: 'https://www.google.com/maps/search/Pivnica+Aida+Kosice', phone: null },
    // Žilina
    { name: 'Pizzeria Al Capone', area: 'Centrum', city: 'Žilina', rating: 4.2, priceRange: '€', url: 'https://www.google.com/maps/search/Pizzeria+Al+Capone+Zilina', phone: null },
    { name: 'Reštaurácia Fontána', area: 'Staré Mesto', city: 'Žilina', rating: 4.4, priceRange: '€€', url: 'https://www.google.com/maps/search/Restauracia+Fontana+Zilina', phone: null },
    // Nitra
    { name: 'Buffet Nitra', area: 'Centrum', city: 'Nitra', rating: 4.0, priceRange: '€', url: 'https://www.google.com/maps/search/Buffet+Nitra', phone: null },
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

  const menus = restaurants.map((r) => {
    const soupIdx = Math.floor(rng() * soups.length)
    const main1Idx = Math.floor(rng() * mains.length)
    let main2Idx = Math.floor(rng() * mains.length)
    while (main2Idx === main1Idx) main2Idx = Math.floor(rng() * mains.length)
    const price = +(4.5 + rng() * 4.5).toFixed(1)

    return {
      restaurant: r.name,
      area: r.area,
      city: r.city,
      rating: r.rating,
      priceRange: r.priceRange,
      url: r.url,
      soup: soups[soupIdx],
      dishes: [mains[main1Idx], mains[main2Idx]],
      price,
      available: isWeekday ? rng() > 0.15 : rng() > 0.6,
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
