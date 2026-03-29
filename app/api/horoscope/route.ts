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
  'Dnes vás čaká príjemné prekvapenie',
  'Venujte pozornosť detailom v práci',
  'Skvelý deň na nové začiatky',
  'Komunikácia bude kľúčová',
  'Dôverujte svojej intuícii',
  'Čas na oddych a regeneráciu',
  'Finančná príležitosť sa blíži',
  'Otvorte sa novým možnostiam',
  'Rodina vám dodá silu',
  'Kreativita bude na vrchole',
  'Buďte trpezliví, výsledky prídu',
  'Nečakaný kontakt vás poteší',
  'Ideálny deň na šport a pohyb',
  'Romantika je vo vzduchu',
  'Vyriešite dlhodobý problém',
  'Cestovanie alebo plánovanie ciest',
  'Učenie sa niečomu novému prinesie radosť',
  'Networking prinesie ovocie',
  'Venujte čas sebe a sebarozvoju',
  'Harmónia v medziľudských vzťahoch',
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
    return {
      ...sign,
      stars,
      luckyNumber: lucky,
      focus: aspect,
      prediction: `${pred1}. ${pred2}.`,
    }
  })

  return NextResponse.json({
    currentSign: currentSignIdx,
    horoscopes,
    date: now.toISOString().slice(0, 10),
  })
}
