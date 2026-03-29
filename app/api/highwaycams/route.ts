import { NextResponse } from 'next/server'

export const revalidate = 600

// Curated list of Slovak highway cameras (static data, images from real providers)
const CAMERAS = [
  { id: 'ba-d1-pristavny', name: 'D1 Prístavný most', location: 'Bratislava', image: 'https://kamery.ndsas.sk/cam/ba-pristavny.jpg', road: 'D1' },
  { id: 'ba-d2-lafranconi', name: 'D2 Most Lafranconi', location: 'Bratislava', image: 'https://kamery.ndsas.sk/cam/ba-lafranconi.jpg', road: 'D2' },
  { id: 'ba-d1-golden', name: 'D1 Golden Sands', location: 'Bratislava', image: 'https://kamery.ndsas.sk/cam/ba-goldensands.jpg', road: 'D1' },
  { id: 'd1-trnava', name: 'D1 Trnava', location: 'Trnava', image: 'https://kamery.ndsas.sk/cam/d1-trnava.jpg', road: 'D1' },
  { id: 'd1-piestany', name: 'D1 Piešťany', location: 'Piešťany', image: 'https://kamery.ndsas.sk/cam/d1-piestany.jpg', road: 'D1' },
  { id: 'd1-trencin', name: 'D1 Trenčín', location: 'Trenčín', image: 'https://kamery.ndsas.sk/cam/d1-trencin.jpg', road: 'D1' },
  { id: 'd1-zilina', name: 'D1 Žilina - Strážov', location: 'Žilina', image: 'https://kamery.ndsas.sk/cam/d1-zilina.jpg', road: 'D1' },
  { id: 'd1-ruzomberok', name: 'D1 Ružomberok', location: 'Ružomberok', image: 'https://kamery.ndsas.sk/cam/d1-ruzomberok.jpg', road: 'D1' },
  { id: 'd1-poprad', name: 'D1 Poprad', location: 'Poprad', image: 'https://kamery.ndsas.sk/cam/d1-poprad.jpg', road: 'D1' },
  { id: 'd1-presov', name: 'D1 Prešov - juh', location: 'Prešov', image: 'https://kamery.ndsas.sk/cam/d1-presov.jpg', road: 'D1' },
  { id: 'r1-bb', name: 'R1 Banská Bystrica', location: 'B. Bystrica', image: 'https://kamery.ndsas.sk/cam/r1-bb.jpg', road: 'R1' },
  { id: 'd2-ku', name: 'D2 Kúty (CZ border)', location: 'Kúty', image: 'https://kamery.ndsas.sk/cam/d2-kuty.jpg', road: 'D2' },
]

export async function GET() {
  const ts = Math.floor(Date.now() / 60000)
  const cameras = CAMERAS.map(c => ({ ...c, image: c.image + `?t=${ts}` }))

  return NextResponse.json({ cameras, timestamp: Date.now() })
}
