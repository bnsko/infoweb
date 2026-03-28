import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface HealthAlert {
  title: string
  description: string
  source: string
  date: string
  severity: 'low' | 'medium' | 'high'
  category: string
  link?: string
  region: 'sk' | 'world'
}

const UA = 'Mozilla/5.0 (compatible; InfoSK/1.0)'

async function fetchRSS(url: string, source: string, region: 'sk' | 'world', maxItems = 8): Promise<HealthAlert[]> {
  const alerts: HealthAlert[] = []
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml, */*' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const xml = await res.text()
    const items = xml.split(/<item[ >]/).slice(1, maxItems + 1)
    for (const item of items) {
      const titleRaw = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? ''
      const title = titleRaw.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
      const descRaw = item.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1] ?? ''
      const desc = descRaw.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim().slice(0, 200)
      const date = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? ''
      const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? ''
      if (!title) continue
      const tl = title.toLowerCase()
      const sev: 'low' | 'medium' | 'high' = (tl.includes('outbreak') || tl.includes('emergency') || tl.includes('epidemic') || tl.includes('pandemic')) ? 'high'
        : (tl.includes('update') || tl.includes('risk') || tl.includes('alert') || tl.includes('warning')) ? 'medium' : 'low'
      const cat = tl.includes('covid') ? 'COVID-19' : tl.includes('flu') || tl.includes('influenza') ? 'Chrípka'
        : tl.includes('mpox') ? 'Mpox' : tl.includes('measles') ? 'Osýpky' : tl.includes('ebola') ? 'Ebola' : 'Infekčné'
      alerts.push({ title, description: desc, source, date, severity: sev, category: cat, link, region })
    }
  } catch { /* skip */ }
  return alerts
}

export async function GET() {
  const feeds = await Promise.allSettled([
    // WHO Disease Outbreak News
    fetchRSS('https://www.who.int/feeds/entity/don/en/rss.xml', 'WHO', 'world'),
    // WHO News RSS
    fetchRSS('https://www.who.int/feeds/entity/news/en/rss.xml', 'WHO News', 'world'),
    // ECDC RSS feed
    fetchRSS('https://www.ecdc.europa.eu/en/rss.xml', 'ECDC', 'world'),
    // ECDC Threat reports
    fetchRSS('https://www.ecdc.europa.eu/en/threat-reports/rss.xml', 'ECDC CDTR', 'world'),
    // Slovak UVZSR (public health authority) — try their RSS
    fetchRSS('https://www.uvzsr.sk/rss', 'ÚVZSR', 'sk'),
    // ProMED (disease surveillance)
    fetchRSS('https://promedmail.org/feed/', 'ProMED', 'world'),
  ])

  const allAlerts: HealthAlert[] = []
  for (const r of feeds) {
    if (r.status === 'fulfilled') allAlerts.push(...r.value)
  }

  // Sort by date descending
  allAlerts.sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0
    const db = b.date ? new Date(b.date).getTime() : 0
    return db - da
  })

  // Also check Slovak alerts by looking for Slovakia mentions in world alerts
  for (const alert of allAlerts) {
    if (alert.region === 'world') {
      const text = (alert.title + ' ' + alert.description).toLowerCase()
      if (text.includes('slovakia') || text.includes('slovensko') || text.includes('slovak')) {
        alert.region = 'sk'
      }
    }
  }

  const sk = allAlerts.filter(a => a.region === 'sk').slice(0, 10)
  const world = allAlerts.filter(a => a.region === 'world').slice(0, 15)

  return NextResponse.json({ sk, world, alerts: allAlerts.slice(0, 20), timestamp: Date.now() })
}
