import { NextResponse } from 'next/server'

export const revalidate = 3600

interface Restaurant {
  name: string
  cuisine: string
  rating: number
  priceRange: string
  location: string
  description: string
  url: string
  city: string
  tags?: string[]
  photoUrl?: string
}

// Deterministic pseudo-distance based on restaurant name (0.2–4.5 km from city center)
function calcDistance(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffff
  }
  return Math.round((0.2 + (hash % 43) * 0.1) * 10) / 10
}

// Generate a deterministic food photo URL from cuisine keywords
function foodPhoto(cuisine: string, idx: number): string {
  const keywords: Record<string, string> = {
    'slovenská': 'traditional-food', 'medzinárodná': 'fine-dining', 'francúzska': 'french-cuisine',
    'talianska': 'italian-pasta', 'mexická': 'mexican-food', 'ázijská': 'asian-food',
    'vegánska': 'vegan-food', 'vegetariánska': 'vegetarian-food', 'burger': 'burger',
    'steakhouse': 'steak', 'pizza': 'pizza', 'gastropub': 'pub-food', 'fusion': 'fusion-food',
    'kaviareň': 'coffee-brunch', 'grill': 'grilled-meat', 'pivárska': 'beer-food',
    'healthy': 'healthy-food',
  }
  const lower = cuisine.toLowerCase()
  let kw = 'restaurant-food'
  for (const [k, v] of Object.entries(keywords)) {
    if (lower.includes(k)) { kw = v; break }
  }
  return `https://source.unsplash.com/400x300/?${kw}&sig=${idx}`
}

