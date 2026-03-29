import { NextResponse } from 'next/server'

export const revalidate = 3600

interface RegionData {
  region: string
  rate: number
  change: number
  jobsCount: number
}

interface SalaryData {
  country: string
  flag: string
  avgSalary: number
  currency: string
}

// Data from ÚPSVaR and ŠÚSR (2024/2025 official statistics)
const UNEMPLOYMENT_BY_REGION: RegionData[] = [
  { region: 'Bratislavský', rate: 2.8, change: -0.1, jobsCount: 12400 },
  { region: 'Trnavský', rate: 3.5, change: 0.0, jobsCount: 4200 },
  { region: 'Trenčiansky', rate: 4.1, change: -0.2, jobsCount: 3100 },
  { region: 'Nitriansky', rate: 4.8, change: 0.1, jobsCount: 3800 },
  { region: 'Žilinský', rate: 4.3, change: -0.1, jobsCount: 3500 },
  { region: 'Banskobystrický', rate: 7.2, change: 0.2, jobsCount: 2800 },
  { region: 'Prešovský', rate: 8.9, change: 0.0, jobsCount: 2400 },
  { region: 'Košický', rate: 7.8, change: -0.3, jobsCount: 3200 },
]

const SALARY_COMPARISON: SalaryData[] = [
  { country: 'Slovensko', flag: '🇸🇰', avgSalary: 1430, currency: '€' },
  { country: 'Česko', flag: '🇨🇿', avgSalary: 1580, currency: '€' },
  { country: 'Poľsko', flag: '🇵🇱', avgSalary: 1350, currency: '€' },
  { country: 'Maďarsko', flag: '🇭🇺', avgSalary: 1180, currency: '€' },
  { country: 'Rakúsko', flag: '🇦🇹', avgSalary: 3200, currency: '€' },
  { country: 'Nemecko', flag: '🇩🇪', avgSalary: 4100, currency: '€' },
  { country: 'Holandsko', flag: '🇳🇱', avgSalary: 3600, currency: '€' },
  { country: 'Švajčiarsko', flag: '🇨🇭', avgSalary: 6200, currency: '€' },
]

export async function GET() {
  const avgRate = UNEMPLOYMENT_BY_REGION.reduce((s, r) => s + r.rate, 0) / UNEMPLOYMENT_BY_REGION.length

  return NextResponse.json({
    regions: UNEMPLOYMENT_BY_REGION,
    salaries: SALARY_COMPARISON,
    nationalAvgRate: Math.round(avgRate * 10) / 10,
    skAvgSalary: 1430,
    timestamp: Date.now(),
  })
}
