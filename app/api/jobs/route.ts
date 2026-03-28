import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface JobCategory {
  name: string
  count: number
}

interface JobItem {
  title: string
  company: string
  location: string
  salary?: string
  link: string
  date: string
}

export async function GET() {
  let topJobs: JobItem[] = []
  let categories: JobCategory[] = []
  let totalNew = 0

  // Scrape Profesia.sk RSS feed
  try {
    const res = await fetch('https://www.profesia.sk/rss/ponuky.xml', {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const xml = await res.text()
      const items = xml.split(/<item[ >]/).slice(1, 30)
      const catMap = new Map<string, number>()

      for (const item of items) {
        const titleMatch = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)
        const linkMatch = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)
        const descMatch = item.match(/<description[^>]*>([\s\S]*?)<\/description>/)
        const dateMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)

        const raw = titleMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() ?? ''
        const desc = descMatch?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim() ?? ''
        const link = linkMatch?.[1]?.trim() ?? ''

        // Parse "Title - Company" format from Profesia
        const parts = raw.split(' - ')
        const title = parts[0]?.trim() ?? raw
        const company = parts[1]?.trim() ?? ''

        // Extract location from description
        const locMatch = desc.match(/Miesto:\s*([^,\n]+)/) ?? desc.match(/Lokalita:\s*([^,\n]+)/)
        const location = locMatch?.[1]?.trim() ?? ''

        // Salary
        const salMatch = desc.match(/(\d[\d\s,.]*\s*€)/)
        const salary = salMatch?.[1] ?? ''

        // Category guess
        const cat = title.toLowerCase().includes('it') || title.toLowerCase().includes('developer') || title.toLowerCase().includes('programátor')
          ? 'IT & Vývoj'
          : title.toLowerCase().includes('obchod') || title.toLowerCase().includes('predaj') ? 'Obchod'
          : title.toLowerCase().includes('účt') || title.toLowerCase().includes('financ') ? 'Financie'
          : title.toLowerCase().includes('admin') || title.toLowerCase().includes('asisten') ? 'Administratíva'
          : title.toLowerCase().includes('výrob') || title.toLowerCase().includes('sklad') ? 'Výroba & Logistika'
          : 'Iné'

        catMap.set(cat, (catMap.get(cat) ?? 0) + 1)

        if (title) {
          topJobs.push({
            title,
            company,
            location,
            salary: salary || undefined,
            link,
            date: dateMatch?.[1]?.trim() ?? '',
          })
        }
      }

      totalNew = topJobs.length
      topJobs = topJobs.slice(0, 10)
      categories = Array.from(catMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    }
  } catch { /* fallback */ }

  return NextResponse.json({ topJobs, categories, totalNew, timestamp: Date.now() })
}
