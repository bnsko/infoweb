import { NextResponse } from 'next/server'

export const revalidate = 3600

interface Alert { id: string; title: string; level: 'red' | 'orange' | 'yellow' | 'green'; date: string; type: string; description: string; url: string }

const MOCK_ALERTS: Alert[] = [
  { id: 'nbu-2025-001', title: 'Varovanie pred dezinformačnou kampaňou', level: 'red', date: new Date(Date.now() - 1 * 86400000).toISOString(), type: 'Hybridná hrozba', description: 'NBÚ eviduje koordinovanú dezinformačnú kampaň v sociálnych médiách zameranú na destabilizáciu spoločnosti.', url: 'https://www.nbu.gov.sk' },
  { id: 'nbu-2025-002', title: 'Kybernetický útok na kritickú infraštruktúru', level: 'orange', date: new Date(Date.now() - 3 * 86400000).toISOString(), type: 'Kybernetická hrozba', description: 'Zaznamenané pokusy o narušenie energetickej infraštruktúry. Zvýšená ostražitosť operátorov.', url: 'https://www.nbu.gov.sk' },
  { id: 'nbu-2025-003', title: 'Upozornenie na zahraničnú špionáž', level: 'orange', date: new Date(Date.now() - 5 * 86400000).toISOString(), type: 'Spravodajská hrozba', description: 'NBÚ upozorňuje na aktivity cudzích spravodajských služieb voči slovenským subjektom.', url: 'https://www.nbu.gov.sk' },
  { id: 'nbu-2025-004', title: 'Zvýšená hrozba DDoS útokov', level: 'yellow', date: new Date(Date.now() - 8 * 86400000).toISOString(), type: 'Kybernetická hrozba', description: 'Evidujeme nárast DDoS útokov na slovenské vládne webové stránky.', url: 'https://www.nbu.gov.sk' },
]

export async function GET() {
  const threatLevel = MOCK_ALERTS.some(a => a.level === 'red') ? 'red' : 
                      MOCK_ALERTS.some(a => a.level === 'orange') ? 'orange' : 'yellow'
  return NextResponse.json({ 
    alerts: MOCK_ALERTS, 
    threatLevel,
    source: 'NBÚ',
    disclaimer: 'Demo dáta - pozri nbu.gov.sk pre aktuálne upozornenia'
  })
}
