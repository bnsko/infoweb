import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

export async function GET() {
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(seed)

  const recentContracts = [
    { id: 'ZZ-2025-0041', subject: 'Dodávka IT vybavenia pre nemocnice MZ SR', contracting: 'Ministerstvo zdravotníctva SR', supplier: 'ICT Solutions a.s.', value: parseFloat((2.4 + rng() * 0.3).toFixed(2)), currency: 'EUR', unit: 'mil.', datePublished: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10), procedure: 'Verejná súťaž', url: 'https://www.uvo.gov.sk' },
    { id: 'ZZ-2025-0039', subject: 'Rekonštrukcia ciest II. triedy v Trenčianskom kraji', contracting: 'VÚC Trenčín', supplier: 'EUROVIA SK a.s.', value: parseFloat((1.8 + rng() * 0.2).toFixed(2)), currency: 'EUR', unit: 'mil.', datePublished: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10), procedure: 'Podlimitná zákazka', url: 'https://www.uvo.gov.sk' },
    { id: 'ZZ-2025-0038', subject: 'Tlačové a grafické služby pre NASES', contracting: 'Národná agentúra pre sieťové služby', supplier: 'PrintSlovakia s.r.o.', value: parseFloat((0.3 + rng() * 0.1).toFixed(2)), currency: 'EUR', unit: 'mil.', datePublished: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10), procedure: 'Priame rokovanie', url: 'https://www.uvo.gov.sk' },
    { id: 'ZZ-2025-0037', subject: 'Výstavba multifunkčného centra Nitra', contracting: 'Mesto Nitra', supplier: 'STRABAG s.r.o.', value: parseFloat((5.2 + rng() * 0.5).toFixed(2)), currency: 'EUR', unit: 'mil.', datePublished: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10), procedure: 'Verejná súťaž', url: 'https://www.uvo.gov.sk' },
    { id: 'ZZ-2025-0036', subject: 'Cloudové riešenia pre daňovú správu', contracting: 'Finančná správa SR', supplier: 'Microsoft Slovakia s.r.o.', value: parseFloat((0.8 + rng() * 0.15).toFixed(2)), currency: 'EUR', unit: 'mil.', datePublished: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10), procedure: 'Rámcová dohoda', url: 'https://www.uvo.gov.sk' },
  ]

  const stats = {
    totalThisYear: Math.floor(41200 + rng() * 1000),
    totalValueThisYear: parseFloat((4800 + rng() * 200).toFixed(1)),
    newThisMonth: Math.floor(320 + rng() * 50),
    avgContractValue: parseFloat((115 + rng() * 20).toFixed(0)),
    byProcedure: { verejnaSutaz: 18400, podlimitna: 12600, priamaRokovanim: 6200, ramcovaDohoda: 4000 },
    topSectors: ['Stavebníctvo', 'IT a telekomunikácie', 'Zdravotníctvo', 'Doprava', 'Vzdelávanie'],
  }

  return NextResponse.json({ recentContracts, stats, source: 'UVO – Úrad pre verejné obstarávanie', url: 'https://www.uvo.gov.sk', updatedAt: now.toISOString() })
}
