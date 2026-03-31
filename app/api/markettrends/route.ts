import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SK_MARKET_DATA = {
  avgSalary: 1430,
  avgSalaryGrowth: '+9.2%',
  unemployment: 5.1,
  inflation: 2.8,
  gdpGrowth: 2.1,
  minWage: 816,
  avgRent: { bratislava: 850, kosice: 480, zilina: 520 },
  topSectors: [
    { name: 'IT & Software', growth: '+12%', avgSalary: 2800, icon: '💻' },
    { name: 'Automobilový', growth: '+5%', avgSalary: 1600, icon: '🚗' },
    { name: 'E-commerce', growth: '+18%', avgSalary: 1900, icon: '🛒' },
    { name: 'Fintech', growth: '+15%', avgSalary: 2500, icon: '💳' },
    { name: 'Zdravotníctvo', growth: '+7%', avgSalary: 1400, icon: '🏥' },
    { name: 'Energetika', growth: '+10%', avgSalary: 1800, icon: '⚡' },
  ],
  bizStats: {
    totalCompanies: 260000,
    newCompaniesPerMonth: 2100,
    bankruptciesPerMonth: 180,
    selfEmployed: 420000,
  },
}

export async function GET() {
  return NextResponse.json({
    ...SK_MARKET_DATA,
    timestamp: Date.now(),
  })
}
