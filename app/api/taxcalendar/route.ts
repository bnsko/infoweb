import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TAX_DEADLINES = [
  { month: 1, day: 25, title: 'DPH za december/Q4', description: 'Podanie daňového priznania k DPH', icon: '📋' },
  { month: 1, day: 31, title: 'Ročné zúčtovanie dane', description: 'Žiadosť o ročné zúčtovanie dane zo závislej činnosti', icon: '📝' },
  { month: 2, day: 25, title: 'DPH za január', description: 'Mesačné podanie DPH (mesační platitelia)', icon: '📋' },
  { month: 3, day: 25, title: 'DPH za február', description: 'Mesačné podanie DPH', icon: '📋' },
  { month: 3, day: 31, title: 'Daňové priznanie FO/PO', description: 'Posledný deň na podanie daňového priznania k dani z príjmov', icon: '🏛️' },
  { month: 4, day: 25, title: 'DPH za marec/Q1', description: 'Štvrťročné/mesačné podanie DPH', icon: '📋' },
  { month: 4, day: 30, title: 'Súhrnný výkaz Q1', description: 'Podanie súhrnného výkazu k DPH za Q1', icon: '📊' },
  { month: 5, day: 25, title: 'DPH za apríl', description: 'Mesačné podanie DPH', icon: '📋' },
  { month: 5, day: 31, title: 'Podanie k dani z nehnuteľností', description: 'Splatnosť prvej splátky dane z nehnuteľností', icon: '🏠' },
  { month: 6, day: 25, title: 'DPH za máj', description: 'Mesačné podanie DPH', icon: '📋' },
  { month: 6, day: 30, title: 'Odložené daňové priznanie', description: 'Posledný deň na podanie odloženého DP (3 mesiace)', icon: '🏛️' },
  { month: 7, day: 25, title: 'DPH za jún/Q2', description: 'Štvrťročné/mesačné podanie DPH', icon: '📋' },
  { month: 8, day: 25, title: 'DPH za júl', description: 'Mesačné podanie DPH', icon: '📋' },
  { month: 9, day: 25, title: 'DPH za august', description: 'Mesačné podanie DPH', icon: '📋' },
  { month: 9, day: 30, title: 'Odložené DP (zahraničie)', description: 'Posledný deň DP ak máte príjmy zo zahraničia (6 mes)', icon: '🏛️' },
  { month: 10, day: 25, title: 'DPH za september/Q3', description: 'Štvrťročné/mesačné podanie DPH', icon: '📋' },
  { month: 11, day: 25, title: 'DPH za október', description: 'Mesačné podanie DPH', icon: '📋' },
  { month: 12, day: 25, title: 'DPH za november', description: 'Mesačné podanie DPH', icon: '📋' },
  { month: 12, day: 31, title: 'Koniec účtovného roka', description: 'Uzávierka účtovného roka pre väčšinu firiem', icon: '📅' },
]

export async function GET() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentDay = now.getDate()
  const currentYear = now.getFullYear()

  const upcoming = TAX_DEADLINES.map(d => {
    let deadlineDate = new Date(currentYear, d.month - 1, d.day)
    if (deadlineDate < now) {
      deadlineDate = new Date(currentYear + 1, d.month - 1, d.day)
    }
    const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / 86400000)
    return { ...d, daysUntil, date: deadlineDate.toISOString().split('T')[0] }
  }).sort((a, b) => a.daysUntil - b.daysUntil)

  const urgent = upcoming.filter(d => d.daysUntil <= 14)
  const next = upcoming.slice(0, 5)

  return NextResponse.json({
    upcoming: next,
    urgent,
    totalThisYear: TAX_DEADLINES.length,
    timestamp: Date.now(),
  })
}
