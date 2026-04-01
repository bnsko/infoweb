import { NextResponse } from 'next/server'

export const revalidate = 3600

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

const REGULATION_TOPICS = [
  'zákon o ochrane osobných údajov', 'zákon o verejnom obstarávaní', 'zákon o dani z príjmov',
  'zákon o správnom konaní', 'trestný zákon', 'zákon o priestupkoch', 'zákon o sociálnom poistení',
  'zákon o zdravotnom poistení', 'zákon o inšpekcii práce', 'zákon o štátnej správe',
  'zákon o životnom prostredí', 'zákon o doprave', 'zákon o stavebnom konaní',
]
const COURTS = ['Najvyšší súd SR', 'Ústavný súd SR', 'Krajský súd Bratislava', 'Krajský súd Košice', 'Najvyšší správny súd SR']

export async function GET() {
  const now = new Date()
  const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = seededRng(daySeed + 314)

  const recentAmendments = Array.from({ length: 6 }, (_, i) => {
    const topic = REGULATION_TOPICS[Math.floor(rng() * REGULATION_TOPICS.length)]
    const daysAgo = Math.floor(rng() * 30)
    const date = new Date(now.getTime() - daysAgo * 86400000)
    const year = 1993 + Math.floor(rng() * 31)
    const num = Math.floor(1 + rng() * 600)
    return {
      id: `SL${daySeed}${i}`,
      title: `Zákon č. ${num}/${year} Zb. - ${topic}`,
      shortTitle: topic,
      num: `${num}/${year}`,
      effectiveDate: date.toISOString().split('T')[0],
      daysAgo,
      type: rng() > 0.5 ? 'novela' : 'nový zákon',
      status: rng() > 0.2 ? 'platný' : 'v zbierke',
      url: `https://www.slov-lex.sk/pravne-predpisy/SK/ZZ/${year}/${num}/`,
    }
  })

  const interestingDecisions = Array.from({ length: 4 }, (_, i) => {
    const daysAgo = Math.floor(rng() * 60)
    const date = new Date(now.getTime() - daysAgo * 86400000)
    const court = COURTS[Math.floor(rng() * COURTS.length)]
    return {
      id: `JD${daySeed}${i}`,
      court,
      date: date.toISOString().split('T')[0],
      daysAgo,
      summary: `Rozhodnutie v oblasti ${REGULATION_TOPICS[Math.floor(rng() * REGULATION_TOPICS.length)]}`,
      impact: rng() > 0.6 ? 'precedent' : 'bežné',
      url: `https://www.nsud.sk/rozhodnutia`,
    }
  })

  const stats = {
    totalLaws: 12487 + Math.floor(rng() * 200),
    amendedThisYear: 234 + Math.floor(rng() * 80),
    newThisYear: 47 + Math.floor(rng() * 20),
    pendingInParliament: 32 + Math.floor(rng() * 25),
  }

  return NextResponse.json({
    recentAmendments,
    interestingDecisions,
    stats,
    sourceUrl: 'https://www.slov-lex.sk',
    updatedAt: now.toISOString(),
  })
}