// Curated real restaurants for all regional capitals
const ALL_RESTAURANTS: Restaurant[] = [
  // Bratislava
  { name: 'Fúrés', cuisine: 'Slovenská / Modern', rating: 4.8, priceRange: '€€€', location: 'Staré Mesto', description: 'Moderná slovenská kuchyňa s lokálnymi sezónnymi surovinami', url: 'https://www.google.com/maps/search/Fures+Bratislava', city: 'bratislava' },
  { name: 'Savoy', cuisine: 'Medzinárodná', rating: 4.7, priceRange: '€€€', location: 'Staré Mesto', description: 'Elegantná reštaurácia s výborným výberom vín a steakov', url: 'https://www.google.com/maps/search/Savoy+Bratislava', city: 'bratislava' },
  { name: 'Modrá Hviezda', cuisine: 'Slovenská', rating: 4.6, priceRange: '€€', location: 'Staré Mesto', description: 'Tradičná slovenská kuchyňa v historickej budove pod hradom', url: 'https://www.google.com/maps/search/Modra+Hviezda+Bratislava', city: 'bratislava' },
  { name: 'Bratislavský Meštiansky Pivovar', cuisine: 'Slovenská / Pivárska', rating: 4.5, priceRange: '€€', location: 'Staré Mesto', description: 'Remeselné pivo varené priamo na mieste a tradičné jedlo', url: 'https://www.google.com/maps/search/Bratislavsky+Mestiansky+Pivovar', city: 'bratislava' },
  { name: 'Flagship', cuisine: 'Medzinárodná / Burger', rating: 4.7, priceRange: '€€', location: 'Ružinov', description: 'Najlepšie burgery v Bratislave, čerstvé suroviny', url: 'https://www.google.com/maps/search/Flagship+Restaurant+Bratislava', city: 'bratislava' },
  { name: 'Fabrika The Eatery', cuisine: 'Fusion', rating: 4.6, priceRange: '€€', location: 'Staré Mesto', description: 'Kreatívna fusion kuchyňa v industriálnom priestore', url: 'https://www.google.com/maps/search/Fabrika+The+Eatery+Bratislava', city: 'bratislava' },
  { name: 'Zylinder', cuisine: 'Stredoeurópska', rating: 4.5, priceRange: '€€€', location: 'Staré Mesto', description: 'Stredoeurópska klasika na Hviezdoslavovom námestí', url: 'https://www.google.com/maps/search/Zylinder+Bratislava', city: 'bratislava' },
  { name: 'SKY Bar & Restaurant', cuisine: 'Medzinárodná', rating: 4.4, priceRange: '€€€', location: 'Staré Mesto', description: 'Panoramatický výhľad na Bratislavu z 24. poschodia', url: 'https://www.google.com/maps/search/SKY+Bar+Restaurant+Bratislava', city: 'bratislava' },
  { name: 'Hradná Hviezda', cuisine: 'Slovenská / Grécka', rating: 4.3, priceRange: '€€', location: 'Staré Mesto', description: 'Terasa s výhľadom na Dunaj pod Bratislavským hradom', url: 'https://www.google.com/maps/search/Hradna+Hviezda+Bratislava', city: 'bratislava' },
  { name: 'KORZO Gastropub', cuisine: 'Gastropub', rating: 4.5, priceRange: '€€', location: 'Staré Mesto', description: 'Moderný gastropub servírujúci lokálne špeciality a craft pivo', url: 'https://www.google.com/maps/search/KORZO+Gastropub+Bratislava', city: 'bratislava' },
  { name: 'U Kubistu', cuisine: 'Slovenská', rating: 4.2, priceRange: '€', location: 'Staré Mesto', description: 'Jednoduché a autentické slovenské jedlá za rozumnú cenu', url: 'https://www.google.com/maps/search/U+Kubistu+Bratislava', city: 'bratislava' },
  // Bratislava - veg/vegan
  { name: 'Veg Life', cuisine: 'Vegánska', rating: 4.7, priceRange: '€', location: 'Staré Mesto', description: 'Plne vegánska reštaurácia s dennými menu a raw dezertmi', url: 'https://www.google.com/maps/search/Veg+Life+Bratislava', city: 'bratislava', tags: ['vegan'] },
  { name: 'Green Buddha', cuisine: 'Ázijská / Vegánska', rating: 4.6, priceRange: '€€', location: 'Staré Mesto', description: 'Ázijská vegánska kuchyňa, tofu, tempeh a čerstvé šaláty', url: 'https://www.google.com/maps/search/Green+Buddha+Bratislava', city: 'bratislava', tags: ['vegan'] },
  { name: 'Veggie Garden', cuisine: 'Vegetariánska', rating: 4.5, priceRange: '€', location: 'Ružinov', description: 'Vegetariánske obedy s bohatým saládovým barom', url: 'https://www.google.com/maps/search/Veggie+Garden+Bratislava', city: 'bratislava', tags: ['vegetarian'] },
  { name: 'Nutri Bistro', cuisine: 'Healthy / Vegan', rating: 4.4, priceRange: '€€', location: 'Nové Mesto', description: 'Zdravé jedlá, smoothie bowls, vegánske koláče', url: 'https://www.google.com/maps/search/Nutri+Bistro+Bratislava', city: 'bratislava', tags: ['vegan'] },
  // Košice
  { name: 'Med Malina', cuisine: 'Medzinárodná', rating: 4.7, priceRange: '€€€', location: 'Centrum', description: 'Fine dining reštaurácia s degustačným menu', url: 'https://www.google.com/maps/search/Med+Malina+Kosice', city: 'kosice' },
  { name: 'Villa Regia', cuisine: 'Slovenská / Medzinárodná', rating: 4.6, priceRange: '€€', location: 'Hlavná', description: 'Elegantná reštaurácia v historickej budove na Hlavnej', url: 'https://www.google.com/maps/search/Villa+Regia+Kosice', city: 'kosice' },
  { name: 'Hostinec', cuisine: 'Slovenská', rating: 4.5, priceRange: '€', location: 'Centrum', description: 'Tradičná slovenská kuchyňa v útulnom prostredí', url: 'https://www.google.com/maps/search/Hostinec+Kosice', city: 'kosice' },
  { name: 'Kaviareň Slávia', cuisine: 'Kaviareň / Bistro', rating: 4.4, priceRange: '€€', location: 'Hlavná', description: 'Ikonická košická kaviareň s bohatým brunčom', url: 'https://www.google.com/maps/search/Kaviaren+Slavia+Kosice', city: 'kosice' },
  { name: 'Twelve Sport Bar & Grill', cuisine: 'Americká / Grill', rating: 4.3, priceRange: '€€', location: 'Centrum', description: 'Výborné burgery a steak v športovej atmosfére', url: 'https://www.google.com/maps/search/Twelve+Sport+Bar+Kosice', city: 'kosice' },
  { name: 'Ajvega', cuisine: 'Vegánska', rating: 4.5, priceRange: '€', location: 'Centrum', description: 'Vegánske jedlá a raw dezerty v centre Košíc', url: 'https://www.google.com/maps/search/Ajvega+Kosice', city: 'kosice', tags: ['vegan'] },
  // Žilina
  { name: 'Brasserie', cuisine: 'Francúzska / Modern', rating: 4.6, priceRange: '€€€', location: 'Centrum', description: 'Francúzsky inšpirovaná kuchyňa s modernými prvkami', url: 'https://www.google.com/maps/search/Brasserie+Zilina', city: 'zilina' },
  { name: 'Majolika', cuisine: 'Slovenská / Modern', rating: 4.5, priceRange: '€€', location: 'Centrum', description: 'Slovenská kuchyňa v modernom prevedení', url: 'https://www.google.com/maps/search/Majolika+Zilina', city: 'zilina' },
  { name: 'Gastro pub Bagetéria', cuisine: 'Gastropub', rating: 4.3, priceRange: '€', location: 'Námestie', description: 'Obľúbený gastropub na námestí s denným menu', url: 'https://www.google.com/maps/search/Bageteria+Zilina', city: 'zilina' },
  { name: 'Čínsky Mur', cuisine: 'Ázijská', rating: 4.2, priceRange: '€', location: 'Centrum', description: 'Obľúbená ázijská reštaurácia s veľkými porciami', url: 'https://www.google.com/maps/search/Cinsky+Mur+Zilina', city: 'zilina' },
  // Prešov
  { name: 'Šariš Park', cuisine: 'Slovenská', rating: 4.5, priceRange: '€€', location: 'Centrum', description: 'Tradičné šarišské špeciality v modernom prostredí', url: 'https://www.google.com/maps/search/Saris+Park+Presov', city: 'presov' },
  { name: 'Carnevalle', cuisine: 'Talianska', rating: 4.4, priceRange: '€€', location: 'Hlavná', description: 'Autentická talianska pizza a pasta', url: 'https://www.google.com/maps/search/Carnevalle+Presov', city: 'presov' },
  { name: 'Piváreň Šariš', cuisine: 'Slovenská / Pivárska', rating: 4.3, priceRange: '€', location: 'Centrum', description: 'Pivná reštaurácia s lokálnym pivom Šariš', url: 'https://www.google.com/maps/search/Pivaren+Saris+Presov', city: 'presov' },
  // Nitra
  { name: 'Taberna Taran', cuisine: 'Medzinárodná', rating: 4.5, priceRange: '€€€', location: 'Centrum', description: 'Prémiová reštaurácia s medzinárodnou kuchyňou', url: 'https://www.google.com/maps/search/Taberna+Taran+Nitra', city: 'nitra' },
  { name: 'Mexita', cuisine: 'Mexická', rating: 4.4, priceRange: '€€', location: 'Centrum', description: 'Mexická kuchyňa s čerstvými surovinami', url: 'https://www.google.com/maps/search/Mexita+Nitra', city: 'nitra' },
  { name: 'Artin', cuisine: 'Slovenská', rating: 4.3, priceRange: '€', location: 'Staré Mesto', description: 'Tradičná slovenská kuchyňa s domácou atmosférou', url: 'https://www.google.com/maps/search/Artin+Nitra', city: 'nitra' },
  // Banská Bystrica
  { name: 'Barbakan', cuisine: 'Slovenská / Stredoeurópska', rating: 4.6, priceRange: '€€', location: 'Námestie SNP', description: 'Historická reštaurácia v srdci mesta', url: 'https://www.google.com/maps/search/Barbakan+Banska+Bystrica', city: 'bystrica' },
  { name: 'Lúčny dvor', cuisine: 'Slovenská', rating: 4.4, priceRange: '€€', location: 'Centrum', description: 'Tradičné slovenské jedlá v rustikálnom prostredí', url: 'https://www.google.com/maps/search/Lucny+Dvor+Banska+Bystrica', city: 'bystrica' },
  { name: 'Black Rose', cuisine: 'Steakhouse', rating: 4.5, priceRange: '€€€', location: 'Centrum', description: 'Prémiový steakhouse s výborným výberom vín', url: 'https://www.google.com/maps/search/Black+Rose+Banska+Bystrica', city: 'bystrica' },
  // Trnava
  { name: 'Patriot', cuisine: 'Slovenská / Modern', rating: 4.5, priceRange: '€€', location: 'Centrum', description: 'Moderná slovenská kuchyňa v historickom centre', url: 'https://www.google.com/maps/search/Patriot+Trnava', city: 'trnava' },
  { name: 'Jama Pub', cuisine: 'Gastropub', rating: 4.3, priceRange: '€', location: 'Centrum', description: 'Obľúbený trnavský pub s výborným jedlom', url: 'https://www.google.com/maps/search/Jama+Pub+Trnava', city: 'trnava' },
  { name: 'Veda', cuisine: 'Talianska / Pizza', rating: 4.4, priceRange: '€€', location: 'Centrum', description: 'Najlepšia pizza v Trnave, pec na drevo', url: 'https://www.google.com/maps/search/Veda+Trnava', city: 'trnava' },
  // Trenčín
  { name: 'Elizabeth', cuisine: 'Medzinárodná', rating: 4.5, priceRange: '€€€', location: 'Centrum', description: 'Hotelová reštaurácia s medzinárodnou kuchyňou pod hradom', url: 'https://www.google.com/maps/search/Elizabeth+Trencin', city: 'trencin' },
  { name: 'Pod Hradom', cuisine: 'Slovenská', rating: 4.4, priceRange: '€€', location: 'Centrum', description: 'Tradičné jedlá s výhľadom na Trenčiansky hrad', url: 'https://www.google.com/maps/search/Pod+Hradom+Trencin', city: 'trencin' },
  { name: 'Lanius Gastropub', cuisine: 'Gastropub', rating: 4.3, priceRange: '€', location: 'Centrum', description: 'Craft pivo a kvalitné gastropubové jedlá', url: 'https://www.google.com/maps/search/Lanius+Gastropub+Trencin', city: 'trencin' },
]

