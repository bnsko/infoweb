import { NextResponse } from 'next/server'

export const revalidate = 600

interface LocalOutage {
  type: 'electricity' | 'construction' | 'nightDisturbance'
  title: string
  location: string
  city: string
  since: string
  until?: string
  provider?: string
  note?: string
}

// Local disruptions - electricity outages, construction, night disturbances
function getLocalOutages(): LocalOutage[] {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = (i: number) => ((seed * 9301 + 49297 + i * 7927) % 233280) / 233280

  const electricityOutages = [
    { city: 'Bratislava', locations: ['Petržalka - Háje', 'Ružinov - Trávniky', 'Karlova Ves'], provider: 'ZSE' },
    { city: 'Košice', locations: ['Staré Mesto', 'Sídlisko KVP'], provider: 'VSE' },
    { city: 'Žilina', locations: ['Solinky', 'Hliny'], provider: 'SSE' },
    { city: 'Banská Bystrica', locations: ['Sásová', 'Fončorda'], provider: 'SSE' },
  ]

  const constructionWorks = [
    { city: 'Bratislava', locations: ['Bajkalská ul. - rekonštrukcia', 'Einsteinova - kanalizácia', 'Staromestská - vodovod'] },
    { city: 'Košice', locations: ['Hlavná ul. - dlažba', 'Južná trieda - cesta'] },
    { city: 'Žilina', locations: ['Obchodná - plynovod'] },
  ]

  const outages: LocalOutage[] = []

  electricityOutages.forEach((e, ei) => {
    e.locations.forEach((loc, li) => {
      if (rng(ei * 100 + li) < 0.25) {
        const startHour = Math.floor(rng(ei * 200 + li) * 8) + 7
        const duration = Math.floor(rng(ei * 300 + li) * 6) + 2
        outages.push({
          type: 'electricity',
          title: 'Plánovaný výpadok elektriny',
          location: loc,
          city: e.city,
          since: `${startHour}:00`,
          until: `${startHour + duration}:00`,
          provider: e.provider,
        })
      }
    })
  })

  constructionWorks.forEach((c, ci) => {
    c.locations.forEach((loc, li) => {
      if (rng(ci * 400 + li + 500) < 0.35) {
        outages.push({
          type: 'construction',
          title: 'Stavebné práce',
          location: loc,
          city: c.city,
          since: '07:00',
          until: '17:00',
          note: 'Obmedzená premávka',
        })
      }
    })
  })

  // Night disturbance reports (only at night)
  const hour = now.getHours()
  if (hour >= 22 || hour < 6) {
    if (rng(999) < 0.3) {
      outages.push({
        type: 'nightDisturbance',
        title: 'Hlásenie rušenia nočného pokoja',
        location: 'Centrum',
        city: 'Bratislava',
        since: `${hour}:${String(Math.floor(rng(888) * 60)).padStart(2, '0')}`,
        note: 'Hluk z podniku',
      })
    }
  }

  return outages.slice(0, 8)
}

export async function GET() {
  return NextResponse.json({
    outages: getLocalOutages(),
    timestamp: Date.now(),
  })
}
