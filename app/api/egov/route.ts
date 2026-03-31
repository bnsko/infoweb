import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const EGOV_SERVICES = [
  { name: 'Slovensko.sk', icon: '🏛️', url: 'https://www.slovensko.sk', description: 'Ústredný portál verejnej správy', category: 'hlavné' },
  { name: 'OverSi', icon: '📋', url: 'https://oversi.gov.sk', description: 'Overenie SI – výpisy registrov', category: 'registre' },
  { name: 'ORSR', icon: '🏢', url: 'https://www.orsr.sk', description: 'Obchodný register SR', category: 'registre' },
  { name: 'ŽR SR', icon: '📝', url: 'https://www.zrsr.sk', description: 'Živnostenský register SR', category: 'registre' },
  { name: 'FinStat', icon: '📊', url: 'https://finstat.sk', description: 'Finančné údaje firiem', category: 'financie' },
  { name: 'RPVS', icon: '🔍', url: 'https://rpvs.gov.sk', description: 'Register partnerov verejného sektora', category: 'registre' },
  { name: 'Kataster', icon: '🗺️', url: 'https://kataster.skgeodesy.sk', description: 'Katasterportál – nehnuteľnosti', category: 'registre' },
  { name: 'eŽaloby', icon: '⚖️', url: 'https://obcan.justice.sk', description: 'Elektronické podania na súd', category: 'justícia' },
  { name: 'ÚPVS', icon: '📬', url: 'https://schranka.slovensko.sk', description: 'Elektronická schránka', category: 'hlavné' },
  { name: 'eID', icon: '🪪', url: 'https://www.slovensko.sk/sk/eid', description: 'Elektronický občiansky preukaz', category: 'identita' },
  { name: 'CRZ', icon: '📄', url: 'https://crz.gov.sk', description: 'Centrálny register zmlúv', category: 'registre' },
  { name: 'Socpoist', icon: '🏥', url: 'https://www.socpoist.sk', description: 'Sociálna poisťovňa', category: 'poistenie' },
]

const SK_USEFUL = [
  { name: 'Bazos.sk', icon: '🛒', url: 'https://bazos.sk', description: 'Najväčší SK bazár', category: 'nákupy' },
  { name: 'Topreality', icon: '🏠', url: 'https://topreality.sk', description: 'Reality a nehnuteľnosti', category: 'reality' },
  { name: 'Profesia', icon: '💼', url: 'https://profesia.sk', description: 'Pracovné ponuky SK', category: 'práca' },
  { name: 'NBS kurzy', icon: '💱', url: 'https://nbs.sk/statisticke-udaje/kurzovy-listok', description: 'Kurzový lístok NBS', category: 'financie' },
  { name: 'Cestovné poriadky', icon: '🚌', url: 'https://cp.hnonline.sk', description: 'CP.sk – vlaky a autobusy', category: 'doprava' },
  { name: 'SHMU', icon: '🌤️', url: 'https://www.shmu.sk', description: 'Počasie a výstrahy', category: 'počasie' },
]

export async function GET() {
  return NextResponse.json({
    egov: EGOV_SERVICES,
    useful: SK_USEFUL,
    timestamp: Date.now(),
  })
}
