import { NextResponse } from 'next/server'

export const revalidate = 3600

interface Grant { id: string; title: string; agency: string; deadline: string; maxAmount: number; area: string; status: 'open' | 'upcoming' | 'closed'; url: string; description: string }

const GRANTS: Grant[] = [
  { id: 'apvv-2025-001', title: 'APVV-24-SK: Základný výskum v prírodných vedách', agency: 'APVV', deadline: '2025-06-30', maxAmount: 300000, area: 'Prírodné vedy', status: 'open', url: 'https://www.apvv.sk', description: 'Grant pre výskum v oblasti chémie, fyziky a biológie. Podmienka: aspoň 1 zahraničný partner.' },
  { id: 'apvv-2025-002', title: 'APVV-24-TK: Technické aplikácie a inovácie', agency: 'APVV', deadline: '2025-06-30', maxAmount: 500000, area: 'Technika', status: 'open', url: 'https://www.apvv.sk', description: 'Podpora projektov s priamym technologickým uplatnením a spolufinancovaním z priemyslu.' },
  { id: 'apvv-2025-003', title: 'APVV-24-LH: Lekárske a humanitné vedy', agency: 'APVV', deadline: '2025-05-15', maxAmount: 250000, area: 'Zdravie & humanitné vedy', status: 'upcoming', url: 'https://www.apvv.sk', description: 'Granty pre lekársky výskum, psychológiu a spoločenské vedy.' },
  { id: 'vega-2025-001', title: 'VEGA: Vedecký grant pre mladých výskumníkov', agency: 'VEGA', deadline: '2025-09-30', maxAmount: 80000, area: 'Všeobecný výskum', status: 'open', url: 'https://www.minedu.sk/vega', description: 'VEGA granty pre výskum na SAV a vysokých školách. Max vek PI: 35 rokov.' },
  { id: 'ega-2025-001', title: 'KEGA: Kultúrna a edukačná grantová agentúra', agency: 'KEGA', deadline: '2025-10-01', maxAmount: 60000, area: 'Vzdelávanie', status: 'upcoming', url: 'https://www.minedu.sk/kega', description: 'Podpora rozvoja vzdelávacích procesov, učebníc a pedagogických inovácií.' },
  { id: 'horizon-2025-001', title: 'Horizon Europe: Digital & Industry', agency: 'EÚ', deadline: '2025-11-20', maxAmount: 5000000, area: 'Digitalizácia', status: 'open', url: 'https://ec.europa.eu/info/funding-tenders', description: 'Európsky program pre výskum v oblasti digitálnych technológií, AI a kybernetickej bezpečnosti.' },
]

export async function GET() {
  const now = new Date()
  const open = GRANTS.filter(g => {
    const dl = new Date(g.deadline)
    return dl > now
  })
  return NextResponse.json({ grants: GRANTS, openCount: open.length, source: 'APVV / VEGA / EÚ' })
}
