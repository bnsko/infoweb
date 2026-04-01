import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed + 888)

  const datasets = [
    { name: 'COVID-19 štatistiky', category: 'Pandémia', records: 2500000, updated: '2025-06-01', source: 'NCZI' },
    { name: 'Hospitalizácie', category: 'Nemocnice', records: 890000, updated: '2025-06-15', source: 'NCZI' },
    { name: 'Očkovania SR', category: 'Vakcinačný program', records: 15000000, updated: '2025-05-30', source: 'NCZI' },
    { name: 'Úmrtia podľa príčin', category: 'Mortalita', records: 320000, updated: '2025-04-01', source: 'ŠÚSR' },
    { name: 'Lekárne a výdajne', category: 'Zdravotnícke zariadenia', records: 2800, updated: '2025-06-10', source: 'NCZI' },
    { name: 'Nemocnice – kapacity', category: 'Nemocnice', records: 150, updated: '2025-06-14', source: 'NCZI' },
    { name: 'Lekári a zdravotníci', category: 'Personál', records: 85000, updated: '2025-06-01', source: 'NCZI' },
    { name: 'DRG hospitalizácie', category: 'Nemocnice', records: 1200000, updated: '2025-05-15', source: 'NCZI' },
    { name: 'eRecept – výdaje liekov', category: 'eHealth', records: 45000000, updated: '2025-06-15', source: 'NCZI' },
    { name: 'Čakacie doby', category: 'Nemocnice', records: 5400, updated: '2025-06-12', source: 'NCZI' },
  ]

  const vaccinationCenters = [
    { name: 'VFBA Kramáre', city: 'Bratislava', capacity: 500, active: true, vaccines: ['COVID-19', 'Chrípka'] },
    { name: 'Poliklinika Ružinov', city: 'Bratislava', capacity: 300, active: true, vaccines: ['COVID-19'] },
    { name: 'NsP Štefana Kukuru', city: 'Michalovce', capacity: 200, active: true, vaccines: ['COVID-19', 'Chrípka'] },
    { name: 'FN Košice', city: 'Košice', capacity: 400, active: true, vaccines: ['COVID-19', 'Chrípka'] },
    { name: 'UNM Martin', city: 'Martin', capacity: 250, active: rng() > 0.2, vaccines: ['COVID-19'] },
    { name: 'FN Nitra', city: 'Nitra', capacity: 200, active: true, vaccines: ['COVID-19'] },
    { name: 'NsP Poprad', city: 'Poprad', capacity: 150, active: rng() > 0.3, vaccines: ['COVID-19'] },
    { name: 'UN Banská Bystrica', city: 'B. Bystrica', capacity: 350, active: true, vaccines: ['COVID-19', 'Chrípka'] },
  ]

  const hospitals = [
    { name: 'UN Bratislava – Kramáre', city: 'Bratislava', beds: 1200, icu: 65, occupancy: +(70 + rng() * 25).toFixed(0), emergency: true },
    { name: 'UN Bratislava – Ružinov', city: 'Bratislava', beds: 800, icu: 40, occupancy: +(65 + rng() * 25).toFixed(0), emergency: true },
    { name: 'UNLP Košice', city: 'Košice', beds: 1500, icu: 80, occupancy: +(60 + rng() * 30).toFixed(0), emergency: true },
    { name: 'UNM Martin', city: 'Martin', beds: 900, icu: 50, occupancy: +(55 + rng() * 30).toFixed(0), emergency: true },
    { name: 'FN Nitra', city: 'Nitra', beds: 700, icu: 35, occupancy: +(60 + rng() * 25).toFixed(0), emergency: true },
    { name: 'FNsP Žilina', city: 'Žilina', beds: 600, icu: 30, occupancy: +(60 + rng() * 30).toFixed(0), emergency: true },
    { name: 'UN BB – Roosevelt', city: 'B. Bystrica', beds: 1000, icu: 55, occupancy: +(65 + rng() * 25).toFixed(0), emergency: true },
    { name: 'NsP Trenčín', city: 'Trenčín', beds: 500, icu: 25, occupancy: +(55 + rng() * 30).toFixed(0), emergency: true },
  ]

  const stats = {
    totalHospitals: 98,
    totalBeds: 33500,
    totalDoctors: 20100,
    totalNurses: 32000,
    avgWaitDays: +(15 + rng() * 20).toFixed(0),
    eReceptsToday: Math.floor(80000 + rng() * 40000),
  }

  return NextResponse.json({ datasets, vaccinationCenters, hospitals, stats, timestamp: Date.now() })
}
