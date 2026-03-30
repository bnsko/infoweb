import { NextResponse } from 'next/server'

export const revalidate = 86400

interface Fact {
  text: string
  source: string
  category: string
  emoji: string
}

const FACTS: Fact[] = [
  { text: 'Včely komunikujú tancom – „waggle dance" ukazuje ostatným smer a vzdialenosť k nektáru.', source: 'Nature', category: 'príroda', emoji: '🐝' },
  { text: 'Ľudská DNA je z 60 % identická s banánom.', source: 'Science', category: 'veda', emoji: '🧬' },
  { text: 'Na Slovensku je 7 000 jaskýň, ale len 16 je sprístupnených.', source: 'SSJ', category: 'slovensko', emoji: '⛰️' },
  { text: 'Svetlo z najvzdialenejších galaxií, ktoré vidíme, cestovalo k nám 13 miliárd rokov.', source: 'NASA', category: 'vesmír', emoji: '🌌' },
  { text: 'Octopusy majú tri srdcia a modrú krv.', source: 'Marine Bio', category: 'príroda', emoji: '🐙' },
  { text: 'Na Marse je hora Olympus Mons – 21,9 km vysoká, 3× vyššia ako Everest.', source: 'NASA', category: 'vesmír', emoji: '🪐' },
  { text: 'Voda môže existovať vo všetkých troch skupenstvách naraz pri 0,01 °C a 611 Pa.', source: 'Physics', category: 'veda', emoji: '💧' },
  { text: 'Slovensko má najväčší počet hradov na obyvateľa v EÚ (180+).', source: 'ŠÚSR', category: 'slovensko', emoji: '🏰' },
  { text: 'Mozog spotrebuje asi 20 % celkovej energie tela, hoci váži len 2 %.', source: 'Neuroscience', category: 'veda', emoji: '🧠' },
  { text: 'Najdlhší slnečný deň na Slovensku trvá ~16 hodín (21. júna).', source: 'SHMÚ', category: 'slovensko', emoji: '☀️' },
  { text: 'Existuje viac možných šachových partií ako atómov vo vesmíre.', source: 'Mathematics', category: 'veda', emoji: '♟️' },
  { text: 'Tardigrady (medvedíky vodné) prežijú vákuum vesmíru aj extrémne teploty.', source: 'Biology', category: 'príroda', emoji: '🔬' },
  { text: 'Mliečna dráha rotuje rýchlosťou 828 000 km/h.', source: 'ESA', category: 'vesmír', emoji: '🌀' },
  { text: 'Slovensko vyrába najviac áut na obyvateľa na svete – cca 202 áut na 1 000 ľudí/rok.', source: 'SARIO', category: 'slovensko', emoji: '🚗' },
  { text: 'Med sa nikdy neskazí – v egyptských hrobkách našli 3000-ročný jedlý med.', source: 'Archaeology', category: 'história', emoji: '🍯' },
  { text: 'Blesk zasiahne Zem asi 100-krát za sekundu, teda ~8,6 milióna úderov denne.', source: 'NOAA', category: 'príroda', emoji: '⚡' },
  { text: 'Najstarší strom na svete má viac ako 5 000 rokov – Metuzalem v Kalifornii.', source: 'USFS', category: 'príroda', emoji: '🌳' },
  { text: 'Na Jupitere prší diamanty kvôli extrému tlaku a teploty.', source: 'Nature', category: 'vesmír', emoji: '💎' },
  { text: 'Čínsky múr nie je viditeľný z vesmíru voľným okom – je to mýtus.', source: 'NASA', category: 'história', emoji: '🧱' },
  { text: 'Platypus je jedný z mála cicavcov, ktorý je jedovatý.', source: 'Biology', category: 'príroda', emoji: '🦆' },
  { text: 'GPS satelity musia korigovať čas kvôli relativite – hodiny idú rýchlejšie vo vesmíre.', source: 'Physics', category: 'veda', emoji: '🛰️' },
  { text: 'Dobšinská ľadová jaskyňa na Slovensku je UNESCO pamiatka s celoročným ľadom.', source: 'UNESCO', category: 'slovensko', emoji: '🧊' },
  { text: 'Ľudské telo obsahuje dosť železa na vyrobenie 7,5 cm dlhého klinca.', source: 'Chemistry', category: 'veda', emoji: '🔩' },
  { text: 'Koala spí 18-22 hodín denne.', source: 'Biology', category: 'príroda', emoji: '🐨' },
  { text: 'Najrýchlejšie zviera je sokol sťahovavý – v strmhlavom lete dosahuje 389 km/h.', source: 'Nat Geo', category: 'príroda', emoji: '🦅' },
  { text: 'Bitcoin sieť spotrebuje viac energie ako niektoré malé krajiny.', source: 'Cambridge', category: 'tech', emoji: '₿' },
  { text: 'Neurónov v mozgu je ~86 miliárd – približne ako hviezd v Mliečnej dráhe.', source: 'Neuroscience', category: 'veda', emoji: '✨' },
  { text: 'Banská Štiavnica bola technologickým centrom Európy v 18. storočí.', source: 'UNESCO', category: 'slovensko', emoji: '⚒️' },
  { text: 'Kôň spí len 2-3 hodiny denne a väčšinou v stoji.', source: 'Biology', category: 'príroda', emoji: '🐴' },
  { text: 'Teplota jadra Slnka je ~15 miliónov °C.', source: 'NASA', category: 'vesmír', emoji: '🔥' },
]

export async function GET() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)

  const todayFact = FACTS[dayOfYear % FACTS.length]
  const past: Fact[] = []
  for (let d = 1; d <= 7; d++) {
    past.push(FACTS[(dayOfYear - d + FACTS.length * 100) % FACTS.length])
  }

  return NextResponse.json({
    today: todayFact,
    yesterday: past[0],
    past,
    timestamp: Date.now(),
  })
}
