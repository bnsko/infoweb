import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const QUOTES = [
  { text: 'Jediný spôsob, ako robiť skvelú prácu, je milovať to, čo robíte.', author: 'Steve Jobs', category: 'motivácia' },
  { text: 'Budúcnosť patrí tým, ktorí veria v krásu svojich snov.', author: 'Eleanor Roosevelt', category: 'motivácia' },
  { text: 'Nie je dôležité, koľkokrát padneš, ale koľkokrát sa zdvihneš.', author: 'Nelson Mandela', category: 'motivácia' },
  { text: 'Šťastie nie je niečo hotové. Pochádza z vašich vlastných činov.', author: 'Dalajláma', category: 'psychológia' },
  { text: 'Najväčšia sláva nie je v tom, že nikdy nepadnete, ale v tom, že po každom páde vstanete.', author: 'Konfucius', category: 'motivácia' },
  { text: 'Buďte zmenou, ktorú chcete vidieť vo svete.', author: 'Mahátma Gándhí', category: 'motivácia' },
  { text: 'Kto ovláda seba, je mocnejší než ten, kto dobýva mestá.', author: 'Šalamún', category: 'psychológia' },
  { text: 'Najlepší čas zasadiť strom bol pred 20 rokmi. Druhý najlepší čas je teraz.', author: 'čínske príslovie', category: 'motivácia' },
  { text: 'Nie sme produktom našich okolností. Sme produktom našich rozhodnutí.', author: 'Stephen Covey', category: 'psychológia' },
  { text: 'Úspech je schopnosť ísť od neúspechu k neúspechu bez straty entuziazmu.', author: 'Winston Churchill', category: 'motivácia' },
  { text: 'Vaša myseľ je záhrada, vaše myšlienky sú semienka. Môžete pestovať kvety alebo burinu.', author: 'anonymný', category: 'psychológia' },
  { text: 'Strach je len falošný dôkaz, ktorý sa javí ako reálny.', author: 'Zig Ziglar', category: 'psychológia' },
  { text: 'Každý deň robte jednu vec, ktorá vás desí.', author: 'Eleanor Roosevelt', category: 'motivácia' },
  { text: 'Nie je to o tom, mať čas. Je to o tom, urobiť si čas.', author: 'anonymný', category: 'produktivita' },
  { text: 'Disciplína je most medzi cieľmi a dosiahnutím.', author: 'Jim Rohn', category: 'produktivita' },
  { text: 'Porovnávanie sa s ostatnými je zlodej radosti.', author: 'Theodore Roosevelt', category: 'psychológia' },
  { text: 'Vaša budúcnosť závisí od toho, čo robíte dnes.', author: 'Mahátma Gándhí', category: 'motivácia' },
  { text: 'Byť sám sebou vo svete, ktorý sa vás neustále snaží zmeniť, je najväčší úspech.', author: 'Ralph W. Emerson', category: 'psychológia' },
  { text: 'Nie som produkt mojich okolností. Som produkt mojich rozhodnutí.', author: 'Stephen Covey', category: 'psychológia' },
  { text: 'Začnite tam, kde ste. Použite to, čo máte. Urobte to, čo môžete.', author: 'Arthur Ashe', category: 'motivácia' },
]

const FACTS = [
  { text: 'Chobotnica má tri srdcia a modrú krv.', emoji: '🐙', category: 'príroda' },
  { text: 'Med sa nikdy neskazí - v egyptských hrobkách našli 3000-ročný jedlý med.', emoji: '🍯', category: 'jedlo' },
  { text: 'Blesk je 5x horúcejší ako povrch Slnka.', emoji: '⚡', category: 'veda' },
  { text: 'Ľudské telo obsahuje dosť železa na vyrobenie 7,5 cm dlhého klinca.', emoji: '🧲', category: 'telo' },
  { text: 'Jediný kontinent bez hadov je Antarktída.', emoji: '🐍', category: 'geo' },
  { text: 'Banány sú z botanického hľadiska bobule, ale jahody nie.', emoji: '🍌', category: 'jedlo' },
  { text: 'Vesmír je starý 13,8 miliardy rokov.', emoji: '🌌', category: 'vesmír' },
  { text: 'Na Zemi je viac stromov ako hviezd v Mliečnej ceste.', emoji: '🌳', category: 'príroda' },
  { text: 'WiFi bolo vynájdené v Austrálii.', emoji: '📶', category: 'tech' },
  { text: 'Slimák dokáže spať až 3 roky.', emoji: '🐌', category: 'príroda' },
  { text: 'Kozmonauti na ISS vidia 16 východov slnka denne.', emoji: '🛰️', category: 'vesmír' },
  { text: 'Vaša DNA by roztiahnutá siahala od Zeme po Slnko a späť 600-krát.', emoji: '🧬', category: 'telo' },
  { text: 'Planéta Saturn by plávala vo vode (hustota nižšia ako voda).', emoji: '🪐', category: 'vesmír' },
  { text: 'Ľudský mozog spotrebuje 20% celkovej energie tela.', emoji: '🧠', category: 'telo' },
  { text: 'Na Slovensku je 6000+ jaskýň a 12 sprístupnených verejnosti.', emoji: '🇸🇰', category: 'slovensko' },
  { text: 'Pravidlá futbalu v Anglicku sa od roku 1863 zmenili viac ako 100-krát.', emoji: '⚽', category: 'šport' },
  { text: 'Včela musí navštíviť 2 milióny kvetov na výrobu 450g medu.', emoji: '🐝', category: 'príroda' },
  { text: 'Najdlhšia slovenská rieka je Váh (403 km).', emoji: '🏞️', category: 'slovensko' },
  { text: 'Svetlo zo Slnka trvá 8 minút a 20 sekúnd, kým dorazí na Zem.', emoji: '☀️', category: 'vesmír' },
  { text: 'Kolibríky sú jediné vtáky, ktoré vedia lietať dozadu.', emoji: '🐦', category: 'príroda' },
]

export async function GET() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)

  const quoteIdx = dayOfYear % QUOTES.length
  const factIdx = dayOfYear % FACTS.length

  const quote = QUOTES[quoteIdx]
  const fact = FACTS[factIdx]

  return NextResponse.json({
    quote,
    fact,
    timestamp: Date.now(),
  })
}