const CITY_NAMES: Record<string, string> = {
  'bratislava': 'Bratislava',
  'kosice': 'Košice',
  'zilina': 'Žilina',
  'presov': 'Prešov',
  'nitra': 'Nitra',
  'bystrica': 'Banská Bystrica',
  'trnava': 'Trnava',
  'trencin': 'Trenčín',
}

const VALID_CITIES = Object.keys(CITY_NAMES)
const VALID_PRICES = ['all', '€', '€€', '€€€']
const VALID_DIETS = ['all', 'vegetarian', 'vegan']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawCity = searchParams.get('city') ?? 'bratislava'
  const rawPrice = searchParams.get('price') ?? 'all'
  const rawDiet = searchParams.get('diet') ?? 'all'
  const city = VALID_CITIES.includes(rawCity) ? rawCity : 'bratislava'
  const price = VALID_PRICES.includes(rawPrice) ? rawPrice : 'all'
  const diet = VALID_DIETS.includes(rawDiet) ? rawDiet : 'all'

  let restaurants = ALL_RESTAURANTS.filter(r => r.city === city)
  if (price !== 'all') {
    restaurants = restaurants.filter(r => r.priceRange === price)
  }
  if (diet === 'vegan') {
    restaurants = restaurants.filter(r => r.tags?.includes('vegan'))
  } else if (diet === 'vegetarian') {
    restaurants = restaurants.filter(r => r.tags?.includes('vegetarian') || r.tags?.includes('vegan'))
  }

  return NextResponse.json({
    restaurants: restaurants.map((r, i) => ({
      ...r,
      distance: calcDistance(r.name),
      photoUrl: r.photoUrl || foodPhoto(r.cuisine, i),
    })),
    city,
    cityName: CITY_NAMES[city],
    cities: Object.entries(CITY_NAMES).map(([key, name]) => ({ key, name })),
  })
}
