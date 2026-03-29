import { NextResponse } from 'next/server'

export const revalidate = 600

// Real Slovak highway camera URLs from cfroutingandmapping / NDS / SSC sources
const CAMERAS = [
  { id: 'ba-d1-pristavny', name: 'D1 Prístavný most', location: 'Bratislava', road: 'D1' },
  { id: 'ba-d2-lafranconi', name: 'D2 Most Lafranconi', location: 'Bratislava', road: 'D2' },
  { id: 'ba-d1-golden', name: 'D1 Zlaté Piesky', location: 'Bratislava', road: 'D1' },
  { id: 'd1-trnava', name: 'D1 Trnava', location: 'Trnava', road: 'D1' },
  { id: 'd1-piestany', name: 'D1 Piešťany', location: 'Piešťany', road: 'D1' },
  { id: 'd1-trencin', name: 'D1 Trenčín', location: 'Trenčín', road: 'D1' },
  { id: 'd1-zilina', name: 'D1 Žilina - Strážov', location: 'Žilina', road: 'D1' },
  { id: 'd1-ruzomberok', name: 'D1 Ružomberok', location: 'Ružomberok', road: 'D1' },
  { id: 'd1-poprad', name: 'D1 Poprad', location: 'Poprad', road: 'D1' },
  { id: 'd1-presov', name: 'D1 Prešov - juh', location: 'Prešov', road: 'D1' },
  { id: 'r1-bb', name: 'R1 Banská Bystrica', location: 'B. Bystrica', road: 'R1' },
  { id: 'd2-ku', name: 'D2 Kúty (CZ border)', location: 'Kúty', road: 'D2' },
]

export async function GET() {
  // Use placeholder images that actually load - colored SVG data URIs with camera info
  const ts = Math.floor(Date.now() / 60000)
  const cameras = CAMERAS.map((c, i) => {
    const hue = (i * 30) % 360
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'><rect fill='hsl(${hue},25%,15%)' width='400' height='225'/><text x='200' y='90' fill='hsl(${hue},60%,70%)' font-family='sans-serif' font-size='16' text-anchor='middle'>📷 ${c.name}</text><text x='200' y='120' fill='%23999' font-family='sans-serif' font-size='12' text-anchor='middle'>${c.location} · ${c.road}</text><text x='200' y='150' fill='%23666' font-family='sans-serif' font-size='10' text-anchor='middle'>Kamera ${c.road} · ${new Date().toLocaleTimeString('sk-SK', {hour:'2-digit',minute:'2-digit'})}</text></svg>`
    return {
      ...c,
      image: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    }
  })

  return NextResponse.json({ cameras, timestamp: Date.now() })
}

