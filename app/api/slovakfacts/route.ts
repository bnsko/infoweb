import { NextResponse } from 'next/server'

export const revalidate = 300 // refresh every 5 min for dynamic facts

// ── Static facts (don't change) ──────────────────────────────────────
const STATIC_FACTS = [
  { icon: '🏔️', title: 'Najvyšší bod', value: 'Gerlachovský štít – 2 655 m', detail: 'Najvyšší vrch Karpát' },
  { icon: '🏰', title: 'Hrady a zámky', value: '180+', detail: 'Najviac hradov na obyvateľa v EÚ' },
  { icon: '👥', title: 'Populácia', value: '5,43 mil.', detail: '110 obyvateľov/km²' },
  { icon: '🗺️', title: 'Rozloha', value: '49 035 km²', detail: 'Porovnateľné s Dánskom' },
  { icon: '🌳', title: 'Lesy', value: '41% územia', detail: 'Jedno z najlesnatejších v EÚ' },
  { icon: '♨️', title: 'Termálne pramene', value: '1 500+', detail: 'Aquapark Tatralandia, Piešťany, Dudince' },
  { icon: '🚗', title: 'Výroba áut', value: '1 mil./rok', detail: 'Najväčší výrobca áut na obyvateľa na svete' },
  { icon: '🍺', title: 'Spotreba piva', value: '~75 l/osoba/rok', detail: 'Top 10 na svete' },
  { icon: '✝️', title: 'UNESCO pamiatky', value: '7 lokalít', detail: 'Vlkolínec, Banská Štiavnica, Spišský hrad' },
  { icon: '🦅', title: 'Národné parky', value: '9 NP', detail: 'TANAP (1949) – najstarší v strednej Európe' },
  { icon: '⛰️', title: 'Jaskyňe', value: '7 000+', detail: '16 sprístupnených, Dobšinská ľadová jaskyňa UNESCO' },
  { icon: '🏒', title: 'Hokej', value: '2x zlato MS', detail: '2002 Gothenburg, národný šport' },
  { icon: '🧀', title: 'Bryndzové halušky', value: 'Národné jedlo', detail: 'Bryndza – chránený pôvod EÚ' },
  { icon: '🎵', title: 'Hymna', value: 'Nad Tatrou sa blýska', detail: 'Jedna z najstarších hymien (1844)' },
  { icon: '🎭', title: 'Folklór', value: 'Východná festival', detail: 'Najväčší folklórny festival v strednej Európe' },
]

// ── Dynamic facts (change throughout the day) ────────────────────────
function getDynamicFacts(): { icon: string; title: string; value: string; detail: string }[] {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const secondsToday = (now.getTime() - startOfDay.getTime()) / 1000
  const fractionOfDay = secondsToday / 86400

  // Slovak average stats (per year) converted to "today so far"
  const birthsPerDay = 150   // ~55k/year
  const deathsPerDay = 145   // ~53k/year
  const weddingsPerDay = 85  // ~31k/year
  const accidentsPerDay = 32 // ~12k/year
  const litersOfBeerPerDay = 1_100_000 // ~400M liters/year
  const carsProducedPerDay = 2_740 // ~1M/year
  const pizzasPerDay = 55_000 // ~20M/year
  const coffeePerDay = 3_500_000 // cups, ~1.3B/year
  const kmDrivenPerDay = 82_000_000 // ~30B km/year
  const trashKgPerDay = 5_900_000 // ~2.15B kg/year

  const births = Math.floor(birthsPerDay * fractionOfDay)
  const deaths = Math.floor(deathsPerDay * fractionOfDay)
  const weddings = Math.floor(weddingsPerDay * fractionOfDay)
  const accidents = Math.floor(accidentsPerDay * fractionOfDay)
  const beer = Math.floor(litersOfBeerPerDay * fractionOfDay)
  const cars = Math.floor(carsProducedPerDay * fractionOfDay)
  const pizzas = Math.floor(pizzasPerDay * fractionOfDay)
  const coffee = Math.floor(coffeePerDay * fractionOfDay)
  const km = Math.floor(kmDrivenPerDay * fractionOfDay)
  const trash = Math.floor(trashKgPerDay * fractionOfDay)

  const fmt = (n: number) => n.toLocaleString('sk-SK')

  return [
    { icon: '👶', title: 'Narodilo sa dnes', value: fmt(births), detail: `~${birthsPerDay} denne v SR` },
    { icon: '⚰️', title: 'Úmrtí dnes', value: fmt(deaths), detail: `~${deathsPerDay} denne v SR` },
    { icon: '💍', title: 'Svadby dnes', value: fmt(weddings), detail: `~${weddingsPerDay} denne (priemer)` },
    { icon: '🚨', title: 'Nehody dnes', value: fmt(accidents), detail: `~${accidentsPerDay} denne v SR` },
    { icon: '🍺', title: 'Litrov piva dnes', value: fmt(beer), detail: `${fmt(litersOfBeerPerDay)} l/deň` },
    { icon: '🚗', title: 'Áut vyrobených', value: fmt(cars), detail: `~${fmt(carsProducedPerDay)} denne` },
    { icon: '🍕', title: 'Pizz zjedených', value: fmt(pizzas), detail: `~${fmt(pizzasPerDay)} denne v SR` },
    { icon: '☕', title: 'Káv vypitých', value: fmt(coffee), detail: `~${fmt(coffeePerDay)} šálok/deň` },
    { icon: '🛣️', title: 'Km najazdených', value: fmt(km), detail: `~${fmt(kmDrivenPerDay)} km/deň` },
    { icon: '🗑️', title: 'Kg odpadu', value: fmt(trash), detail: `~${fmt(trashKgPerDay)} kg/deň` },
  ]
}

export async function GET() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)

  // Rotate 6 static facts per day
  const startIdx = (dayOfYear * 3) % STATIC_FACTS.length
  const staticFacts = []
  for (let i = 0; i < 6; i++) {
    staticFacts.push(STATIC_FACTS[(startIdx + i) % STATIC_FACTS.length])
  }

  // Dynamic facts (all, let widget pick)
  const dynamicFacts = getDynamicFacts()

  const generalStats = {
    area: 49035,
    population: 5430000,
    castles: 180,
    thermalSprings: 1500,
    carsPerYear: 1000000,
    unescoSites: 7,
    nationalParks: 9,
    caves: 7000,
  }

  return NextResponse.json({ staticFacts, dynamicFacts, generalStats, dayOfYear })
}
