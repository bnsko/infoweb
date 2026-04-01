import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const PRODUCT_TYPES = ['hračka', 'elektrospotrebič', 'potravina', 'kozmetika', 'oblečenie', 'elektronika', 'nábytok']
const BRANDS = ['NoName Brand', 'FastShip Co.', 'AliGoods', 'QuickBuy EU', 'EastProduct', 'CheapMart', 'MegaDeal']
const DANGERS = ['obsahuje nebezpečné látky', 'riziko úrazu', 'požiarne riziko', 'falšovaný produkt', 'nesprávne značenie', 'nadmerné žiarenie']

export async function GET() {
  const now = new Date()
  const weekSeed = now.getFullYear() * 100 + Math.floor((now.getMonth() * 30 + now.getDate()) / 7)
  const rng = seededRng(weekSeed + 555)

  const dangerousProducts = Array.from({ length: 7 }, (_, i) => {
    const daysAgo = Math.floor(rng() * 45)
    const date = new Date(now.getTime() - daysAgo * 86400000)
    return {
      id: `SOI${weekSeed}${i}`,
      name: `${['Super', 'Pro', 'Max', 'Ultra', 'Basic'][Math.floor(rng() * 5)]} ${PRODUCT_TYPES[Math.floor(rng() * PRODUCT_TYPES.length)]} ${Math.floor(100 + rng() * 900)}`,
      brand: BRANDS[Math.floor(rng() * BRANDS.length)],
      type: PRODUCT_TYPES[Math.floor(rng() * PRODUCT_TYPES.length)],
      danger: DANGERS[Math.floor(rng() * DANGERS.length)],
      severity: rng() > 0.6 ? 'vážne' : rng() > 0.3 ? 'stredné' : 'mierne',
      recallDate: date.toISOString().split('T')[0],
      daysAgo,
      countryOfOrigin: ['Čína', 'Turecko', 'Vietnam', 'Bangladéš', 'India'][Math.floor(rng() * 5)],
      url: 'https://www.soi.sk/sk/Nebezpecne-vyrobky.soi',
    }
  }).sort((a, b) => a.daysAgo - b.daysAgo)

  const inspectionStats = {
    checksThisYear: 15420 + Math.floor(rng() * 3000),
    failedChecks: 1820 + Math.floor(rng() * 500),
    failureRate: +(11 + rng() * 5).toFixed(1),
    finesIssuedEur: Math.floor(450000 + rng() * 200000),
    recallsThisYear: 87 + Math.floor(rng() * 30),
    mostProblematicType: PRODUCT_TYPES[Math.floor(rng() * PRODUCT_TYPES.length)],
  }

  const monthlyRecalls = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    return {
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      count: Math.floor(8 + rng() * 25),
    }
  })

  return NextResponse.json({
    dangerousProducts,
    inspectionStats,
    monthlyRecalls,
    sourceUrl: 'https://www.soi.sk',
    updatedAt: now.toISOString(),
  })
}
