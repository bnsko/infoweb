import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface JobCategory { name: string; count: number }
interface JobItem { title: string; company: string; location: string; salary?: string; link: string; date: string }

export async function GET() {
  let topJobs: JobItem[] = []
  let categories: JobCategory[] = []
  let totalNew = 0

  // Try multiple Profesia.sk RSS feeds 
  const feedUrls = [
    'https://www.profesia.sk/rss/ponuky.xml',
    'https://www.profesia.sk/rss/index.php',
  ]

  for (const feedUrl of feedUrls) {
    if (topJobs.length > 0) break
    try {
      const res = await fetch(feedUrl, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const xml = await res.text()
      if (!xml.includes('<item')) continue

      const items = xml.split(/<item[ >]/).slice(1, 30)
      const catMap = new Map<string, number>()

      for (const item of items) {
        const getTag = (tag: string) => {
          const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
          return m?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim() ?? ''
        }
        const title = getTag('title')
        const link = getTag('link')
        const desc = getTag('description')
        const date = getTag('pubDate')

        const parts = title.split(' - ')
        const jobTitle = parts[0]?.trim() ?? title
        const company = parts.length > 1 ? parts[parts.length - 1]?.trim() ?? '' : ''
        const locMatch = desc.match(/(?:Miesto|Lokalita|Mesto)[:\s]*([^,\n<]+)/i)
        const location = locMatch?.[1]?.trim() ?? ''
        const salMatch = desc.match(/(\d[\d\s,.]*\s*€)/i)

        const tl = jobTitle.toLowerCase()
        const cat = /it|develop|program|software|devops|data|cloud|web/.test(tl) ? 'IT & Vývoj'
          : /obchod|predaj|sales|key account/.test(tl) ? 'Obchod'
          : /účt|financ|ekon|audit/.test(tl) ? 'Financie'
          : /admin|asisten|recep|office/.test(tl) ? 'Administratíva'
          : /výrob|sklad|logist|operátor|montáž/.test(tl) ? 'Výroba & Logistika'
          : /market|brand|pr |comm/.test(tl) ? 'Marketing'
          : 'Iné'
        catMap.set(cat, (catMap.get(cat) ?? 0) + 1)

        if (jobTitle) {
          topJobs.push({ title: jobTitle, company, location, salary: salMatch?.[1] || undefined, link, date })
        }
      }

      totalNew = topJobs.length
      topJobs = topJobs.slice(0, 10)
      categories = Array.from(catMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6)
    } catch { /* try next */ }
  }

  // Fallback: scrape Profesia HTML if RSS fails
  if (topJobs.length === 0) {
    try {
      const res = await fetch('https://www.profesia.sk/praca/', {
        cache: 'no-store',
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        const html = await res.text()
        const offers = html.match(/<li[^>]*class="[^"]*list-row[^"]*"[\s\S]*?<\/li>/gi) ?? []
        for (const offer of offers.slice(0, 10)) {
          const titleM = offer.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/a>/i)
          const compM = offer.match(/<span[^>]*class="[^"]*employer[^"]*"[^>]*>([\s\S]*?)<\/span>/i)
          const locM = offer.match(/<span[^>]*class="[^"]*info[^"]*"[^>]*>([\s\S]*?)<\/span>/i)
          const linkM = offer.match(/<a[^>]*href="([^"]*)"[^>]*class="[^"]*title/i)
          const t = titleM?.[1]?.replace(/<[^>]+>/g, '').trim() ?? ''
          if (t) {
            topJobs.push({
              title: t,
              company: compM?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '',
              location: locM?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '',
              link: linkM?.[1] ? `https://www.profesia.sk${linkM[1]}` : 'https://www.profesia.sk',
              date: '',
            })
          }
        }
        totalNew = topJobs.length
      }
    } catch { /* ignore */ }
  }

  return NextResponse.json({ topJobs, categories, totalNew, timestamp: Date.now() })
}
