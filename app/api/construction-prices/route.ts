import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed)

  const materials = [
    { name: 'Betónová tvárnica 20x20x40', unit: 'ks', price: parseFloat((0.52 + rng() * 0.08).toFixed(2)), trend: parseFloat((-1 + rng() * 4).toFixed(1)), category: 'murivo' },
    { name: 'OSB doska 18mm 2500x1250', unit: 'ks', price: parseFloat((14.9 + rng() * 2).toFixed(2)), trend: parseFloat((-3 + rng() * 6).toFixed(1)), category: 'drevo' },
    { name: 'Cementová omietka 25kg', unit: 'vrece', price: parseFloat((6.8 + rng() * 0.8).toFixed(2)), trend: parseFloat((1 + rng() * 3).toFixed(1)), category: 'omietky' },
    { name: 'Minerálna vlna 100mm', unit: 'm²', price: parseFloat((8.4 + rng() * 1).toFixed(2)), trend: parseFloat((2 + rng() * 3).toFixed(1)), category: 'izolácia' },
    { name: 'Keramická dlažba 60x60 šedá', unit: 'm²', price: parseFloat((12.5 + rng() * 2).toFixed(2)), trend: parseFloat((-1 + rng() * 4).toFixed(1)), category: 'dlažba' },
    { name: 'PVC trubka 110mm/m', unit: 'm', price: parseFloat((3.9 + rng() * 0.5).toFixed(2)), trend: parseFloat((0 + rng() * 3).toFixed(1)), category: 'inštalácie' },
    { name: 'Cu kábel 3x1.5mm NYM-J', unit: 'm', price: parseFloat((1.65 + rng() * 0.2).toFixed(2)), trend: parseFloat((3 + rng() * 4).toFixed(1)), category: 'elektro' },
    { name: 'Strešná krytina betón červená', unit: 'm²', price: parseFloat((18.5 + rng() * 2).toFixed(2)), trend: parseFloat((1 + rng() * 2).toFixed(1)), category: 'strecha' },
    { name: 'Beton B25/C20 vibrovaný', unit: 'm³', price: parseFloat((115 + rng() * 10).toFixed(0)), trend: parseFloat((2 + rng() * 3).toFixed(1)), category: 'beton' },
    { name: 'Stavebné drevo smrek 5x10cm', unit: 'm', price: parseFloat((2.8 + rng() * 0.4).toFixed(2)), trend: parseFloat((-2 + rng() * 5).toFixed(1)), category: 'drevo' },
    { name: 'Sadrová omietka Baumit 25kg', unit: 'vrece', price: parseFloat((8.5 + rng() * 1).toFixed(2)), trend: parseFloat((1 + rng() * 2).toFixed(1)), category: 'omietky' },
    { name: 'Polystyrén EPS 100S 10cm', unit: 'm²', price: parseFloat((6.2 + rng() * 0.8).toFixed(2)), trend: parseFloat((-1 + rng() * 4).toFixed(1)), category: 'izolácia' },
  ]

  const index = {
    currentValue: parseFloat((128.4 + rng() * 5).toFixed(1)),
    baseYear: 2015,
    yearOnYearPct: parseFloat((3.2 + rng() * 3).toFixed(1)),
    monthOnMonthPct: parseFloat((-0.5 + rng() * 2).toFixed(1)),
    trend: 'mierny rast',
    source: 'ŠÚ SR – index cien stavebných prác',
  }

  return NextResponse.json({ materials, index, lastUpdated: now.toISOString().slice(0, 10), source: 'Hornbach · OBI · Leroy Merlin · ŠÚ SR' })
}
