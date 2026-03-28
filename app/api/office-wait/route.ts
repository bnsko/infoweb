import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Slovak government offices - estimated wait times based on typical patterns
// In production, this would connect to real-time queue systems
const OFFICES = [
  { id: 'ou-ba', name: 'Okresný úrad Bratislava', type: 'ou', city: 'Bratislava' },
  { id: 'ou-ke', name: 'Okresný úrad Košice', type: 'ou', city: 'Košice' },
  { id: 'ou-za', name: 'Okresný úrad Žilina', type: 'ou', city: 'Žilina' },
  { id: 'ou-bb', name: 'Okresný úrad B. Bystrica', type: 'ou', city: 'B. Bystrica' },
  { id: 'ou-nr', name: 'Okresný úrad Nitra', type: 'ou', city: 'Nitra' },
  { id: 'ou-po', name: 'Okresný úrad Prešov', type: 'ou', city: 'Prešov' },
  { id: 'ou-tt', name: 'Okresný úrad Trnava', type: 'ou', city: 'Trnava' },
  { id: 'ou-tn', name: 'Okresný úrad Trenčín', type: 'ou', city: 'Trenčín' },
]

const DEPARTMENTS = [
  { key: 'doklady', label: 'Doklady (OP, cestovný pas)', icon: '🪪' },
  { key: 'evidencia', label: 'Evidencia vozidiel', icon: '🚗' },
  { key: 'zivnost', label: 'Živnostenský odbor', icon: '💼' },
  { key: 'kataster', label: 'Kataster nehnuteľností', icon: '🏠' },
  { key: 'cudzinci', label: 'Cudzinecká polícia', icon: '🛂' },
]

function estimateWait(officeId: string, dept: string, hour: number, dayOfWeek: number): number {
  // Simulate realistic patterns
  const seed = officeId.length * 7 + dept.length * 13 + hour * 3 + dayOfWeek * 5
  const base = (seed % 30) + 5

  // Busier in mornings (8-11) and just after lunch (13-14)
  const hourFactor = (hour >= 8 && hour <= 11) ? 2.5 : (hour >= 13 && hour <= 14) ? 1.8 : (hour >= 15) ? 0.6 : 1.0

  // Monday and Friday are busiest
  const dayFactor = (dayOfWeek === 1) ? 2.0 : (dayOfWeek === 5) ? 1.8 : (dayOfWeek === 0 || dayOfWeek === 6) ? 0 : 1.2

  // Doklady and evidencia are always busiest
  const deptFactor = (dept === 'doklady') ? 2.2 : (dept === 'evidencia') ? 1.8 : (dept === 'kataster') ? 1.5 : 1.0

  // Bratislava and Kosice have more people
  const cityFactor = officeId.includes('ba') ? 1.8 : officeId.includes('ke') ? 1.4 : 1.0

  const wait = Math.round(base * hourFactor * dayFactor * deptFactor * cityFactor / 4)
  return dayFactor === 0 ? 0 : Math.max(5, Math.min(180, wait))
}

export async function GET() {
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()
  const isOpen = dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 8 && hour < 16

  const officeData = OFFICES.map(office => ({
    ...office,
    isOpen,
    departments: DEPARTMENTS.map(dept => ({
      ...dept,
      estimatedWait: isOpen ? estimateWait(office.id, dept.key, hour, dayOfWeek) : 0,
      queueLength: isOpen ? Math.round(estimateWait(office.id, dept.key, hour, dayOfWeek) / 8) : 0,
    })),
  }))

  // Tips
  const tips = []
  if (dayOfWeek === 1) tips.push('Pondelok je najvyťaženejší deň - zvážte návštevu v stredu')
  if (hour >= 8 && hour <= 10) tips.push('Ranné hodiny sú najvyťaženejšie')
  if (hour >= 14 && hour <= 15) tips.push('Teraz je ideálny čas na návštevu - krátke čakacie doby')
  if (dayOfWeek === 0 || dayOfWeek === 6) tips.push('Cez víkend sú úrady zatvorené')

  return NextResponse.json({
    offices: officeData,
    departments: DEPARTMENTS,
    tips,
    isOpen,
    lastUpdate: Date.now(),
  })
}
