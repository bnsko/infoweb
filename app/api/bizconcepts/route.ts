import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const CONCEPTS = [
  { term: 'Bootstrapping', emoji: '🥾', definition: 'Budovanie firmy bez externých investícií, len z vlastných príjmov.', example: 'Mailchimp rástol 20 rokov bez investorov na tržby $700M.' },
  { term: 'Product-Market Fit', emoji: '🎯', definition: 'Stav, keď váš produkt dokonale rieši reálny problém zákazníkov.', example: 'Poznáte to — zákazníci vás hľadajú sami.' },
  { term: 'LTV (Lifetime Value)', emoji: '💎', definition: 'Celková hodnota, ktorú zákazník prinesie za celú dobu spolupráce.', example: 'Ak zákazník platí 50€/mes a zostane 2 roky, LTV = 1200€.' },
  { term: 'CAC (Customer Acquisition Cost)', emoji: '💸', definition: 'Koľko vás stojí získať jedného nového zákazníka.', example: 'Ak utratíte 1000€ na reklamu a získate 10 zákazníkov, CAC = 100€.' },
  { term: 'Runway', emoji: '🛫', definition: 'Počet mesiacov, kým vám dôjdu peniaze pri aktuálnom tempe míňania.', example: '100 000€ na účte a 10 000€/mes náklady = 10 mesiacov runway.' },
  { term: 'Churn Rate', emoji: '📉', definition: 'Percento zákazníkov, ktorí odídu za dané obdobie.', example: '5% churn = z 100 zákazníkov odíde 5 za mesiac.' },
  { term: 'MRR (Monthly Recurring Revenue)', emoji: '📊', definition: 'Mesačný opakovaný príjem z predplatného.', example: '100 zákazníkov × 50€/mes = MRR 5000€.' },
  { term: 'Pivot', emoji: '🔄', definition: 'Zásadná zmena stratégie alebo produktu na základe spätnej väzby trhu.', example: 'Slack začínal ako herná firma, pivotol na chat nástroj.' },
  { term: 'Blue Ocean Strategy', emoji: '🌊', definition: 'Vytvorenie nového trhu bez konkurencie namiesto boja v existujúcom.', example: 'Cirque du Soleil — ani cirkus, ani divadlo.' },
  { term: 'Freemium', emoji: '🆓', definition: 'Základná verzia zadarmo, platíte za premium funkcie.', example: 'Spotify, Canva, Trello — konvertujú 2-5 % na platiacich.' },
  { term: 'Growth Hacking', emoji: '📈', definition: 'Kreatívne, dátami riadené metódy rýchleho rastu s minimálnym rozpočtom.', example: 'Dropbox dal za referral extra priestor — rast 3900%.' },
  { term: 'Lean Startup', emoji: '🏃', definition: 'Build-Measure-Learn cyklus. Rýchle prototypy, rýchla spätná väzba.', example: 'MVP za 2 týždne, testovanie s reálnymi používateľmi.' },
  { term: 'Unit Economics', emoji: '🧮', definition: 'Ekonomika jedného zákazníka — koľko zarobíte vs koľko stojí.', example: 'LTV/CAC pomer > 3 = zdravý biznis.' },
  { term: 'Burn Rate', emoji: '🔥', definition: 'Koľko peňazí firma míňa mesačne nad príjmy.', example: 'Príjmy 5000€, výdavky 8000€ = burn rate 3000€/mes.' },
  { term: 'Scalability', emoji: '📐', definition: 'Schopnosť rásť bez proporcionálneho nárastu nákladov.', example: 'SaaS: 1 zákazník alebo 10 000 — serverové náklady podobné.' },
  { term: 'Equity', emoji: '📊', definition: 'Vlastnícky podiel vo firme. Dáva sa investorom a kľúčovým zamestnancom.', example: 'CTO dostane 10% equity v startupe namiesto vyššieho platu.' },
  { term: 'Due Diligence', emoji: '🔍', definition: 'Dôkladné preverenie firmy pred investíciou alebo akvizíciou.', example: 'Kontrola financií, zmlúv, IP, záväzkov pred nákupom firmy.' },
  { term: 'Valuation', emoji: '💰', definition: 'Ocenenie firmy — koľko celá firma stojí na trhu.', example: 'SaaS firma s MRR 50 000€ má valuáciu ~3-6M€ (60-120× MRR).' },
  { term: 'EBITDA', emoji: '📋', definition: 'Zisk pred úrokmi, daňami, odpismi a amortizáciou.', example: 'Najpoužívanejšia metrika na porovnanie ziskovosti firiem.' },
  { term: 'Minimum Viable Product', emoji: '🚀', definition: 'Najjednoduchšia verzia produktu, ktorú viete predať a otestovať.', example: 'Landing page + platobná brána = prvý test dopytu.' },
  { term: 'Venture Capital', emoji: '🏦', definition: 'Investičné fondy, ktoré investujú do startupov za equity.', example: 'V SK: Neulogy, 0100 Ventures, Credo Ventures.' },
  { term: 'Angel Investor', emoji: '👼', definition: 'Súkromná osoba, ktorá investuje vlastné peniaze do startupov.', example: 'Typicky 25-100K€ za 5-15% podiel v seed fáze.' },
]

export async function GET() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  const todayConcept = CONCEPTS[dayOfYear % CONCEPTS.length]
  const recentConcepts = Array.from({ length: 3 }, (_, i) => CONCEPTS[(dayOfYear - i - 1 + CONCEPTS.length) % CONCEPTS.length])

  return NextResponse.json({
    todayConcept,
    recentConcepts,
    totalConcepts: CONCEPTS.length,
    timestamp: Date.now(),
  })
}
