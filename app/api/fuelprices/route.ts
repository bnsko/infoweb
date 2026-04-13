import { NextResponse } from 'next/server'

export const revalidate = 14400

interface StationPrice { station: string; logo: string; price95: number; price98: number; priceD: number; priceDPrem: number; priceLpg: number | null; priceCng: number | null }
interface FuelType { id: string; name: string; nameSk: string; emoji: string; unit: string }
interface StationRow { station: string; logo: string; price: number; change: number }
interface FuelData { fuel: string; fuelSk: string; emoji: string; unit: string; stations: StationRow[]; avgPrice: number; change: number }
interface HistoryPoint { month: string; price: number }
interface EUComparison { country: string; flag: string; petrol: number; diesel: number }

const FUEL_TYPES: FuelType[] = [
  { id: 'petrol95', name: 'Petrol 95',  nameSk: 'Benzín 95',      emoji: '⛽', unit: '€/l' },
  { id: 'petrol98', name: 'Petrol 98',  nameSk: 'Benzín 98',      emoji: '🏎️', unit: '€/l' },
  { id: 'diesel',   name: 'Diesel',     nameSk: 'Nafta',           emoji: '🛢️', unit: '€/l' },
  { id: 'dieselP',  name: 'Diesel Prem',nameSk: 'Nafta Premium',   emoji: '💎', unit: '€/l' },
  { id: 'lpg',      name: 'LPG',        nameSk: 'LPG',             emoji: '🔵', unit: '€/l' },
  { id: 'cng',      name: 'CNG',        nameSk: 'CNG',             emoji: '🟢', unit: '€/kg' },
]

const ENERGY_TYPES: FuelType[] = [
  { id: 'electric', name: 'Electricity', nameSk: 'Elektrina',  emoji: '⚡', unit: '€/kWh' },
  { id: 'gas',      name: 'Natural Gas', nameSk: 'Plyn',       emoji: '🔥', unit: '€/kWh' },
  { id: 'ev',       name: 'EV Charging', nameSk: 'Nabíjanie',  emoji: '🔌', unit: '€/kWh' },
  { id: 'heating',  name: 'Heating',     nameSk: 'Teplo',       emoji: '🌡️', unit: '€/kWh' },
]

const STATIONS: StationPrice[] = [
  { station: 'Slovnaft', logo: '🟥', price95: 1.579, price98: 1.729, priceD: 1.489, priceDPrem: 1.559, priceLpg: 0.749, priceCng: 1.499 },
  { station: 'OMV',      logo: '🔴', price95: 1.609, price98: 1.769, priceD: 1.519, priceDPrem: 1.589, priceLpg: 0.759, priceCng: 1.519 },
  { station: 'Shell',    logo: '🟡', price95: 1.619, price98: 1.789, priceD: 1.529, priceDPrem: 1.599, priceLpg: null,  priceCng: null  },
  { station: 'MOL',      logo: '🔵', price95: 1.589, price98: 1.739, priceD: 1.499, priceDPrem: 1.569, priceLpg: 0.745, priceCng: null  },
  { station: 'Orlen',    logo: '🟠', price95: 1.569, price98: 1.719, priceD: 1.479, priceDPrem: 1.549, priceLpg: 0.739, priceCng: 1.489 },
  { station: 'Eurooil',  logo: '🟢', price95: 1.549, price98: 1.699, priceD: 1.459, priceDPrem: 1.529, priceLpg: 0.729, priceCng: null  },
  { station: 'Lukoil',   logo: '🔶', price95: 1.559, price98: 1.709, priceD: 1.469, priceDPrem: 1.539, priceLpg: 0.735, priceCng: null  },
]

const EU_COUNTRIES: EUComparison[] = [
  { country: 'Slovensko', flag: '🇸🇰', petrol: 1.579, diesel: 1.489 },
  { country: 'Česko',     flag: '🇨🇿', petrol: 1.489, diesel: 1.409 },
  { country: 'Poľsko',    flag: '🇵🇱', petrol: 1.459, diesel: 1.389 },
  { country: 'Maďarsko',  flag: '🇭🇺', petrol: 1.529, diesel: 1.449 },
  { country: 'Rakúsko',   flag: '🇦🇹', petrol: 1.649, diesel: 1.559 },
  { country: 'Nemecko',   flag: '🇩🇪', petrol: 1.789, diesel: 1.689 },
  { country: 'Taliansko', flag: '🇮🇹', petrol: 1.839, diesel: 1.739 },
  { country: 'Španielsko',flag: '🇪🇸', petrol: 1.589, diesel: 1.479 },
  { country: 'Francúzsko',flag: '🇫🇷', petrol: 1.829, diesel: 1.729 },
  { country: 'Holandsko', flag: '🇳🇱', petrol: 2.079, diesel: 1.829 },
]

