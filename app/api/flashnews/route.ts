import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface FlashItem {
  title: string
  source: string
  link: string
  timestamp: number
  ago: string
}

function relativeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 60000)
  if (diff < 1) return 'práve teraz'
  if (diff < 60) return `pred ${diff} min`
  const h = Math.floor(diff / 60)
  if (h < 24) return `pred ${h} hod`
  return `pred ${Math.floor(h / 24)} d`
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
}

interface RSSSource {
  url: string
  name: string
}

const RSS_SOURCES: RSSSource[] = [
  { url: 'https://rss.sme.sk/rss/rss.asp?s=top', name: 'SME.sk' },
  { url: 'https://dennikn.sk/feed/', name: 'Denník N' },
  { url: 'https://www.aktuality.sk/rss/', name: 'Aktuality' },
  { url: 'https://spravy.pravda.sk/rss/xml/', name: 'Pravda' },
  { url: 'https://www.teraz.sk/rss/slovensko.rss', name: 'TASR' },
  { url: 'https://www.topky.sk/rss.xml', name: 'Topky' },
]

async function fetchRSS(source: RSSSource): Promise<FlashItem[]> {
  try {
    const res = await fetch(source.url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)' },
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items: FlashItem[] = []
    const entries = xml.split(/<item[ >]/).slice(1, 10)
    for (const entry of entries) {
      const titleMatch = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)
      const linkMatch = entry.match(/<link[^>]*>([\s\S]*?)<\/link>/) ?? entry.match(/<link[^>]*href="([^"]*)"/)
      const dateMatch = entry.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/) ?? entry.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/) ?? entry.match(/<published[^>]*>([\s\S]*?)<\/published>/)

      const title = titleMatch?.[1] ? decodeEntities(titleMatch[1].trim()) : ''
      const link = linkMatch?.[1]?.trim() ?? ''
      const dateStr = dateMatch?.[1]?.trim() ?? ''
      const ts = dateStr ? new Date(dateStr).getTime() : Date.now()

      if (title && !isNaN(ts)) {
        items.push({ title, source: source.name, link, timestamp: ts, ago: '' })
      }
    }
    return items
  } catch {
    return []
  }
}

export async function GET() {
  const results = await Promise.allSettled(RSS_SOURCES.map(s => fetchRSS(s)))

  let allItems: FlashItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') allItems.push(...r.value)
  }

  // Deduplicate by title (normalized)
  const seen = new Set<string>()
  const deduped: FlashItem[] = []
  for (const item of allItems) {
    const key = item.title.toLowerCase().replace(/\s+/g, ' ').trim()
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(item)
    }
  }

  // Filter: only last 2 hours for fresh rotation each minute
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
  let recentItems = deduped.filter(i => i.timestamp >= twoHoursAgo)
  // If nothing in 2 hours, take last 6 hours as fallback
  if (recentItems.length === 0) {
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000
    recentItems = deduped.filter(i => i.timestamp >= sixHoursAgo)
  }
  // If still nothing, take newest 15
  if (recentItems.length === 0) {
    recentItems = deduped.slice(0, 15)
  }

  // Sort by timestamp descending
  recentItems.sort((a, b) => b.timestamp - a.timestamp)

  // All sources are Slovak, just add ago labels
  const translated = recentItems.slice(0, 15).map(item => {
    return { ...item, ago: relativeAgo(item.timestamp) }
  })

  const summaryItems = translated.slice(0, 5).map(item => item.title)
  const summary = summaryItems.length > 0
    ? `🔑 ${summaryItems.join(' · ')}`
    : ''

  return NextResponse.json({ items: translated, summary, timestamp: Date.now() })
}

// Simple keyword-based EN→SK headline translation
function translateHeadline(title: string): string {
  const replacements: [RegExp, string][] = [
    [/\bbreaking\b/gi, 'Aktuálne'],
    [/\bwar\b/gi, 'vojna'],
    [/\bpeace\b/gi, 'mier'],
    [/\bpresident\b/gi, 'prezident'],
    [/\belection(s)?\b/gi, 'voľby'],
    [/\bgovernment\b/gi, 'vláda'],
    [/\bpolice\b/gi, 'polícia'],
    [/\battack(s)?\b/gi, 'útok'],
    [/\bdead\b/gi, 'mŕtvych'],
    [/\bkilled\b/gi, 'zabitých'],
    [/\bearth ?quake\b/gi, 'zemetrasenie'],
    [/\bflood(s|ing)?\b/gi, 'záplavy'],
    [/\bfire\b/gi, 'požiar'],
    [/\bstorm\b/gi, 'búrka'],
    [/\bclimate\b/gi, 'klíma'],
    [/\beconomy\b/gi, 'ekonomika'],
    [/\bmarket(s)?\b/gi, 'trhy'],
    [/\bstock(s)?\b/gi, 'akcie'],
    [/\btrade\b/gi, 'obchod'],
    [/\bsays?\b/gi, 'hovorí'],
    [/\breport(s)?\b/gi, 'správy'],
    [/\bnew\b/gi, 'nový'],
    [/\bworld\b/gi, 'svet'],
    [/\bcountry\b/gi, 'krajina'],
    [/\bleader(s)?\b/gi, 'lídri'],
    [/\bcrisis\b/gi, 'kríza'],
    [/\bhealth\b/gi, 'zdravie'],
    [/\bCovid\b/gi, 'Covid'],
    [/\bvirus\b/gi, 'vírus'],
    [/\bsecurity\b/gi, 'bezpečnosť'],
    [/\bEurope\b/gi, 'Európa'],
    [/\bRussia\b/gi, 'Rusko'],
    [/\bUkraine\b/gi, 'Ukrajina'],
    [/\bChina\b/gi, 'Čína'],
    [/\bUS\b/g, 'USA'],
  ]
  let result = title
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement)
  }
  return result
}
