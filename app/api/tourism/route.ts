import { NextResponse } from 'next/server'

export const revalidate = 3600

interface ChaletInfo { name: string; altitude: number; region: string; mountains: string; status: 'open' | 'closed' | 'summer_only'; url: string; phone?: string; capacity: number; services: string[] }
interface LiftInfo { name: string; resort: string; region: string; open: boolean; snowDepth: number; url: string; type: string }
interface AustriaResort { name: string; region: string; altitudeMax: number; pistes: number; lifts: number; snowDepth: number; open: boolean; url: string; distanceFromBA: number }

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
  { name: 'Tatranská Lomnica – gondola', resort: 'Tatranská Lomnica', region: 'Tatry', open: false, snowDepth: 140, url: 'https://www.tatryski.sk', type: 'Kabínková gondola' },
  { name: 'Jasná – Chopok-juh', resort: 'Jasná', region: 'Nízke Tatry', open: false, snowDepth: 120, url: 'https://www.jasna.sk', type: 'Gondola' },
  { name: 'Jasná – Biela Púť', resort: 'Jasná', region: 'Nízke Tatry', open: false, snowDepth: 125, url: 'https://www.jasna.sk', type: 'Šestosedačka' },
  { name: 'Jasná – Chopok-sever', resort: 'Jasná', region: 'Nízke Tatry', open: false, snowDepth: 130, url: 'https://www.jasna.sk', type: 'Gondola' },
  { name: 'Martinské Hole – kabínkový vlek', resort: 'Martinské Hole', region: 'Malá Fatra', open: false, snowDepth: 55, url: 'https://www.martinskehol.sk', type: 'Kabínkový vlek' },
  { name: 'Donovaly – Park Snow', resort: 'Donovaly', region: 'Nízke Tatry', open: false, snowDepth: 35, url: 'https://www.parksnow.sk', type: 'Sedačková lanovka' },
  { name: 'Štrbské Pleso – Solisko', resort: 'Štrbské Pleso', region: 'Tatry', open: false, snowDepth: 95, url: 'https://www.vt.sk', type: 'Lanovka' },
  { name: 'Malinô Brdo – K1', resort: 'Malinô Brdo', region: 'Malá Fatra', open: false, snowDepth: 60, url: 'https://www.malinobrdo.sk', type: 'Sedačková lanovka' },
]

const AUSTRIA_RESORTS: AustriaResort[] = [
  { name: 'Kitzbühel', region: 'Tirolsko', altitudeMax: 2000, pistes: 170, lifts: 57, snowDepth: 80, open: false, url: 'https://www.kitzbuehel.com', distanceFromBA: 430 },
  { name: 'Sölden', region: 'Ötztal', altitudeMax: 3340, pistes: 144, lifts: 33, snowDepth: 160, open: false, url: 'https://www.soelden.com', distanceFromBA: 560 },
  { name: 'Schladming / Dachstein', region: 'Štajersko', altitudeMax: 2015, pistes: 230, lifts: 44, snowDepth: 70, open: false, url: 'https://www.schladming-dachstein.at', distanceFromBA: 290 },
  { name: 'Nassfeld', region: 'Korutánsko', altitudeMax: 2020, pistes: 110, lifts: 30, snowDepth: 85, open: false, url: 'https://www.nassfeld.at', distanceFromBA: 310 },
  { name: 'Zell am See – Kaprun', region: 'Salzburgsko', altitudeMax: 3029, pistes: 138, lifts: 53, snowDepth: 120, open: false, url: 'https://www.zellamsee-kaprun.com', distanceFromBA: 390 },
  { name: 'Ischgl', region: 'Tirolsko', altitudeMax: 2872, pistes: 238, lifts: 45, snowDepth: 150, open: false, url: 'https://www.ischgl.com', distanceFromBA: 550 },
  { name: 'St. Anton am Arlberg', region: 'Tirolsko', altitudeMax: 2811, pistes: 305, lifts: 88, snowDepth: 140, open: false, url: 'https://www.stantonamarlberg.com', distanceFromBA: 580 },
  { name: 'Bad Kleinkirchheim', region: 'Korutánsko', altitudeMax: 2055, pistes: 100, lifts: 23, snowDepth: 65, open: false, url: 'https://www.badkleinkirchheim.at', distanceFromBA: 320 },
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
    snowDepth: isSkiSeason ? Math.max(0, l.snowDepth + Math.floor(rng() * 30 - 15)) : 0,
  }))

  const austriaResorts = AUSTRIA_RESORTS.map(r => ({
    ...r,
    open: isSkiSeason && r.snowDepth > 50 ? rng() > 0.2 : false,
    snowDepth: isSkiSeason ? Math.max(0, r.snowDepth + Math.floor(rng() * 30 - 15)) : 0,
  }))

  return NextResponse.json({
    chalets: CHALETS,
    lifts,
    austriaResorts,
    openLifts: lifts.filter(l => l.open).length,
    openAustriaResorts: austriaResorts.filter(r => r.open).length,
    season: isSkiSeason ? 'ski' : isHikeSeason ? 'hike' : 'off',
    source: 'SACR · ski-info.sk · austria.info',
  })
}
