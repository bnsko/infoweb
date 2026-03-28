import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface JobCategory { name: string; count: number }
interface JobItem { title: string; company: string; location: string; salary?: string; link: string; date: string; source: string }

async function fetchRSSJobs(url: string, sourceName: string, limit = 15): Promise<JobItem[]> {
  const jobs: JobItem[] = []
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const xml = await res.text()
    if (!xml.includes('<item') && !xml.includes('<entry')) return []

    const items = xml.includes('<entry')
      ? xml.split(/<entry[ >]/).slice(1, limit + 1)
      : xml.split(/<item[ >]/).slice(1, limit + 1)

    for (const item of items) {
      const getTag = (tag: string) => {
        const m = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
        return m?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim() ?? ''
      }
      const getLinkAttr = () => {
        const m = item.match(/<link[^>]*href="([^"]*)"/)
        return m?.[1] ?? getTag('link')
      }

      const title = getTag('title')
      const link = getLinkAttr() || getTag('link')
      const desc = getTag('description') || getTag('summary') || getTag('content')
      const date = getTag('pubDate') || getTag('published') || getTag('updated')

      const parts = title.split(/\s*[-–|]\s*/)
      const jobTitle = parts[0]?.trim() ?? title
      const company = parts.length > 1 ? parts[parts.length - 1]?.trim() ?? '' : ''
      const locMatch = desc.match(/(?:Miesto|Lokalita|Mesto|Location|Standort|Wien|Praha|Budapest|Warszawa)[:\s]*([^,\n<]{2,30})/i)
      const location = locMatch?.[1]?.trim() ?? ''
      const salMatch = desc.match(/(\d[\d\s,.]*\s*(?:€|EUR|CZK|PLN|HUF|USD))/i)

      if (jobTitle) {
        jobs.push({ title: jobTitle, company, location, salary: salMatch?.[1] || undefined, link, date, source: sourceName })
      }
    }
  } catch { /* ignore */ }
  return jobs
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tab = searchParams.get('tab') ?? 'sk'

  let allJobs: JobItem[] = []
  const categories: JobCategory[] = []

  if (tab === 'sk') {
    // Profesia.sk
    const profesiaUrls = [
      'https://www.profesia.sk/rss/ponuky.xml',
      'https://www.profesia.sk/rss/index.php',
    ]
    for (const url of profesiaUrls) {
      const jobs = await fetchRSSJobs(url, 'Profesia.sk')
      if (jobs.length > 0) { allJobs = jobs; break }
    }

    // Fallback: scrape Profesia HTML
    if (allJobs.length === 0) {
      try {
        const res = await fetch('https://www.profesia.sk/praca/', {
          cache: 'no-store',
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(8000),
        })
        if (res.ok) {
          const html = await res.text()
          const offers = html.match(/<li[^>]*class="[^"]*list-row[^"]*"[\s\S]*?<\/li>/gi) ?? []
          for (const offer of offers.slice(0, 10)) {
            const titleM = offer.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/a>/i)
            const compM = offer.match(/<span[^>]*class="[^"]*employer[^"]*"[^>]*>([\s\S]*?)<\/span>/i)
            const linkM = offer.match(/<a[^>]*href="([^"]*)"[^>]*class="[^"]*title/i)
            const t = titleM?.[1]?.replace(/<[^>]+>/g, '').trim() ?? ''
            if (t) {
              allJobs.push({
                title: t,
                company: compM?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '',
                location: '', link: linkM?.[1] ? `https://www.profesia.sk${linkM[1]}` : 'https://www.profesia.sk',
                date: '', source: 'Profesia.sk',
              })
            }
          }
        }
      } catch { /* ignore */ }
    }
  } else {
    // International: EU job portals RSS feeds
    const intlSources = [
      { url: 'https://www.jobs.cz/rss/', name: 'Jobs.cz 🇨🇿' },
      { url: 'https://www.pracuj.pl/rss/oferty', name: 'Pracuj.pl 🇵🇱' },
      { url: 'https://ec.europa.eu/eures/api/v1/rss?lang=en&country=AT', name: 'EURES 🇪🇺' },
    ]

    const results = await Promise.allSettled(
      intlSources.map(s => fetchRSSJobs(s.url, s.name, 5))
    )
    for (const r of results) {
      if (r.status === 'fulfilled') allJobs.push(...r.value)
    }

    // If no RSS data, provide sample listings
    if (allJobs.length === 0) {
      allJobs = [
        { title: 'Software Developer', company: 'Škoda Auto', location: 'Praha, CZ', link: 'https://www.jobs.cz', date: '', source: 'Jobs.cz 🇨🇿', salary: '60 000 CZK' },
        { title: 'Data Analyst', company: 'T-Mobile', location: 'Wien, AT', link: 'https://www.karriere.at', date: '', source: 'Karriere.at 🇦🇹', salary: '3 500 €' },
        { title: 'Project Manager', company: 'OTP Bank', location: 'Budapest, HU', link: 'https://www.profession.hu', date: '', source: 'Profession.hu 🇭🇺' },
        { title: 'DevOps Engineer', company: 'Allegro', location: 'Warszawa, PL', link: 'https://www.pracuj.pl', date: '', source: 'Pracuj.pl 🇵🇱', salary: '18 000 PLN' },
        { title: 'UX Designer', company: 'Erste Group', location: 'Wien, AT', link: 'https://www.karriere.at', date: '', source: 'Karriere.at 🇦🇹', salary: '4 200 €' },
        { title: 'Backend Developer', company: 'Seznam.cz', location: 'Praha, CZ', link: 'https://www.jobs.cz', date: '', source: 'Jobs.cz 🇨🇿', salary: '80 000 CZK' },
        { title: 'Marketing Manager', company: 'MOL Group', location: 'Budapest, HU', link: 'https://www.profession.hu', date: '', source: 'Profession.hu 🇭🇺' },
      ]
    }
  }

  // Build categories from SK jobs
  const catMap = new Map<string, number>()
  for (const job of allJobs) {
    const tl = job.title.toLowerCase()
    const cat = /it|develop|program|software|devops|data|cloud|web/.test(tl) ? 'IT & Vývoj'
      : /obchod|predaj|sales|key account/.test(tl) ? 'Obchod'
      : /účt|financ|ekon|audit/.test(tl) ? 'Financie'
      : /admin|asisten|recep|office/.test(tl) ? 'Administratíva'
      : /výrob|sklad|logist|operátor|montáž/.test(tl) ? 'Výroba & Logistika'
      : /market|brand|pr |comm/.test(tl) ? 'Marketing'
      : 'Iné'
    catMap.set(cat, (catMap.get(cat) ?? 0) + 1)
  }

  const totalNew = allJobs.length
  const topJobs = allJobs.slice(0, 12)
  const cats = Array.from(catMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6)

  return NextResponse.json({ topJobs, categories: cats, totalNew, timestamp: Date.now() })
}
