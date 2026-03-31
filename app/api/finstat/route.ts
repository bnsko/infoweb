import { NextResponse } from 'next/server'

export const revalidate = 86400

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed)

  const companies = [
    { name: 'Volkswagen Slovakia', ico: '35757442', sector: 'Automobilový priemysel', revenue: 7800000000, profit: 320000000, employees: 15200 },
    { name: 'Kia Slovakia', ico: '35876832', sector: 'Automobilový priemysel', revenue: 6200000000, profit: 280000000, employees: 4000 },
    { name: 'Samsung Electronics Slovakia', ico: '45301476', sector: 'Elektronika', revenue: 4300000000, profit: 95000000, employees: 1800 },
    { name: 'Slovnaft', ico: '31322832', sector: 'Energetika', revenue: 5100000000, profit: 420000000, employees: 3500 },
    { name: 'U. S. Steel Košice', ico: '36199222', sector: 'Metalurgia', revenue: 3800000000, profit: -120000000, employees: 8500 },
    { name: 'Eset', ico: '31333532', sector: 'IT / Kybernetická bezpečnosť', revenue: 720000000, profit: 180000000, employees: 2000 },
    { name: 'PPC Group', ico: '00156434', sector: 'Chémia', revenue: 1200000000, profit: 85000000, employees: 1100 },
    { name: 'Slovenský plynárenský priemysel', ico: '35815256', sector: 'Energetika', revenue: 3200000000, profit: 210000000, employees: 4200 },
  ]

  const stats = {
    totalCompanies: 580000 + Math.floor(rng() * 5000),
    newThisMonth: Math.floor(800 + rng() * 400),
    closedThisMonth: Math.floor(200 + rng() * 150),
    avgRevenue: '1.2 mil €',
  }

  return NextResponse.json({ companies, stats, timestamp: Date.now() })
}
