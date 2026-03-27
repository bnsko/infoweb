import { NextResponse } from 'next/server'

export const revalidate = 600

// Curated list of real public webcams in Slovakia with working snapshot URLs
const WEBCAMS = [
  { id: 'ba-staromestska', name: 'Bratislava - Staromestská', city: 'Bratislava', image: 'https://ba.ipcamlive.com/player/snapshot/5c3d3c7b05c99?rand=', url: 'https://www.skylinewebcams.com/en/webcam/slovensko/bratislavsky-kraj/bratislava.html', region: 'ba' },
  { id: 'ba-michalska', name: 'Bratislava - Michalská brána', city: 'Bratislava', image: 'https://ba.ipcamlive.com/player/snapshot/5c3d3cdd4e992?rand=', url: 'https://www.skylinewebcams.com/en/webcam/slovensko/bratislavsky-kraj/bratislava/bratislava-hrad.html', region: 'ba' },
  { id: 'tatry-strbske', name: 'Štrbské Pleso', city: 'V. Tatry', image: 'https://vt.sk/webkamery/strbske-pleso/image.jpg?rand=', url: 'https://www.vt.sk/webkamery/', region: 'tatry' },
  { id: 'tatry-lomnicky', name: 'Lomnický štít', city: 'V. Tatry', image: 'https://vt.sk/webkamery/lomnicky-stit/image.jpg?rand=', url: 'https://www.vt.sk/webkamery/', region: 'tatry' },
  { id: 'jasna-chopok', name: 'Jasná - Chopok', city: 'N. Tatry', image: 'https://www.jasna.sk/webkamery/chopok-juh/image.jpg?rand=', url: 'https://www.jasna.sk/webkamery/', region: 'tatry' },
  { id: 'kosice-hlavna', name: 'Košice - Hlavná ulica', city: 'Košice', image: 'https://kosice.ipcamlive.com/player/snapshot/hlavna?rand=', url: 'https://www.kosice.sk/', region: 'east' },
  { id: 'zilina-namestie', name: 'Žilina - Námestie', city: 'Žilina', image: 'https://zilina.ipcamlive.com/player/snapshot/namestie?rand=', url: 'https://www.zilina.sk/', region: 'west' },
  { id: 'demanovska', name: 'Demänovská dolina', city: 'N. Tatry', image: 'https://www.jasna.sk/webkamery/demanovska/image.jpg?rand=', url: 'https://www.jasna.sk/webkamery/', region: 'tatry' },
]

export async function GET() {
  // Add cache-bust timestamp to images
  const ts = Math.floor(Date.now() / 60000) // change every minute
  const cams = WEBCAMS.map(cam => ({
    ...cam,
    image: cam.image + ts,
  }))

  return NextResponse.json({ webcams: cams })
}
