import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed + 666)

  const recentTransfers = [
    { type: 'Predaj', area: 'Bratislava I', property: 'Byt 3+1, Staré Mesto', price: 285000, size: 78, pricePerM2: 3654, date: '2025-06-14' },
    { type: 'Predaj', area: 'Bratislava V', property: 'Byt 2+1, Petržalka', price: 165000, size: 58, pricePerM2: 2845, date: '2025-06-13' },
    { type: 'Predaj', area: 'Košice I', property: 'Byt 4+1, Centrum', price: 195000, size: 95, pricePerM2: 2053, date: '2025-06-12' },
    { type: 'Prevod', area: 'Bratislava III', property: 'Rodinný dom, Nové Mesto', price: 420000, size: 180, pricePerM2: 2333, date: '2025-06-11' },
    { type: 'Predaj', area: 'Žilina', property: 'Byt 2+kk, Vlčince', price: 135000, size: 52, pricePerM2: 2596, date: '2025-06-10' },
    { type: 'Predaj', area: 'B. Bystrica', property: 'Byt 3+1, Sásová', price: 125000, size: 72, pricePerM2: 1736, date: '2025-06-09' },
    { type: 'Prevod', area: 'Bratislava II', property: 'Pozemok, Ružinov', price: 380000, size: 450, pricePerM2: 844, date: '2025-06-08' },
    { type: 'Predaj', area: 'Trnava', property: 'Byt 1+1, Centrum', price: 95000, size: 38, pricePerM2: 2500, date: '2025-06-07' },
  ]

  const priceStats = {
    avgPriceBA: Math.floor(3200 + rng() * 400),
    avgPriceKE: Math.floor(1900 + rng() * 300),
    avgPriceSK: Math.floor(2200 + rng() * 300),
    changeYoY: +(3 + rng() * 5).toFixed(1),
    totalTransactions: Math.floor(4500 + rng() * 1000),
    avgMortgageRate: +(3.5 + rng() * 1.5).toFixed(2),
  }

  const interestingFacts = [
    `Najdrahší byt predaný v BA: ${(550000 + Math.floor(rng() * 200000)).toLocaleString('sk-SK')} € (${Math.floor(120 + rng() * 40)} m²)`,
    `Priemerná cena v BA medziročne stúpla o ${priceStats.changeYoY}%`,
    `Tento mesiac bolo ${priceStats.totalTransactions.toLocaleString('sk-SK')} transakcií`,
    `Najlacnejšie byty: Rimavská Sobota (~${Math.floor(800 + rng() * 200)} €/m²)`,
    `Priemerná hypotéka (úrok): ${priceStats.avgMortgageRate}% p.a.`,
  ]

  return NextResponse.json({
    transfers: recentTransfers,
    priceStats,
    interestingFacts,
    timestamp: Date.now(),
  })
}
