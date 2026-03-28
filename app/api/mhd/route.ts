import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Departure {
  line: string
  type: 'bus' | 'tram' | 'trolley' | 'train'
  direction: string
  departure: string
  delay: number
  platform?: string
}

interface StopData {
  name: string
  departures: Departure[]
}

const CITY_STOPS: Record<string, { name: string; stops: { id: string; name: string }[] }> = {
  bratislava: {
    name: 'Bratislava',
    stops: [
      { id: 'ba-hlst', name: 'Hlavná stanica' },
      { id: 'ba-nam', name: 'Námestie SNP' },
      { id: 'ba-most', name: 'Most SNP' },
      { id: 'ba-pat', name: 'Patrónka' },
      { id: 'ba-niv', name: 'Nivy' },
    ],
  },
  kosice: {
    name: 'Košice',
    stops: [
      { id: 'ke-st', name: 'Staničné námestie' },
      { id: 'ke-hl', name: 'Hlavná ulica' },
      { id: 'ke-au', name: 'Autobusová stanica' },
    ],
  },
  zilina: {
    name: 'Žilina',
    stops: [
      { id: 'za-st', name: 'Železničná stanica' },
      { id: 'za-nam', name: 'Námestie A. Hlinku' },
    ],
  },
  presov: {
    name: 'Prešov',
    stops: [
      { id: 'po-st', name: 'Železničná stanica' },
      { id: 'po-nam', name: 'Námestie legionárov' },
    ],
  },
  bystrica: {
    name: 'Banská Bystrica',
    stops: [
      { id: 'bb-st', name: 'Železničná stanica' },
      { id: 'bb-nam', name: 'Námestie SNP' },
    ],
  },
}

const LINE_TYPES: Record<string, 'bus' | 'tram' | 'trolley' | 'train'> = {
  '1': 'tram', '3': 'tram', '4': 'tram', '5': 'tram', '7': 'tram', '9': 'tram',
  '31': 'trolley', '33': 'trolley', '64': 'trolley', '201': 'trolley',
  '50': 'bus', '61': 'bus', '65': 'bus', '83': 'bus', '84': 'bus', '88': 'bus',
  '93': 'bus', '95': 'bus', '96': 'bus', '99': 'bus', '130': 'bus', '131': 'bus',
  'R1': 'train', 'R5': 'train', 'Os': 'train',
}

function getType(line: string): 'bus' | 'tram' | 'trolley' | 'train' {
  return LINE_TYPES[line] ?? 'bus'
}

function generateDepartures(stopId: string): Departure[] {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const departures: Departure[] = []

  // Generate realistic departure patterns based on stop
  const seed = stopId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const linePool = stopId.startsWith('ba-')
    ? ['1', '3', '4', '5', '7', '9', '31', '33', '50', '61', '83', '88', '93', '95']
    : stopId.startsWith('ke-')
      ? ['1', '2', '3', '4', '5', '71', '72', '14', '21', '29']
      : ['1', '2', '3', '4', '5', '11', '12', '15']

  const destinations: Record<string, string[]> = {
    '1': ['Hlavná stanica', 'Petržalka', 'Dubravka', 'Ružinov'],
    '3': ['Rača', 'Dúbravka', 'Karlova Ves'],
    '4': ['Zlaté Piesky', 'STU', 'Dúbravka'],
    '5': ['Petržalka, Lúky', 'Ružinov, Cvernovka'],
    '7': ['Depot Krasňany', 'Karlova Ves'],
    '9': ['Ružinov', 'Hlavná stanica'],
    '31': ['Záluhy', 'Hlavná stanica'],
    '33': ['Patrónka', 'Hlavná stanica'],
    '50': ['Devínska N. Ves', 'Hlavná stanica'],
    '61': ['Kramáre', 'Bratislava hl. st.'],
    '83': ['Dlhé diely', 'Petržalka'],
    '88': ['Dúbravka', 'Most SNP'],
    '93': ['Nové Mesto', 'Ružinov'],
    '95': ['Petržalka', 'Devín'],
  }

  for (let i = 0; i < 12; i++) {
    const lineIdx = (seed + i) % linePool.length
    const line = linePool[lineIdx]
    const type = getType(line)
    const destPool = destinations[line] ?? ['Centrum', 'Sídlisko', 'Stanica']
    const direction = destPool[(seed + i) % destPool.length]

    const minOffset = i * 3 + (seed % 4) + 1
    const depTime = new Date(now.getTime() + minOffset * 60000)
    const delay = (seed + i * 7) % 8 === 0 ? Math.floor(1 + ((seed + i) % 5)) : 0

    departures.push({
      line,
      type,
      direction,
      departure: depTime.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }),
      delay,
    })
  }

  return departures
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city') ?? 'bratislava'
  const stopId = searchParams.get('stop') ?? ''

  const cityData = CITY_STOPS[city] ?? CITY_STOPS.bratislava
  const selectedStop = stopId ? cityData.stops.find(s => s.id === stopId) : cityData.stops[0]

  if (!selectedStop) {
    return NextResponse.json({ stops: cityData.stops, departures: [], cityName: cityData.name })
  }

  // In production: Use IDS BK API (Bratislava), DPMK API (Košice), DPMZ (Žilina), etc.
  // For now: generate realistic departures
  const departures = generateDepartures(selectedStop.id)

  return NextResponse.json({
    cityName: cityData.name,
    stops: cityData.stops,
    selectedStop,
    departures,
    timestamp: Date.now(),
  })
}
