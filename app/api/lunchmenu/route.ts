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
    // Bratislava - centre
    { name: 'Koliba u Medveďa', area: 'Staré Mesto', city: 'Bratislava', rating: 4.5, priceRange: '€€', cuisine: 'Slovenská', url: 'https://www.google.com/maps/search/Koliba+u+Medveda+Bratislava', wolt: null, bolt: null },
    { name: 'Pizzeria Basilico', area: 'Ružinov', city: 'Bratislava', rating: 4.3, priceRange: '€', cuisine: 'Talianska', url: 'https://www.google.com/maps/search/Pizzeria+Basilico+Bratislava', wolt: 'https://wolt.com/sk/svk/bratislava', bolt: null },
    { name: 'Jedáleň u Babky', area: 'Petržalka', city: 'Bratislava', rating: 4.1, priceRange: '€', cuisine: 'Domáca', url: 'https://www.google.com/maps/search/Jedalnen+u+Babky+Bratislava', wolt: null, bolt: null },
    { name: 'Vietnamese Pho', area: 'Nové Mesto', city: 'Bratislava', rating: 4.6, priceRange: '€', cuisine: 'Vietnamská', url: 'https://www.google.com/maps/search/Vietnamese+Pho+Bratislava', wolt: 'https://wolt.com/sk/svk/bratislava', bolt: null },
    { name: 'Bistro Zelený Dvor', area: 'Karlova Ves', city: 'Bratislava', rating: 4.4, priceRange: '€€', cuisine: 'Stredoeurópska', url: 'https://www.google.com/maps/search/Bistro+Zeleny+Dvor+Bratislava', wolt: null, bolt: null },
    { name: 'Gastro Pub Central', area: 'Centrum', city: 'Bratislava', rating: 4.2, priceRange: '€€', cuisine: 'Americká', url: 'https://www.google.com/maps/search/Gastro+Pub+Central+Bratislava', wolt: null, bolt: 'https://food.bolt.eu/sk/bratislava' },
    { name: 'Sushi Point', area: 'Mlynské Nivy', city: 'Bratislava', rating: 4.7, priceRange: '€€€', cuisine: 'Japonská', url: 'https://www.google.com/maps/search/Sushi+Point+Bratislava', wolt: 'https://wolt.com/sk/svk/bratislava', bolt: 'https://food.bolt.eu/sk/bratislava' },
    { name: 'Veggie Corner', area: 'Obchodná', city: 'Bratislava', rating: 4.0, priceRange: '€', cuisine: 'Vegetariánska', url: 'https://www.google.com/maps/search/Veggie+Corner+Bratislava', wolt: 'https://wolt.com/sk/svk/bratislava', bolt: null },
    { name: 'Reštaurácia Lomnická', area: 'Staré Mesto', city: 'Bratislava', rating: 4.3, priceRange: '€€', cuisine: 'Slovenská', url: 'https://www.google.com/maps/search/Lomnicka+Bratislava', wolt: null, bolt: null },
    { name: 'Burgeria BRGR', area: 'Centrum', city: 'Bratislava', rating: 4.5, priceRange: '€€', cuisine: 'Hamburgery', url: 'https://www.google.com/maps/search/BRGR+Bratislava', wolt: 'https://wolt.com/sk/svk/bratislava', bolt: 'https://food.bolt.eu/sk/bratislava' },
    { name: 'Thai Garden', area: 'Ružinov', city: 'Bratislava', rating: 4.4, priceRange: '€€', cuisine: 'Thajská', url: 'https://www.google.com/maps/search/Thai+Garden+Bratislava', wolt: 'https://wolt.com/sk/svk/bratislava', bolt: null },
    { name: 'Mexická taquerí', area: 'Staré Mesto', city: 'Bratislava', rating: 4.2, priceRange: '€€', cuisine: 'Mexická', url: 'https://www.google.com/maps/search/Mexican+Taqueria+Bratislava', wolt: null, bolt: 'https://food.bolt.eu/sk/bratislava' },
    { name: 'Indian Palace', area: 'Legionárska', city: 'Bratislava', rating: 4.3, priceRange: '€€', cuisine: 'Indická', url: 'https://www.google.com/maps/search/Indian+Palace+Bratislava', wolt: 'https://wolt.com/sk/svk/bratislava', bolt: null },
    { name: 'Le Monde Bistro', area: 'Staré Mesto', city: 'Bratislava', rating: 4.6, priceRange: '€€€', cuisine: 'Francúzska', url: 'https://www.google.com/maps/search/Le+Monde+Bistro+Bratislava', wolt: null, bolt: null },
    { name: 'Mandarin Restaurant', area: 'Aupark', city: 'Bratislava', rating: 4.1, priceRange: '€€', cuisine: 'Čínska', url: 'https://www.google.com/maps/search/Mandarin+Restaurant+Bratislava', wolt: 'https://wolt.com/sk/svk/bratislava', bolt: null },
    { name: 'Spicy Street Food', area: 'Eurovea', city: 'Bratislava', rating: 4.0, priceRange: '€', cuisine: 'Street Food', url: 'https://www.google.com/maps/search/Spicy+Street+Food+Bratislava', wolt: 'https://wolt.com/sk/svk/bratislava', bolt: 'https://food.bolt.eu/sk/bratislava' },
    { name: 'Kaviareň & Bistro Moment', area: 'Staré Mesto', city: 'Bratislava', rating: 4.4, priceRange: '€€', cuisine: 'Kaviareň', url: 'https://www.google.com/maps/search/Bistro+Moment+Bratislava', wolt: null, bolt: null },
    { name: 'Zdravá Reštaurácia', area: 'Petržalka', city: 'Bratislava', rating: 4.2, priceRange: '€', cuisine: 'Zdravá', url: 'https://www.google.com/maps/search/Zdrava+Restauracia+Bratislava', wolt: null, bolt: null },
    { name: 'Rybí Bistro', area: 'Centrum', city: 'Bratislava', rating: 4.5, priceRange: '€€€', cuisine: 'Ryby', url: 'https://www.google.com/maps/search/Rybi+Bistro+Bratislava', wolt: 'https://wolt.com/sk/svk/bratislava', bolt: null },
    { name: 'Denná Jedáleň Atrium', area: 'Ružinov', city: 'Bratislava', rating: 3.9, priceRange: '€', cuisine: 'Domáca', url: 'https://www.google.com/maps/search/Dejna+Jedalen+Atrium+Bratislava', wolt: null, bolt: null },
    // Košice
    { name: 'Reštaurácia Čas', area: 'Staré Mesto', city: 'Košice', rating: 4.3, priceRange: '€', cuisine: 'Slovenská', url: 'https://www.google.com/maps/search/Restauracia+Cas+Kosice', wolt: null, bolt: null },
    { name: 'Pivnica Aida', area: 'Centrum', city: 'Košice', rating: 4.5, priceRange: '€€', cuisine: 'Stredoeurópska', url: 'https://www.google.com/maps/search/Pivnica+Aida+Kosice', wolt: null, bolt: null },
    { name: 'Kaukazská Jedáleň', area: 'Západ', city: 'Košice', rating: 4.2, priceRange: '€€', cuisine: 'Gruzínska', url: 'https://www.google.com/maps/search/Kaukazska+Jedalka+Kosice', wolt: null, bolt: null },
    { name: 'Mexická jedáleň Kosice', area: 'Juh', city: 'Košice', rating: 4.1, priceRange: '€', cuisine: 'Mexická', url: 'https://www.google.com/maps/search/Mexican+Kosice', wolt: null, bolt: null },
    // Žilina
    { name: 'Pizzeria Al Capone', area: 'Centrum', city: 'Žilina', rating: 4.2, priceRange: '€', cuisine: 'Talianska', url: 'https://www.google.com/maps/search/Pizzeria+Al+Capone+Zilina', wolt: null, bolt: null },
    { name: 'Reštaurácia Fontána', area: 'Staré Mesto', city: 'Žilina', rating: 4.4, priceRange: '€€', cuisine: 'Slovenská', url: 'https://www.google.com/maps/search/Restauracia+Fontana+Zilina', wolt: null, bolt: null },
    { name: 'Grill House Žilina', area: 'Vlčince', city: 'Žilina', rating: 4.0, priceRange: '€€', cuisine: 'Grill', url: 'https://www.google.com/maps/search/Grill+House+Zilina', wolt: null, bolt: null },
    // Nitra
    { name: 'Buffet Nitra', area: 'Centrum', city: 'Nitra', rating: 4.0, priceRange: '€', cuisine: 'Domáca', url: 'https://www.google.com/maps/search/Buffet+Nitra', wolt: null, bolt: null },
    { name: 'Reštaurácia U Martina', area: 'Staré Mesto', city: 'Nitra', rating: 4.3, priceRange: '€€', cuisine: 'Slovenská', url: 'https://www.google.com/maps/search/Restauracia+U+Martina+Nitra', wolt: null, bolt: null },
    { name: 'Pasta e Vino Nitra', area: 'Centrum', city: 'Nitra', rating: 4.2, priceRange: '€€', cuisine: 'Talianska', url: 'https://www.google.com/maps/search/Pasta+Vino+Nitra', wolt: null, bolt: null },
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
      cuisine: r.cuisine,
      url: r.url,
      wolt: r.wolt,
      bolt: r.bolt,
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
