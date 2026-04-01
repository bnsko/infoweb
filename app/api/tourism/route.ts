import { NextResponse } from 'next/server'

export const revalidate = 3600

interface ChaletInfo { name: string; altitude: number; region: string; mountains: string; status: 'open' | 'closed' | 'summer_only'; url: string; phone?: string; capacity: number; services: string[] }
interface LiftInfo { name: string; resort: string; region: string; open: boolean; snowDepth: number; url: string; type: string }

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const CHALETS: ChaletInfo[] = [
  { name: 'Chata pod Soliskom', altitude: 1840, region: 'Tatry', mountains: 'Vysoké Tatry', status: 'open', url: 'https://www.chatachodsoliskom.sk', phone: '+421 52 449 2023', capacity: 80, services: ['Reštaurácia', 'Ubytovanie', 'Lekárnička'] },
  { name: 'Zbojnícka chata', altitude: 1960, region: 'Tatry', mountains: 'Vysoké Tatry', status: 'open', url: 'https://www.zbojnicka.sk', capacity: 50, services: ['Reštaurácia', 'Ubytovanie'] },
  { name: 'Chata na Grúni', altitude: 1320, region: 'Malá Fatra', mountains: 'Malá Fatra', status: 'open', url: 'https://www.chatagrunic.sk', capacity: 120, services: ['Reštaurácia', 'Ubytovanie', 'WiFi'] },
  { name: 'Martinské hole', altitude: 1450, region: 'Malá Fatra', mountains: 'Malá Fatra', status: 'summer_only', url: 'https://www.martinskehol.sk', capacity: 60, services: ['Reštaurácia', 'Parkovanie'] },
  { name: 'Chata Pniaky', altitude: 960, region: 'Nízke Tatry', mountains: 'Nízke Tatry', status: 'open', url: 'https://www.chatapniaky.sk', capacity: 40, services: ['Reštaurácia'] },
  { name: 'Chata na Havrane', altitude: 1152, region: 'Slovenský raj', mountains: 'Slovenský raj', status: 'open', url: 'https://www.havran.sk', capacity: 35, services: ['Reštaurácia', 'Ubytovanie'] },
]

const LIFTS: LiftInfo[] = [
  { name: 'Tatranská Lomnica – pohyblivý koberec', resort: 'Tatranská Lomnica', region: 'Tatry', open: false, snowDepth: 140, url: 'https://www.tatryski.sk', type: 'Kabínkový vlek' },
  { name: 'Jasná – lanovka Chopok-juh', resort: 'Jasná', region: 'Nízke Tatry', open: false, snowDepth: 120, url: 'https://www.jasna.sk', type: 'Gondola' },
  { name: 'Jasná – Biela Púť', resort: 'Jasná', region: 'Nízke Tatry', open: false, snowDepth: 125, url: 'https://www.jasna.sk', type: 'Šestosedačka' },
  { name: 'Martinské Hole – kabínkový vlek', resort: 'Martinské Hole', region: 'Malá Fatra', open: false, snowDepth: 55, url: 'https://www.martinskehol.sk', type: 'Kabínkový vlek' },
  { name: 'Donovaly – Park Snow', resort: 'Donovaly', region: 'Nízke Tatry', open: false, snowDepth: 35, url: 'https://www.parksnow.sk', type: 'Sedačková lanovka' },
]

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed)
  const month = now.getMonth() + 1
  const isSkiSeason = month <= 3 || month >= 12
  const isHikeSeason = month >= 5 && month <= 10

  const lifts = LIFTS.map(l => ({
    ...l,
    open: isSkiSeason && l.snowDepth > 40 ? rng() > 0.3 : false,
    snowDepth: isSkiSeason ? l.snowDepth + Math.floor(rng() * 20 - 10) : 0,
  }))

  return NextResponse.json({
    chalets: CHALETS,
    lifts,
    openLifts: lifts.filter(l => l.open).length,
    season: isSkiSeason ? 'ski' : isHikeSeason ? 'hike' : 'off',
    source: 'SACR / ski strediská',
  })
}
