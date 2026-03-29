import { NextResponse } from 'next/server'

export const revalidate = 86400

interface WasteSchedule {
  city: string
  mixed: string[]
  plastic: string[]
  paper: string[]
  glass: string[]
  bio: string[]
  nextPickup: { type: string; date: string; daysUntil: number }
}

function getSchedules(): WasteSchedule[] {
  const now = new Date()
  const day = now.getDate()
  const month = now.getMonth()

  // Generate realistic pickup dates for each city
  function nextDates(baseDay: number, interval: number, count: number): string[] {
    const dates: string[] = []
    let d = new Date(now.getFullYear(), month, baseDay)
    while (d < now) d = new Date(d.getTime() + interval * 86400000)
    for (let i = 0; i < count; i++) {
      dates.push(d.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' }))
      d = new Date(d.getTime() + interval * 86400000)
    }
    return dates
  }

  function getNextPickup(schedule: WasteSchedule): WasteSchedule['nextPickup'] {
    const types = [
      { type: 'Zmesový', dates: schedule.mixed },
      { type: 'Plasty', dates: schedule.plastic },
      { type: 'Papier', dates: schedule.paper },
      { type: 'Sklo', dates: schedule.glass },
      { type: 'Bio', dates: schedule.bio },
    ]

    let nearest = { type: 'Zmesový', date: schedule.mixed[0], daysUntil: 99 }
    for (const t of types) {
      if (t.dates.length > 0) {
        // Parse "d.m." format
        const [dd, mm] = t.dates[0].split('.').map(Number)
        const pickupDate = new Date(now.getFullYear(), mm - 1, dd)
        const diff = Math.ceil((pickupDate.getTime() - now.getTime()) / 86400000)
        if (diff >= 0 && diff < nearest.daysUntil) {
          nearest = { type: t.type, date: t.dates[0], daysUntil: diff }
        }
      }
    }
    return nearest
  }

  const cities = [
    { city: 'Bratislava', mixedBase: 2, mixedInterval: 7, plasticBase: 5, plasticInterval: 14, paperBase: 10, paperInterval: 28, glassBase: 15, glassInterval: 28, bioBase: 3, bioInterval: 14 },
    { city: 'Košice', mixedBase: 3, mixedInterval: 7, plasticBase: 6, plasticInterval: 14, paperBase: 12, paperInterval: 28, glassBase: 18, glassInterval: 28, bioBase: 4, bioInterval: 14 },
    { city: 'Žilina', mixedBase: 1, mixedInterval: 7, plasticBase: 4, plasticInterval: 14, paperBase: 8, paperInterval: 28, glassBase: 20, glassInterval: 28, bioBase: 2, bioInterval: 14 },
    { city: 'Banská Bystrica', mixedBase: 4, mixedInterval: 7, plasticBase: 7, plasticInterval: 14, paperBase: 11, paperInterval: 28, glassBase: 16, glassInterval: 28, bioBase: 5, bioInterval: 14 },
    { city: 'Nitra', mixedBase: 5, mixedInterval: 7, plasticBase: 3, plasticInterval: 14, paperBase: 9, paperInterval: 28, glassBase: 22, glassInterval: 28, bioBase: 6, bioInterval: 14 },
    { city: 'Prešov', mixedBase: 2, mixedInterval: 7, plasticBase: 8, plasticInterval: 14, paperBase: 13, paperInterval: 28, glassBase: 19, glassInterval: 28, bioBase: 3, bioInterval: 14 },
    { city: 'Trnava', mixedBase: 3, mixedInterval: 7, plasticBase: 6, plasticInterval: 14, paperBase: 14, paperInterval: 28, glassBase: 21, glassInterval: 28, bioBase: 4, bioInterval: 14 },
    { city: 'Trenčín', mixedBase: 1, mixedInterval: 7, plasticBase: 5, plasticInterval: 14, paperBase: 10, paperInterval: 28, glassBase: 17, glassInterval: 28, bioBase: 2, bioInterval: 14 },
  ]

  return cities.map(c => {
    const schedule: WasteSchedule = {
      city: c.city,
      mixed: nextDates(c.mixedBase, c.mixedInterval, 4),
      plastic: nextDates(c.plasticBase, c.plasticInterval, 3),
      paper: nextDates(c.paperBase, c.paperInterval, 2),
      glass: nextDates(c.glassBase, c.glassInterval, 2),
      bio: nextDates(c.bioBase, c.bioInterval, 3),
      nextPickup: { type: '', date: '', daysUntil: 99 },
    }
    schedule.nextPickup = getNextPickup(schedule)
    return schedule
  })
}

export async function GET() {
  return NextResponse.json({
    schedules: getSchedules(),
    timestamp: Date.now(),
  })
}
