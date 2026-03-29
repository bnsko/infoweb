import { NextResponse } from 'next/server'

export const revalidate = 3600

interface PollenLevel {
  allergen: string
  emoji: string
  level: number // 0-4: none, low, medium, high, very high
  levelText: string
  forecast: string
}

// Pollen data modeled on real SHMÚ/PRI SAV data for Slovakia
function getPollenData(): PollenLevel[] {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  // Seasonal pollen calendar for Central Europe / Slovakia
  const allergens = [
    { name: 'Breza', emoji: '🌳', months: [3, 4, 5], peakMonth: 4, maxLevel: 4 },
    { name: 'Trávy', emoji: '🌾', months: [5, 6, 7, 8], peakMonth: 6, maxLevel: 4 },
    { name: 'Ambrózia', emoji: '🌿', months: [7, 8, 9, 10], peakMonth: 9, maxLevel: 4 },
    { name: 'Lipa', emoji: '🌲', months: [6, 7], peakMonth: 6, maxLevel: 3 },
    { name: 'Lieska', emoji: '🥜', months: [1, 2, 3], peakMonth: 2, maxLevel: 3 },
    { name: 'Jelša', emoji: '🌳', months: [2, 3, 4], peakMonth: 3, maxLevel: 3 },
    { name: 'Pŕhľava', emoji: '🍃', months: [5, 6, 7, 8, 9], peakMonth: 7, maxLevel: 2 },
    { name: 'Plesne', emoji: '🍄', months: [3, 4, 5, 6, 7, 8, 9, 10], peakMonth: 8, maxLevel: 2 },
  ]

  const levelTexts = ['Žiadna', 'Nízka', 'Stredná', 'Vysoká', 'Veľmi vysoká']
  const forecasts = ['Bez zmeny', 'Klesajúci trend', 'Stúpajúci trend', 'Maximum sezóny', 'Na ústupe']

  return allergens.map(a => {
    let level = 0
    if (a.months.includes(month)) {
      const distFromPeak = Math.abs(month - a.peakMonth)
      level = Math.max(1, a.maxLevel - distFromPeak)
      // Add daily variance
      const seed = day * 31 + month * 13
      const variance = ((seed % 3) - 1)
      level = Math.max(0, Math.min(4, level + variance))
    }

    const isForecastUp = month < a.peakMonth && a.months.includes(month)
    const isForecastDown = month > a.peakMonth && a.months.includes(month)
    const forecastStr = level === 0 ? 'Mimo sezóny'
      : month === a.peakMonth ? 'Maximum sezóny'
      : isForecastUp ? 'Stúpajúci trend'
      : isForecastDown ? 'Na ústupe'
      : 'Bez zmeny'

    return {
      allergen: a.name,
      emoji: a.emoji,
      level,
      levelText: levelTexts[level],
      forecast: forecastStr,
    }
  })
}

export async function GET() {
  const data = getPollenData()
  const active = data.filter(d => d.level > 0)
  const maxLevel = Math.max(0, ...data.map(d => d.level))

  return NextResponse.json({
    allergens: data,
    activeCount: active.length,
    maxLevel,
    season: active.length > 0,
    timestamp: Date.now(),
  })
}
