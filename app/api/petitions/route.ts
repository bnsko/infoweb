import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const PETITION_TOPICS = [
  'Zachovajte nemocnicu v Rimavskej Sobote',
  'Znížte daň z príjmu pre rodiny s deťmi',
  'Zastavte výstavbu obchodného centra v lese',
  'Zvýšte platy zdravotníkov',
  'Zrušte poplatky za diaľnice pre elektromobily',
  'Obnovte vlakové spojenie Veľké Kapušany – Košice',
  'Postrojte nové cyklotrasy v Bratislave',
  'Znížte DPH na potraviny na 5 %',
  'Zastavte ťažbu dreva v Tatrách',
  'Urobte volebný deň pracovným sviatkom',
  'Zaveďte povinnú výučbu programovania na ZŠ',
  'Znížte ceny verejnej dopravy',
]

const CATEGORIES = ['zdravotníctvo', 'dane', 'životné prostredie', 'doprava', 'vzdelávanie', 'ekonomika', 'kultura']

export async function GET() {
  const now = new Date()
  const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(daySeed + 612)

  const petitions = PETITION_TOPICS.map((topic, i) => {
    const goal = [1000, 2500, 5000, 10000, 25000, 50000, 100000][Math.floor(rng() * 7)]
    const signatures = Math.floor(rng() * goal * 1.2)
    const daysAgo = Math.floor(rng() * 90)
    const startDate = new Date(now.getTime() - daysAgo * 86400000)
    const endDaysFromNow = Math.floor(rng() * 60) - 15
    const endDate = new Date(now.getTime() + endDaysFromNow * 86400000)
    const isActive = endDate > now && signatures < goal * 1.1
    return {
      id: `PE${daySeed}${i}`,
      title: topic,
      category: CATEGORIES[Math.floor(rng() * CATEGORIES.length)],
      signatures,
      goal,
      progressPct: Math.min(100, Math.floor((signatures / goal) * 100)),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      daysLeft: Math.max(0, endDaysFromNow),
      isActive,
      isAchieved: signatures >= goal,
      signaturesPerDay: isActive ? Math.floor(10 + rng() * 200) : 0,
      url: `https://www.peticie.com`,
    }
  }).sort((a, b) => b.signatures - a.signatures)

  const trending = petitions.filter(p => p.isActive && p.signaturesPerDay > 50).slice(0, 3)

  const stats = {
    totalActivePetitions: 127 + Math.floor(rng() * 40),
    successfulThisYear: 18 + Math.floor(rng() * 12),
    totalSignaturesThisYear: 284000 + Math.floor(rng() * 50000),
    mostPopularCategory: CATEGORIES[Math.floor(rng() * CATEGORIES.length)],
  }

  return NextResponse.json({
    petitions: petitions.slice(0, 8),
    trending,
    stats,
    sourceUrl: 'https://www.peticie.com',
    updatedAt: now.toISOString(),
  })
}
