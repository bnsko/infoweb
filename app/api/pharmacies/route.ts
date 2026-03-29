import { NextResponse } from 'next/server'

export const revalidate = 600

interface Pharmacy {
  name: string
  city: string
  address: string
  phone: string
  isNight: boolean
  isEmergency: boolean
  openUntil: string
  distance?: string
}

// Major city pharmacies with emergency/night service
function getPharmacies(): Record<string, Pharmacy[]> {
  const now = new Date()
  const hour = now.getHours()
  const isNightTime = hour >= 22 || hour < 6
  const isWeekend = now.getDay() === 0 || now.getDay() === 6

  const data: Record<string, Pharmacy[]> = {
    'Bratislava': [
      { name: 'Lekáreň Dr. Max – Aupark', city: 'Bratislava', address: 'Einsteinova 18', phone: '+421 2 6381 1234', isNight: false, isEmergency: false, openUntil: '21:00' },
      { name: 'Lekáreň Na pohotovosti – NÚDCH', city: 'Bratislava', address: 'Limbová 1', phone: '+421 2 5937 1111', isNight: true, isEmergency: true, openUntil: '24h' },
      { name: 'Benu Lekáreň – Centrál', city: 'Bratislava', address: 'Metodova 6', phone: '+421 2 5292 5870', isNight: false, isEmergency: false, openUntil: '20:00' },
      { name: 'Lekáreň Nemocnica sv. Michala', city: 'Bratislava', address: 'Satinského 1', phone: '+421 2 3260 9130', isNight: true, isEmergency: true, openUntil: '24h' },
    ],
    'Košice': [
      { name: 'Lekáreň FN L. Pasteura', city: 'Košice', address: 'Rastislavova 43', phone: '+421 55 615 1111', isNight: true, isEmergency: true, openUntil: '24h' },
      { name: 'Lekáreň Dr. Max – Optima', city: 'Košice', address: 'Moldavská cesta 32', phone: '+421 55 729 1500', isNight: false, isEmergency: false, openUntil: '21:00' },
      { name: 'Benu Lekáreň – Aupark KE', city: 'Košice', address: 'Nám. Osloboditeľov 1', phone: '+421 55 321 4500', isNight: false, isEmergency: false, openUntil: '20:00' },
    ],
    'Žilina': [
      { name: 'Lekáreň FNsP Žilina', city: 'Žilina', address: 'V. Spanyola 43', phone: '+421 41 511 1111', isNight: true, isEmergency: true, openUntil: '24h' },
      { name: 'Lekáreň Dr. Max – Mirage', city: 'Žilina', address: 'Vysokoškolákov 52', phone: '+421 41 500 2200', isNight: false, isEmergency: false, openUntil: '20:00' },
    ],
    'Banská Bystrica': [
      { name: 'Lekáreň FNsP F.D. Roosevelta', city: 'B. Bystrica', address: 'Nám. L. Svobodu 1', phone: '+421 48 441 1111', isNight: true, isEmergency: true, openUntil: '24h' },
      { name: 'Benu Lekáreň – Europa SC', city: 'B. Bystrica', address: 'Na Troskách 25', phone: '+421 48 414 2100', isNight: false, isEmergency: false, openUntil: '20:00' },
    ],
    'Nitra': [
      { name: 'Lekáreň FN Nitra', city: 'Nitra', address: 'Špitálska 6', phone: '+421 37 654 1111', isNight: true, isEmergency: true, openUntil: '24h' },
    ],
    'Prešov': [
      { name: 'Lekáreň FNsP J. A. Reimana', city: 'Prešov', address: 'Hollého 14', phone: '+421 51 701 1111', isNight: true, isEmergency: true, openUntil: '24h' },
    ],
    'Trnava': [
      { name: 'Lekáreň FN Trnava', city: 'Trnava', address: 'A. Žarnova 11', phone: '+421 33 593 8111', isNight: true, isEmergency: true, openUntil: '24h' },
    ],
    'Trenčín': [
      { name: 'Lekáreň FN Trenčín', city: 'Trenčín', address: 'Legionárska 28', phone: '+421 32 656 6111', isNight: true, isEmergency: true, openUntil: '24h' },
    ],
  }

  // Filter: at night or weekends, only show night/emergency pharmacies prominently
  if (isNightTime || isWeekend) {
    for (const city of Object.keys(data)) {
      data[city] = data[city].sort((a, b) => (b.isNight ? 1 : 0) - (a.isNight ? 1 : 0))
    }
  }

  return data
}

export async function GET() {
  return NextResponse.json({
    pharmacies: getPharmacies(),
    timestamp: Date.now(),
  })
}
