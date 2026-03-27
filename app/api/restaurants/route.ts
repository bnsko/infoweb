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
}

// Curated real recommended restaurants in Bratislava
const RESTAURANTS: Restaurant[] = [
  { name: 'Fúrés', cuisine: 'Slovenská / Modern', rating: 4.8, priceRange: '€€€', location: 'Staré Mesto', description: 'Moderná slovenská kuchyňa s lokálnymi sezónnymi surovinami', url: 'https://www.google.com/maps/search/Fures+Bratislava' },
  { name: 'Savoy', cuisine: 'Medzinárodná', rating: 4.7, priceRange: '€€€', location: 'Staré Mesto', description: 'Elegantná reštaurácia s výborným výberom vín a steakov', url: 'https://www.google.com/maps/search/Savoy+Bratislava' },
  { name: 'Modrá Hviezda', cuisine: 'Slovenská', rating: 4.6, priceRange: '€€', location: 'Staré Mesto', description: 'Tradičná slovenská kuchyňa v historickej budove pod hradom', url: 'https://www.google.com/maps/search/Modra+Hviezda+Bratislava' },
  { name: 'Bratislavský Meštiansky Pivovar', cuisine: 'Slovenská / Pivárska', rating: 4.5, priceRange: '€€', location: 'Staré Mesto', description: 'Remeselné pivo varené priamo na mieste a tradičné jedlo', url: 'https://www.google.com/maps/search/Bratislavsky+Mestiansky+Pivovar' },
  { name: 'Flagship', cuisine: 'Medzinárodná / Burger', rating: 4.7, priceRange: '€€', location: 'Ružinov', description: 'Najlepšie burgery v Bratislave, čerstvé suroviny', url: 'https://www.google.com/maps/search/Flagship+Restaurant+Bratislava' },
  { name: 'Fabrika The Eatery', cuisine: 'Fusion', rating: 4.6, priceRange: '€€', location: 'Staré Mesto', description: 'Kreatívna fusion kuchyňa v industriálnom priestore', url: 'https://www.google.com/maps/search/Fabrika+The+Eatery+Bratislava' },
  { name: 'Zylinder', cuisine: 'Stredoeurópska', rating: 4.5, priceRange: '€€€', location: 'Staré Mesto', description: 'Stredoeurópska klasika v tichom prostredí Hviezdoslavovho námestia', url: 'https://www.google.com/maps/search/Zylinder+Bratislava' },
  { name: 'SKY Bar & Restaurant', cuisine: 'Medzinárodná', rating: 4.4, priceRange: '€€€', location: 'Staré Mesto', description: 'Panoramatický výhľad na Bratislavu z 24. poschodia', url: 'https://www.google.com/maps/search/SKY+Bar+Restaurant+Bratislava' },
  { name: 'Hradná Hviezda', cuisine: 'Slovenská / Grécka', rating: 4.3, priceRange: '€€', location: 'Staré Mesto', description: 'Terasa s výhľadom na Dunaj pod Bratislavským hradom', url: 'https://www.google.com/maps/search/Hradna+Hviezda+Bratislava' },
  { name: 'KORZO Gastropub', cuisine: 'Gastropub', rating: 4.5, priceRange: '€€', location: 'Staré Mesto', description: 'Moderný gastropub servírujúci lokálne špeciality a craft pivo', url: 'https://www.google.com/maps/search/KORZO+Gastropub+Bratislava' },
]

export async function GET() {
  return NextResponse.json({ restaurants: RESTAURANTS })
}
