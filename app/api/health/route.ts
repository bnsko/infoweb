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
}

export async function GET() {
  const alerts: HealthAlert[] = []

  // WHO Disease Outbreak News RSS
  const [whoRes, ecdcRes] = await Promise.allSettled([
    fetch('https://www.who.int/feeds/entity/don/en/rss.xml', {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)' },
      signal: AbortSignal.timeout(8000),
    }),
    fetch('https://www.ecdc.europa.eu/en/publications-data?f%5B0%5D=output_types%3A1172', {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)', Accept: 'text/html' },
      signal: AbortSignal.timeout(8000),
    }),
  ])

  if (whoRes.status === 'fulfilled' && whoRes.value.ok) {
    try {
      const xml = await whoRes.value.text()
      const items = xml.split(/<item[ >]/).slice(1, 8)
      for (const item of items) {
        const titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)
        const descMatch = item.match(/<description[^>]*>([\s\S]*?)<\/description>/)
        const dateMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)
        const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)

        const title = titleMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() ?? ''
        const desc = descMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim().slice(0, 200) ?? ''

        if (title) {
          const sev = title.toLowerCase().includes('outbreak') || title.toLowerCase().includes('emergency')
            ? 'high' : title.toLowerCase().includes('update') ? 'medium' : 'low'
          const cat = title.toLowerCase().includes('covid') ? 'COVID-19'
            : title.toLowerCase().includes('flu') || title.toLowerCase().includes('influenza') ? 'Chrípka'
            : title.toLowerCase().includes('mpox') ? 'Mpox'
            : 'Infectious'

          alerts.push({
            title,
            description: desc,
            source: 'WHO',
            date: dateMatch?.[1]?.trim() ?? '',
            severity: sev,
            category: cat,
            link: linkMatch?.[1]?.trim(),
          })
        }
      }
    } catch { /* skip */ }
  }

  // ECDC rapid risk assessments
  if (ecdcRes.status === 'fulfilled' && ecdcRes.value.ok) {
    try {
      const html = await ecdcRes.value.text()
      const items = html.match(/<h3[^>]*class="[^"]*title[^"]*"[^>]*>[\s\S]*?<\/h3>/g) ?? []
      for (const item of items.slice(0, 3)) {
        const titleMatch = item.match(/>([^<]+)</)
        if (titleMatch?.[1]) {
          alerts.push({
            title: titleMatch[1].trim(),
            description: '',
            source: 'ECDC',
            date: new Date().toISOString(),
            severity: 'medium',
            category: 'EU Alert',
            link: 'https://www.ecdc.europa.eu',
          })
        }
      }
    } catch { /* skip */ }
  }

  return NextResponse.json({ alerts, timestamp: Date.now() })
}
