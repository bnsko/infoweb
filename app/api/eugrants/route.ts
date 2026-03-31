import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const EU_PROGRAMS = [
  { name: 'Plán obnovy a odolnosti SR', icon: '🇪🇺', budget: '6,3 mld €', description: 'Digitalizácia, zelená ekonomika, vzdelávanie, zdravotníctvo.', url: 'https://www.planobnovy.sk', status: 'active' },
  { name: 'Program Slovensko 2021-2027', icon: '🇸🇰', budget: '12,6 mld €', description: 'Hlavný operačný program EÚ fondov pre SR.', url: 'https://eurofondy.gov.sk', status: 'active' },
  { name: 'Horizont Európa', icon: '🔬', budget: '95,5 mld €', description: 'Výskum a inovácie. Pre firmy s R&D aktivitami.', url: 'https://ec.europa.eu/info/horizon-europe', status: 'active' },
  { name: 'COSME / SMP', icon: '🏢', budget: '4,2 mld €', description: 'Program pre MSP — prístup k financiám a trhom.', url: 'https://ec.europa.eu/growth/smes', status: 'active' },
  { name: 'Digitálna Európa', icon: '💻', budget: '7,6 mld €', description: 'AI, kybernetická bezpečnosť, digitálne zručnosti.', url: 'https://digital-strategy.ec.europa.eu', status: 'active' },
  { name: 'Erasmus+ pre podnikateľov', icon: '🎓', budget: '26,2 mld €', description: 'Výmenné pobyty pre začínajúcich podnikateľov.', url: 'https://www.erasmus-entrepreneurs.eu', status: 'active' },
  { name: 'LIFE – Životné prostredie', icon: '🌿', budget: '5,4 mld €', description: 'Zelené projekty, obehová ekonomika, klíma.', url: 'https://cinea.ec.europa.eu/programmes/life', status: 'active' },
  { name: 'Kreatívna Európa', icon: '🎨', budget: '2,4 mld €', description: 'Kultúrne a kreatívne odvetvia.', url: 'https://culture.ec.europa.eu/creative-europe', status: 'active' },
]

const SK_GRANTS = [
  { name: 'SBA – Národný projekt NPC', icon: '🚀', description: 'Bezplatné poradenstvo, coworking, mentoring pre MSP.', url: 'https://www.npc.sk' },
  { name: 'Inovujme.sk', icon: '💡', description: 'Inovačné vouchery do 15 000€ na spoluprácu s výskumníkmi.', url: 'https://inovujme.sk' },
  { name: 'SIEA – Zelená podnikom', icon: '♻️', description: 'Dotácie na fotovoltiku a energetiku pre firmy.', url: 'https://www.siea.sk' },
  { name: 'MH SR – Podpora cestovného ruchu', icon: '🏔️', description: 'Granty pre ubytovacie zariadenia a turistiku.', url: 'https://www.mhsr.sk' },
]

export async function GET() {
  return NextResponse.json({
    euPrograms: EU_PROGRAMS,
    skGrants: SK_GRANTS,
    totalBudgetEU: '160+ mld €',
    timestamp: Date.now(),
  })
}
