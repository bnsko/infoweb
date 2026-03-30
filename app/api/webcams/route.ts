import { NextResponse } from 'next/server'

export const revalidate = 600

const WEBCAMS = [
  { id: 'ba-staromestska', name: 'Bratislava - Staromestská', city: 'Bratislava', url: 'https://www.skylinewebcams.com/en/webcam/slovensko/bratislavsky-kraj/bratislava.html', region: 'ba', windyId: '1578209770' },
  { id: 'ba-michalska', name: 'Bratislava - Michalská brána', city: 'Bratislava', url: 'https://www.skylinewebcams.com/en/webcam/slovensko/bratislavsky-kraj/bratislava/bratislava-hrad.html', region: 'ba', windyId: '1294938850' },
  { id: 'tatry-strbske', name: 'Štrbské Pleso', city: 'V. Tatry', url: 'https://www.vt.sk/webkamery/', region: 'tatry', windyId: '1438879714' },
  { id: 'tatry-lomnicky', name: 'Lomnický štít', city: 'V. Tatry', url: 'https://www.vt.sk/webkamery/', region: 'tatry', windyId: '1619271565' },
  { id: 'jasna-chopok', name: 'Jasná - Chopok', city: 'N. Tatry', url: 'https://www.jasna.sk/webkamery/', region: 'tatry', windyId: '1439015949' },
  { id: 'kosice-hlavna', name: 'Košice - Hlavná ulica', city: 'Košice', url: 'https://www.kosice.sk/', region: 'east', windyId: '1560960474' },
  { id: 'zilina-namestie', name: 'Žilina - Námestie', city: 'Žilina', url: 'https://www.zilina.sk/', region: 'west', windyId: '' },
  { id: 'demanovska', name: 'Demänovská dolina', city: 'N. Tatry', url: 'https://www.jasna.sk/webkamery/', region: 'tatry', windyId: '1439015950' },
]

const REGION_COLORS: Record<string, { bg: string; fg: string }> = {
  ba: { bg: 'hsl(210,30%,15%)', fg: 'hsl(210,70%,65%)' },
  tatry: { bg: 'hsl(145,25%,13%)', fg: 'hsl(145,60%,60%)' },
  east: { bg: 'hsl(40,25%,14%)', fg: 'hsl(40,70%,65%)' },
  west: { bg: 'hsl(270,25%,14%)', fg: 'hsl(270,60%,65%)' },
}

async function tryFetchWindyThumbnail(windyId: string): Promise<string | null> {
  if (!windyId) return null
  try {
    // Windy webcams serve thumbnails at this public URL pattern
    const url = `https://images-webcams.windy.com/70/${windyId}/current/thumbnail/${windyId}.jpg`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)' },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok && res.headers.get('content-type')?.includes('image')) {
      return url
    }
    return null
  } catch {
    return null
  }
}

export async function GET() {
  // Try to fetch real thumbnails in parallel
  const thumbnailResults = await Promise.allSettled(
    WEBCAMS.map(cam => tryFetchWindyThumbnail(cam.windyId))
  )

  const cams = WEBCAMS.map((cam, i) => {
    const thumbnail = thumbnailResults[i].status === 'fulfilled' ? thumbnailResults[i].value : null

    let image = thumbnail ?? ''
    if (!image) {
      const c = REGION_COLORS[cam.region] ?? REGION_COLORS.ba
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect fill='${c.bg}' width='400' height='300'/><text x='200' y='120' fill='${c.fg}' font-family='sans-serif' font-size='14' text-anchor='middle'>📹 ${cam.name}</text><text x='200' y='150' fill='%23888' font-family='sans-serif' font-size='11' text-anchor='middle'>${cam.city}</text><text x='200' y='185' fill='%23555' font-family='sans-serif' font-size='10' text-anchor='middle'>Klikni pre živý stream →</text></svg>`
      image = `data:image/svg+xml,${encodeURIComponent(svg)}`
    }

    return {
      ...cam,
      image,
    }
  })

  return NextResponse.json({ webcams: cams })
}
