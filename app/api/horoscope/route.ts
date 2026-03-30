import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SIGNS = [
  { name: 'Baran', nameEn: 'Aries', emoji: '♈', from: '21.3', to: '19.4' },
  { name: 'Býk', nameEn: 'Taurus', emoji: '♉', from: '20.4', to: '20.5' },
  { name: 'Blíženci', nameEn: 'Gemini', emoji: '♊', from: '21.5', to: '20.6' },
  { name: 'Rak', nameEn: 'Cancer', emoji: '♋', from: '21.6', to: '22.7' },
  { name: 'Lev', nameEn: 'Leo', emoji: '♌', from: '23.7', to: '22.8' },
  { name: 'Panna', nameEn: 'Virgo', emoji: '♍', from: '23.8', to: '22.9' },
  { name: 'Váhy', nameEn: 'Libra', emoji: '♎', from: '23.9', to: '22.10' },
  { name: 'Škorpión', nameEn: 'Scorpio', emoji: '♏', from: '23.10', to: '21.11' },
  { name: 'Strelec', nameEn: 'Sagittarius', emoji: '♐', from: '22.11', to: '21.12' },
  { name: 'Kozorožec', nameEn: 'Capricorn', emoji: '♑', from: '22.12', to: '19.1' },
  { name: 'Vodnár', nameEn: 'Aquarius', emoji: '♒', from: '20.1', to: '18.2' },
  { name: 'Ryby', nameEn: 'Pisces', emoji: '♓', from: '19.2', to: '20.3' },
]

const ASPECTS = [
  'Láska', 'Práca', 'Zdravie', 'Financie', 'Rodina', 'Kreativita', 'Komunikácia', 'Energia',
]

const PREDICTIONS = [
  'Dnes vás čaká príjemné prekvapenie, ktoré vám zlepší celý deň',
  'Venujte pozornosť detailom v práci — malá chyba by mohla mať väčšie následky',
  'Skvelý deň na nové začiatky, nebojte sa riskovať',
  'Komunikácia bude kľúčová — jasne vyjadrujte svoje myšlienky a pocity',
  'Dôverujte svojej intuícii, pretože vás povedie správnym smerom',
  'Čas na oddych a regeneráciu, vaše telo aj myseľ si to zaslúžia',
  'Finančná príležitosť sa blíži, buďte pripravení ju využiť',
  'Otvorte sa novým možnostiam a ľuďom, ktorí vstúpia do vášho života',
  'Rodina vám dodá silu a podporu, ktorú práve potrebujete',
  'Kreativita bude na vrchole — využite ju na projekty a hobby',
  'Buďte trpezliví, výsledky prídu skôr, než si myslíte',
  'Nečakaný kontakt od starého priateľa vás príjemne poteší',
  'Ideálny deň na šport a pohyb, vaše telo ocení aktivitu',
  'Romantika je vo vzduchu — prekvapte partnera alebo buďte otvorení novým známostiam',
  'Vyriešite dlhodobý problém, ktorý vás trápil už nejaký čas',
  'Cestovanie alebo plánovanie ciest prinesie radosť a inšpiráciu',
  'Učenie sa niečomu novému prinesie radosť a nové perspektívy',
  'Networking a sociálne kontakty dnes prinesú ovocie',
  'Venujte čas sebe a svojmu sebarozvoju, investícia do seba sa vyplatí',
  'Harmónia v medziľudských vzťahoch bude dnes obzvlášť silná',
]

const LOVE_PREDICTIONS = [
  'V láske vás čaká krásny deň plný porozumenia a nežnosti.',
  'Partnerský vzťah sa dnes posilní vďaka úprimnej komunikácii.',
  'Slobodní by mali byť otvorení novým stretnutiam — osud má plány.',
  'Romantický večer by mohol byť presne to, čo potrebujete.',
  'Malé gesto lásky urobí niekomu blízkemu obrovskú radosť.',
  'V citovej oblasti sa môžu vynoriť staré nevyriešené otázky.',
  'Dnes je výborný deň na odpustenie a nový začiatok v láske.',
  'Vaša príťažlivosť je dnes na vrchole — využite to!',
]

