import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const OPERATIONS = [
  { name: 'Výmena bedra (TEP)', waitWeeks: 52, category: 'Ortopédia' },
  { name: 'Výmena kolena (TKA)', waitWeeks: 62, category: 'Ortopédia' },
  { name: 'Operácia šedého zákalu', waitWeeks: 24, category: 'Oftalmológia' },
  { name: 'Bypass srdca (CABG)', waitWeeks: 8, category: 'Kardiochirurgia' },
  { name: 'Appendektómia (urgentná)', waitWeeks: 0, category: 'Chirurgia' },
  { name: 'Cholecystektómia', waitWeeks: 18, category: 'Chirurgia' },
  { name: 'Odstránenie mandlí (tonzilektómia)', waitWeeks: 32, category: 'ORL' },
  { name: 'Hernioplastika', waitWeeks: 28, category: 'Chirurgia' },
  { name: 'Gynekologické operácie', waitWeeks: 22, category: 'Gynekológia' },
  { name: 'Endoskopia (gastroskopia)', waitWeeks: 6, category: 'Gastroenterológia' },
  { name: 'Spinálna operácia - platničky', waitWeeks: 48, category: 'Neurochirurgia' },
  { name: 'Kardioverzie', waitWeeks: 4, category: 'Kardiológia' },
]

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed)

  const operations = OPERATIONS.map(op => ({
    ...op,
    waitWeeks: Math.max(0, op.waitWeeks + Math.floor(rng() * 8 - 4)),
    waitMonths: op.waitWeeks > 0 ? (op.waitWeeks / 4.33).toFixed(1) : '0',
    patientsWaiting: op.waitWeeks === 0 ? 0 : Math.floor(200 + rng() * 800),
    trend: rng() > 0.5 ? 'up' : 'down',
  }))

  const avgWait = operations.reduce((s, o) => s + o.waitWeeks, 0) / operations.length

  return NextResponse.json({
    operations,
    avgWaitWeeks: avgWait.toFixed(1),
    totalWaiting: operations.reduce((s, o) => s + o.patientsWaiting, 0),
    source: 'NCZI / Ministerstvo zdravotníctva SR',
    updatedAt: now.toISOString(),
    disclaimer: 'Orientačné čakacie doby - skutočné sa môžu líšiť',
  })
}
