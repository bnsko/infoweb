import { NextResponse } from 'next/server'

export const revalidate = 600

// Curated list of real public webcams in Slovakia
const WEBCAMS = [
  { id: 'ba-castle', name: 'Bratislava - Hrad', city: 'Bratislava', image: 'https://www.bfronta.sk/cam/bratislava-hrad.jpg', url: 'https://www.bfronta.sk/', region: 'ba' },
  { id: 'ba-danube', name: 'Bratislava - Dunaj', city: 'Bratislava', image: 'https://www.bfronta.sk/cam/bratislava-dunaj.jpg', url: 'https://www.bfronta.sk/', region: 'ba' },
  { id: 'tatry-lomnicky', name: 'Lomnický štít', city: 'V. Tatry', image: 'https://kamery.vt.sk/data/lomnicky/lomnicky_stit-actual.jpg', url: 'https://kamery.vt.sk/', region: 'tatry' },
  { id: 'tatry-strbske', name: 'Štrbské Pleso', city: 'V. Tatry', image: 'https://kamery.vt.sk/data/strbske/strbske_pleso-actual.jpg', url: 'https://kamery.vt.sk/', region: 'tatry' },
  { id: 'tatry-jasna', name: 'Jasná - Chopok', city: 'N. Tatry', image: 'https://www.jasna.sk/media/webcam/chopok-juh01.jpg', url: 'https://www.jasna.sk/', region: 'tatry' },
  { id: 'kosice-center', name: 'Košice - Hlavná ulica', city: 'Košice', image: 'https://www.kosice.sk/webkamera/hlavna.jpg', url: 'https://www.kosice.sk/', region: 'east' },
  { id: 'zilina-center', name: 'Žilina - Námestie', city: 'Žilina', image: 'https://kamery.zamoravou.sk/zilina/namestie.jpg', url: '#', region: 'west' },
  { id: 'demanovska', name: 'Demänovská dolina', city: 'N. Tatry', image: 'https://www.jasna.sk/media/webcam/demanovska01.jpg', url: 'https://www.jasna.sk/', region: 'tatry' },
]

export async function GET() {
  // Add cache-bust timestamp to images
  const ts = Math.floor(Date.now() / 60000) // change every minute
  const cams = WEBCAMS.map(cam => ({
    ...cam,
    image: cam.image + (cam.image.includes('?') ? '&' : '?') + `t=${ts}`,
  }))

  return NextResponse.json({ webcams: cams })
}
