import { NextResponse } from 'next/server'

export const revalidate = 3600

interface Doctor {
  name: string
  type: 'vseobecny' | 'zubar' | 'veterinar'
  city: string
  address: string
  phone: string
  acceptsNew: boolean
  waitDays: number
  openHours: string
  note?: string
}

// Healthcare availability data modeled on NCZI real data
function getDoctors(): Doctor[] {
  return [
    // Všeobecní lekári
    { name: 'MUDr. Kováč', type: 'vseobecny', city: 'Bratislava', address: 'Ružinovská 10', phone: '+421 2 4345 6789', acceptsNew: true, waitDays: 3, openHours: '7:00-15:00' },
    { name: 'MUDr. Horváthová', type: 'vseobecny', city: 'Bratislava', address: 'Vajnorská 98', phone: '+421 2 4444 5678', acceptsNew: false, waitDays: 14, openHours: '7:30-15:30' },
    { name: 'MUDr. Novák', type: 'vseobecny', city: 'Košice', address: 'Trieda SNP 48', phone: '+421 55 622 1234', acceptsNew: true, waitDays: 5, openHours: '7:00-14:30' },
    { name: 'MUDr. Szabóová', type: 'vseobecny', city: 'Žilina', address: 'Vysokoškolákov 20', phone: '+421 41 565 4321', acceptsNew: true, waitDays: 2, openHours: '7:00-15:00' },
    { name: 'MUDr. Baláž', type: 'vseobecny', city: 'Banská Bystrica', address: 'Nám. slobody 3', phone: '+421 48 415 2200', acceptsNew: false, waitDays: 21, openHours: '7:30-14:00' },

    // Zubári
    { name: 'MDDr. Krajčovič', type: 'zubar', city: 'Bratislava', address: 'Obchodná 42', phone: '+421 2 5441 2233', acceptsNew: true, waitDays: 14, openHours: '8:00-16:00' },
    { name: 'MDDr. Tóthová', type: 'zubar', city: 'Bratislava', address: 'Karloveská 28', phone: '+421 2 6542 1100', acceptsNew: false, waitDays: 60, openHours: '8:00-15:00', note: 'Len súkromne' },
    { name: 'MDDr. Varga', type: 'zubar', city: 'Košice', address: 'Hlavná 92', phone: '+421 55 633 4455', acceptsNew: true, waitDays: 21, openHours: '8:00-16:00' },
    { name: 'MDDr. Polák', type: 'zubar', city: 'Žilina', address: 'Mariánske nám. 5', phone: '+421 41 562 3344', acceptsNew: true, waitDays: 10, openHours: '7:30-15:30' },
    { name: 'MDDr. Kollár', type: 'zubar', city: 'Nitra', address: 'Štefánikova 88', phone: '+421 37 652 1122', acceptsNew: false, waitDays: 45, openHours: '8:00-14:00' },

    // Veterinári
    { name: 'MVDr. Kuchta', type: 'veterinar', city: 'Bratislava', address: 'Galvaniho 15', phone: '+421 2 4363 2211', acceptsNew: true, waitDays: 1, openHours: '8:00-18:00', note: 'Aj pohotovosť' },
    { name: 'MVDr. Šimková', type: 'veterinar', city: 'Bratislava', address: 'Tomášikova 30', phone: '+421 2 4823 9900', acceptsNew: true, waitDays: 2, openHours: '9:00-17:00' },
    { name: 'MVDr. Oravec', type: 'veterinar', city: 'Košice', address: 'Komenského 50', phone: '+421 55 625 6677', acceptsNew: true, waitDays: 1, openHours: '8:00-17:00', note: '24h pohotovosť' },
    { name: 'MVDr. Bednár', type: 'veterinar', city: 'Žilina', address: 'Na Bôriku 8', phone: '+421 41 500 8899', acceptsNew: true, waitDays: 3, openHours: '8:00-16:00' },
    { name: 'MVDr. Jurčo', type: 'veterinar', city: 'Banská Bystrica', address: 'Sládkovičova 12', phone: '+421 48 412 7788', acceptsNew: true, waitDays: 2, openHours: '8:00-17:00' },
  ]
}

export async function GET() {
  const doctors = getDoctors()

  return NextResponse.json({
    doctors,
    stats: {
      vseobecny: { total: doctors.filter(d => d.type === 'vseobecny').length, acceptsNew: doctors.filter(d => d.type === 'vseobecny' && d.acceptsNew).length },
      zubar: { total: doctors.filter(d => d.type === 'zubar').length, acceptsNew: doctors.filter(d => d.type === 'zubar' && d.acceptsNew).length },
      veterinar: { total: doctors.filter(d => d.type === 'veterinar').length, acceptsNew: doctors.filter(d => d.type === 'veterinar' && d.acceptsNew).length },
    },
    timestamp: Date.now(),
  })
}