const WORK_PREDICTIONS = [
  'V práci vás čaká produktívny deň s jasnými výsledkami.',
  'Kolegovia ocenia váš prístup a iniciatívu. Nebojte sa prevziať vedenie.',
  'Dôležité pracovné rozhodnutie si vyžiada chladnú hlavu.',
  'Kreatívne riešenia budú dnes kľúčom k úspechu v kariére.',
  'Nový projekt alebo úloha vám dodá motiváciu a energiu.',
  'Diplomacia a takt vám pomôžu vyriešiť napätie na pracovisku.',
  'Sústreďte sa na priority — nie všetko musí byť hotové dnes.',
  'Šéf alebo nadriadený si všimne vašu prácu — buďte pripravení.',
]

const HEALTH_PREDICTIONS = [
  'Vaše zdravie je dnes stabilné, ale nezabúdajte na pitný režim.',
  'Fyzická aktivita vám dodá energiu na celý deň.',
  'Stres by mohol ovplyvniť vaše zdravie — nájdite si čas na relaxáciu.',
  'Dnes je ideálny deň na prechádzku v prírode a čerstvý vzduch.',
  'Venujte pozornosť strave — zdravé jedlo podporí vašu vitalitu.',
  'Spánok bude dnes obzvlášť dôležitý pre vašu regeneráciu.',
  'Meditácia alebo jóga vám pomôžu nájsť vnútorný pokoj.',
  'Vaša energia je dnes nad priemerom — využite ju naplno!',
]

const FINANCE_PREDICTIONS = [
  'Financie sú dnes stabilné, ale vyhýbajte sa impulzívnym nákupom.',
  'Neočakávaný príjem alebo bonus by mohol spríjemniť deň.',
  'Investičné rozhodnutia by mali počkať na lepší deň s jasnejšou hlavou.',
  'Šetrenie malých súm sa časom prejaví vo veľkom.',
  'Dobrý deň na plánovanie rozpočtu a finančných cieľov.',
  'Praktický prístup k peniazom vám prinesie pokoj mysle.',
  'Niekto blízky vás môže požiadať o finančnú radu — buďte úprimní.',
  'Finančná disciplína dnes prinesie dlhodobé výhody.',
]

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

export async function GET() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  const day = now.getDate()
  const month = now.getMonth() + 1

  // Get current sign based on date
  let currentSignIdx = 0
  for (let i = 0; i < SIGNS.length; i++) {
    const [fd, fm] = SIGNS[i].from.split('.').map(Number)
    const [td, tm] = SIGNS[i].to.split('.').map(Number)
    const fromVal = fm * 100 + fd
    const toVal = tm * 100 + td
    const nowVal = month * 100 + day
    if (fromVal <= toVal) {
      if (nowVal >= fromVal && nowVal <= toVal) { currentSignIdx = i; break }
    } else {
      if (nowVal >= fromVal || nowVal <= toVal) { currentSignIdx = i; break }
    }
  }

  // Generate daily horoscopes for all signs
  const horoscopes = SIGNS.map((sign, idx) => {
    const rand = seededRandom(dayOfYear * 12 + idx)
    const stars = Math.floor(rand() * 3) + 3 // 3-5 stars
    const lucky = Math.floor(rand() * 99) + 1
    const aspect = ASPECTS[Math.floor(rand() * ASPECTS.length)]
    const pred1 = PREDICTIONS[Math.floor(rand() * PREDICTIONS.length)]
    const pred2 = PREDICTIONS[Math.floor(rand() * PREDICTIONS.length)]
    const love = LOVE_PREDICTIONS[Math.floor(rand() * LOVE_PREDICTIONS.length)]
    const work = WORK_PREDICTIONS[Math.floor(rand() * WORK_PREDICTIONS.length)]
    const healthPred = HEALTH_PREDICTIONS[Math.floor(rand() * HEALTH_PREDICTIONS.length)]
    const finance = FINANCE_PREDICTIONS[Math.floor(rand() * FINANCE_PREDICTIONS.length)]
    const loveStars = Math.floor(rand() * 3) + 3
    const workStars = Math.floor(rand() * 3) + 3
    const healthStars = Math.floor(rand() * 3) + 3
    const financeStars = Math.floor(rand() * 3) + 3
    return {
      ...sign,
      stars,
      luckyNumber: lucky,
      focus: aspect,
      prediction: `${pred1}. ${pred2}.`,
      details: {
        love: { text: love, stars: loveStars },
        work: { text: work, stars: workStars },
        health: { text: healthPred, stars: healthStars },
        finance: { text: finance, stars: financeStars },
      },
    }
  })

  return NextResponse.json({
    currentSign: currentSignIdx,
    horoscopes,
    date: now.toISOString().slice(0, 10),
  })
}
