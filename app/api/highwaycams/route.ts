import { NextResponse } from 'next/server'

export const revalidate = 300

const CAMERAS = [
  { id: 'ba-d1-pristavny', name: 'D1 Prístavný most', location: 'Bratislava', road: 'D1', ndsId: '10' },
  { id: 'ba-d2-lafranconi', name: 'D2 Most Lafranconi', location: 'Bratislava', road: 'D2', ndsId: '11' },
  { id: 'ba-d1-golden', name: 'D1 Zlaté Piesky', location: 'Bratislava', road: 'D1', ndsId: '13' },
  { id: 'd1-trnava', name: 'D1 Trnava', location: 'Trnava', road: 'D1', ndsId: '20' },
  { id: 'd1-piestany', name: 'D1 Piešťany', location: 'Piešťany', road: 'D1', ndsId: '25' },
  { id: 'd1-trencin', name: 'D1 Trenčín', location: 'Trenčín', road: 'D1', ndsId: '30' },
  { id: 'd1-zilina', name: 'D1 Žilina - Strážov', location: 'Žilina', road: 'D1', ndsId: '40' },
  { id: 'd1-ruzomberok', name: 'D1 Ružomberok', location: 'Ružomberok', road: 'D1', ndsId: '45' },
  { id: 'd1-poprad', name: 'D1 Poprad', location: 'Poprad', road: 'D1', ndsId: '55' },
  { id: 'd1-presov', name: 'D1 Prešov - juh', location: 'Prešov', road: 'D1', ndsId: '60' },
  { id: 'r1-bb', name: 'R1 Banská Bystrica', location: 'B. Bystrica', road: 'R1', ndsId: '70' },
  { id: 'd2-ku', name: 'D2 Kúty (CZ border)', location: 'Kúty', road: 'D2', ndsId: '15' },
]

async function fetchNDSCameras(): Promise<{ id: string; imageUrl: string }[]> {
  try {
    const res = await fetch('https://mcp.ndsas.sk/camera-board/cameras', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map((c: { id?: string; imageUrl?: string; snapshotUrl?: string }) => ({
      id: String(c.id ?? ''),
      imageUrl: c.snapshotUrl ?? c.imageUrl ?? '',
    })).filter((c: { id: string; imageUrl: string }) => c.imageUrl)
  } catch {
    return []
  }
}

export async function GET() {
  const ndsCams = await fetchNDSCameras()

  const cameras = CAMERAS.map((c, i) => {
    // Try to match NDS camera by ID
    const nds = ndsCams.find(n => n.id === c.ndsId)
    let image = nds?.imageUrl ?? ''

    // If no real image, generate placeholder
    if (!image) {
      const hue = (i * 30) % 360
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'><rect fill='hsl(${hue},25%,15%)' width='400' height='225'/><text x='200' y='90' fill='hsl(${hue},60%,70%)' font-family='sans-serif' font-size='16' text-anchor='middle'>📷 ${c.name}</text><text x='200' y='120' fill='%23999' font-family='sans-serif' font-size='12' text-anchor='middle'>${c.location} · ${c.road}</text><text x='200' y='155' fill='%23666' font-family='sans-serif' font-size='10' text-anchor='middle'>Živý obraz na dialnicnekamery.sk</text></svg>`
      image = `data:image/svg+xml,${encodeURIComponent(svg)}`
    }

    return {
      ...c,
      image,
      link: `https://www.dialnicnekamery.sk/`,
    }
  })

  return NextResponse.json({ cameras, timestamp: Date.now() })
}

