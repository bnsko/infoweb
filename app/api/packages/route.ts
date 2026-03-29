import { NextResponse } from 'next/server'

export const revalidate = 300

interface PackageStatus {
  id: string
  carrier: string
  status: string
  lastUpdate: string
  location: string
  eta?: string
}

// Demo tracking - this would be replaced with real API integration
function getDemoPackages(): PackageStatus[] {
  return [
    { id: 'SK3812****45', carrier: 'Slovenská pošta', status: 'V doručovaní', lastUpdate: '08:30', location: 'Depo Bratislava', eta: 'Dnes' },
    { id: 'GLS928****12', carrier: 'GLS', status: 'Na ceste', lastUpdate: '07:15', location: 'Nitra → Bratislava', eta: 'Dnes' },
    { id: 'DPD384****67', carrier: 'DPD', status: 'Spracované', lastUpdate: 'Včera 22:10', location: 'Triedenie Senec', eta: 'Zajtra' },
  ]
}

// Carrier tracking URL patterns
const TRACKING_URLS: Record<string, string> = {
  'Slovenská pošta': 'https://tandt.posta.sk/',
  'GLS': 'https://gls-group.com/SK/sk/sledovanie-zasielok',
  'DPD': 'https://www.dpd.com/sk/sk/sledovanie-zasielok/',
  'SPS': 'https://www.sps-sro.sk/sledovanie/',
  'Packeta': 'https://tracking.packeta.com/',
  'InPost': 'https://inpost.sk/sledovanie',
  '123kurier': 'https://www.123kurier.sk/sledovanie/',
}

export async function GET() {
  return NextResponse.json({
    packages: getDemoPackages(),
    carriers: Object.entries(TRACKING_URLS).map(([name, url]) => ({ name, trackingUrl: url })),
    timestamp: Date.now(),
  })
}
