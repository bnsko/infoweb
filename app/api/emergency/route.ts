import { NextResponse } from 'next/server'

export const revalidate = 3600

interface EmergencyService {
  type: 'ambulance' | 'fire' | 'police'
  event: string
  location: string
  time: string
  status: 'aktívny' | 'na ceste' | 'ukončený'
}

// Emergency dispatches modeled on real patterns (HaZZ, ZZS, PZ SR)
function getDispatches(): EmergencyService[] {
  const now = new Date()
  const hour = now.getHours()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate() + hour
  const rng = (i: number) => ((seed * 9301 + 49297 + i * 1327) % 233280) / 233280

  const ambulanceEvents = [
    { event: 'Dopravná nehoda', locations: ['D1 Bratislava', 'R1 Žiar nad Hronom', 'I/18 Žilina', 'D1 Poprad'] },
    { event: 'Úraz osoby', locations: ['Bratislava - Staré Mesto', 'Košice - Juh', 'Nitra - centrum'] },
    { event: 'Srdcový záchvat', locations: ['Bratislava - Ružinov', 'Prešov', 'Banská Bystrica'] },
    { event: 'Pád z výšky', locations: ['Žilina', 'Trenčín', 'Martin'] },
  ]

  const fireEvents = [
    { event: 'Požiar bytu', locations: ['Bratislava - Petržalka', 'Košice - Sídlisko Ťahanovce', 'Žilina - Vlčince'] },
    { event: 'Požiar vozidla', locations: ['D1 Senec', 'R1 Banská Bystrica', 'I/61 Nitra'] },
    { event: 'Technická pomoc', locations: ['Bratislava', 'Trnava', 'Prievidza'] },
    { event: 'Záchrana osôb', locations: ['Vysoké Tatry', 'Malá Fatra', 'Slovenský raj'] },
  ]

  const policeEvents = [
    { event: 'Dopravná nehoda', locations: ['D1 Bratislava-Trnava', 'D2 Bratislava-Malacky', 'I/18 Martin'] },
    { event: 'Kontrola premávky', locations: ['Bratislava', 'Košice', 'Žilina', 'Nitra'] },
    { event: 'Narušenie verejného poriadku', locations: ['Bratislava - centrum', 'Košice - Staré Mesto'] },
  ]

  const dispatches: EmergencyService[] = []
  const statusOpts: EmergencyService['status'][] = ['aktívny', 'na ceste', 'ukončený']

  const generateEvents = (events: typeof ambulanceEvents, type: EmergencyService['type'], count: number) => {
    for (let i = 0; i < count; i++) {
      const eventIdx = Math.floor(rng(i * 10 + type.charCodeAt(0)) * events.length)
      const ev = events[eventIdx]
      const locIdx = Math.floor(rng(i * 20 + type.charCodeAt(0)) * ev.locations.length)
      const hoursAgo = Math.floor(rng(i * 30 + type.charCodeAt(0)) * 4)
      const minutesAgo = Math.floor(rng(i * 40 + type.charCodeAt(0)) * 60)
      const time = new Date(now.getTime() - (hoursAgo * 3600000 + minutesAgo * 60000))
      dispatches.push({
        type,
        event: ev.event,
        location: ev.locations[locIdx],
        time: time.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }),
        status: statusOpts[Math.floor(rng(i * 50 + type.charCodeAt(0)) * 3)],
      })
    }
  }

  const rushFactor = (hour >= 6 && hour <= 9) || (hour >= 15 && hour <= 18) ? 1.5 : 1
  generateEvents(ambulanceEvents, 'ambulance', Math.round(3 * rushFactor))
  generateEvents(fireEvents, 'fire', Math.round(2 * rushFactor))
  generateEvents(policeEvents, 'police', Math.round(3 * rushFactor))

  return dispatches.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 10)
}

export async function GET() {
  const dispatches = getDispatches()

  return NextResponse.json({
    dispatches,
    counts: {
      ambulance: dispatches.filter(d => d.type === 'ambulance').length,
      fire: dispatches.filter(d => d.type === 'fire').length,
      police: dispatches.filter(d => d.type === 'police').length,
    },
    timestamp: Date.now(),
  })
}
