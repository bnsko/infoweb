import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FREELANCE_RATES = [
  { role: 'Frontend Developer', icon: '🎨', hourlyMin: 25, hourlyMax: 60, monthlyAvg: 3200, demand: 'high' },
  { role: 'Backend Developer', icon: '⚙️', hourlyMin: 30, hourlyMax: 70, monthlyAvg: 3800, demand: 'high' },
  { role: 'Full-stack Developer', icon: '💻', hourlyMin: 35, hourlyMax: 80, monthlyAvg: 4200, demand: 'high' },
  { role: 'UI/UX Designer', icon: '🎯', hourlyMin: 25, hourlyMax: 55, monthlyAvg: 2800, demand: 'medium' },
  { role: 'DevOps Engineer', icon: '🔧', hourlyMin: 35, hourlyMax: 80, monthlyAvg: 4500, demand: 'high' },
  { role: 'Data Analyst', icon: '📊', hourlyMin: 25, hourlyMax: 60, monthlyAvg: 3000, demand: 'medium' },
  { role: 'Copywriter', icon: '✍️', hourlyMin: 15, hourlyMax: 35, monthlyAvg: 1800, demand: 'medium' },
  { role: 'Social Media Manager', icon: '📱', hourlyMin: 15, hourlyMax: 30, monthlyAvg: 1500, demand: 'medium' },
  { role: 'SEO Specialist', icon: '🔍', hourlyMin: 20, hourlyMax: 50, monthlyAvg: 2200, demand: 'medium' },
  { role: 'Project Manager', icon: '📋', hourlyMin: 25, hourlyMax: 55, monthlyAvg: 2800, demand: 'medium' },
  { role: 'AI/ML Engineer', icon: '🤖', hourlyMin: 40, hourlyMax: 100, monthlyAvg: 5500, demand: 'high' },
  { role: 'Cybersecurity', icon: '🔒', hourlyMin: 35, hourlyMax: 90, monthlyAvg: 4800, demand: 'high' },
]

const PLATFORMS = [
  { name: 'Upwork', icon: '🌐', focus: 'Globálny trh', fee: '10-20%', url: 'https://upwork.com' },
  { name: 'Profesia.sk', icon: '🇸🇰', focus: 'SK trh', fee: '0%', url: 'https://profesia.sk' },
  { name: 'Toptal', icon: '⭐', focus: 'Top 3% talent', fee: '0%', url: 'https://toptal.com' },
  { name: 'Fiverr', icon: '🎯', focus: 'Mikro-služby', fee: '20%', url: 'https://fiverr.com' },
  { name: 'LinkedIn', icon: '💼', focus: 'B2B networking', fee: '0%', url: 'https://linkedin.com' },
]

export async function GET() {
  return NextResponse.json({
    rates: FREELANCE_RATES,
    platforms: PLATFORMS,
    avgFreelanceIncomeSK: 2400,
    timestamp: Date.now(),
  })
}