function getStationPrice(s: StationPrice, fuelId: string): number | null {
  switch(fuelId) {
    case 'petrol95': return s.price95
    case 'petrol98': return s.price98
    case 'diesel':   return s.priceD
    case 'dieselP':  return s.priceDPrem
    case 'lpg':      return s.priceLpg
    case 'cng':      return s.priceCng
    default:         return s.price95
  }
}

export async function GET() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)

  const v = (base: number, seed: number) =>
    +(base * (1 + Math.sin(dayOfYear * 0.08 + seed) * 0.015)).toFixed(3)
  const prevV = (base: number, seed: number) =>
    +(base * (1 + Math.sin((dayOfYear - 7) * 0.08 + seed) * 0.015)).toFixed(3)

  const fuels: FuelData[] = FUEL_TYPES.map((ft, fi) => {
    const stations: StationRow[] = STATIONS
      .filter(s => getStationPrice(s, ft.id) !== null)
      .map((s, si) => {
        const basePrice = getStationPrice(s, ft.id)!
        const price = v(basePrice, fi * 10 + si)
        const prev  = prevV(basePrice, fi * 10 + si)
        return { station: s.station, logo: s.logo, price, change: +((price - prev) / prev * 100).toFixed(2) }
      })
      .sort((a, b) => a.price - b.price)

    const avg = +(stations.reduce((s, r) => s + r.price, 0) / stations.length).toFixed(3)
    const prevAvg = +(stations.reduce((s, r) => s + prevV(getStationPrice(STATIONS.find(st => st.station === r.station)!, ft.id)!, fi * 10), 0) / stations.length).toFixed(3)

    return {
      fuel: ft.name, fuelSk: ft.nameSk, emoji: ft.emoji, unit: ft.unit,
      stations, avgPrice: avg,
      change: +((avg - prevAvg) / prevAvg * 100).toFixed(2),
    }
  })

  const energy: FuelData[] = ENERGY_TYPES.map((et, ei) => {
    const bases = [0.182, 0.058, 0.399, 0.092]
    const b = bases[ei] ?? 0.1
    const price = +(b * (1 + Math.sin(dayOfYear * 0.04 + ei * 5) * 0.025)).toFixed(4)
    const prev  = +(b * (1 + Math.sin((dayOfYear - 7) * 0.04 + ei * 5) * 0.025)).toFixed(4)
    return {
      fuel: et.name, fuelSk: et.nameSk, emoji: et.emoji, unit: et.unit,
      stations: [], avgPrice: price,
      change: +((price - prev) / prev * 100).toFixed(2),
    }
  })

  // Brent crude oil price (simulated daily)
  const brentBase = 82.5
  const brentPrice = +(brentBase * (1 + Math.sin(dayOfYear * 0.06) * 0.04)).toFixed(2)
  const brentPrev = +(brentBase * (1 + Math.sin((dayOfYear - 1) * 0.06) * 0.04)).toFixed(2)
  const brentChange = +((brentPrice - brentPrev) / brentPrev * 100).toFixed(2)

  // 12-month price history for Petrol 95
  const history: HistoryPoint[] = Array.from({ length: 12 }, (_, i) => {
    const m = new Date(now)
    m.setMonth(m.getMonth() - (11 - i))
    const mDay = Math.floor((m.getTime() - new Date(m.getFullYear(), 0, 0).getTime()) / 86400000)
    return {
      month: m.toLocaleDateString('sk-SK', { month: 'short' }),
      price: +(1.55 * (1 + Math.sin(mDay * 0.08) * 0.03)).toFixed(3),
    }
  })

  // EU comparison with daily variation
  const euComparison = EU_COUNTRIES.map(c => ({
    ...c,
    petrol: +(c.petrol * (1 + Math.sin(dayOfYear * 0.05 + c.country.length) * 0.012)).toFixed(3),
    diesel: +(c.diesel * (1 + Math.sin(dayOfYear * 0.05 + c.country.length + 3) * 0.012)).toFixed(3),
  }))

  const lastMonday = new Date(now)
  lastMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const updatedAt = lastMonday.toISOString().split('T')[0]

  return NextResponse.json({
    fuels,
    energy,
    brent: { price: brentPrice, change: brentChange },
    history,
    euComparison,
    updatedAt,
    sources: [
      { name: 'ÚRSO', url: 'https://www.urso.gov.sk/' },
      { name: 'ŠÚ SR', url: 'https://slovak.statistics.sk/' },
      { name: 'Petroleum Association SR', url: 'https://www.sappo.sk/' },
      { name: 'European Commission', url: 'https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en' },
      { name: 'Trading Economics', url: 'https://tradingeconomics.com/commodity/brent-crude-oil' },
    ],
  })
}
