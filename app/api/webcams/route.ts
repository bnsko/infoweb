import { NextResponse } from 'next/server'

export const revalidate = 600

const WEBCAMS = [
  { id: 'ba-staromestska', name: 'Bratislava - Staromestská', city: 'Bratislava', url: 'https://www.skylinewebcams.com/en/webcam/slovensko/bratislavsky-kraj/bratislava.html', region: 'ba' },
  { id: 'ba-michalska', name: 'Bratislava - Michalská brána', city: 'Bratislava', url: 'https://www.skylinewebcams.com/en/webcam/slovensko/bratislavsky-kraj/bratislava/bratislava-hrad.html', region: 'ba' },
  { id: 'tatry-strbske', name: 'Štrbské Pleso', city: 'V. Tatry', url: 'https://www.vt.sk/webkamery/', region: 'tatry' },
  { id: 'tatry-lomnicky', name: 'Lomnický štít', city: 'V. Tatry', url: 'https://www.vt.sk/webkamery/', region: 'tatry' },
  { id: 'jasna-chopok', name: 'Jasná - Chopok', city: 'N. Tatry', url: 'https://www.jasna.sk/webkamery/', region: 'tatry' },
  { id: 'kosice-hlavna', name: 'Košice - Hlavná ulica', city: 'Košice', url: 'https://www.kosice.sk/', region: 'east' },
  { id: 'zilina-namestie', name: 'Žilina - Námestie', city: 'Žilina', url: 'https://www.zilina.sk/', region: 'west' },
  { id: 'demanovska', name: 'Demänovská dolina', city: 'N. Tatry', url: 'https://www.jasna.sk/webkamery/', region: 'tatry' },
]

const REGION_COLORS: Record<string, { bg: string; fg: string }> = {
  ba: { bg: 'hsl(210,30%,15%)', fg: 'hsl(210,70%,65%)' },
  tatry: { bg: 'hsl(145,25%,13%)', fg: 'hsl(145,60%,60%)' },
  east: { bg: 'hsl(40,25%,14%)', fg: 'hsl(40,70%,65%)' },
  west: { bg: 'hsl(270,25%,14%)', fg: 'hsl(270,60%,65%)' },
}

export async function GET() {
  const cams = WEBCAMS.map(cam => {
    const c = REGION_COLORS[cam.region] ?? REGION_COLORS.ba
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect fill='${c.bg}' width='400' height='300'/><text x='200' y='120' fill='${c.fg}' font-family='sans-serif' font-size='14' text-anchor='middle'>📹 ${cam.name}</text><text x='200' y='150' fill='%23888' font-family='sans-serif' font-size='11' text-anchor='middle'>${cam.city}</text><text x='200' y='185' fill='%23555' font-family='sans-serif' font-size='10' text-anchor='middle'>Klikni pre živý stream →</text></svg>`
    return {
      ...cam,
      image: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    }
  })

  return NextResponse.json({ webcams: cams })
}
