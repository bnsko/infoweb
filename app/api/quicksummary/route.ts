import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface SummaryItem {
  category: string
  icon: string
  text: string
  detail?: string
  link?: string
}

async function fetchJSON(url: string, timeoutMs = 8000) {
  const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(timeoutMs) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function GET() {
  const items: SummaryItem[] = []

  const [newsRes, redditRes, sportsRes] = await Promise.allSettled([
    fetchJSON('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://feeds.bbci.co.uk/news/world/rss.xml'), 5000).catch(() => null),
    fetchJSON('https://www.reddit.com/r/Slovakia/hot.json?limit=3&raw_json=1', 5000).catch(() => null),
    fetchJSON('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard', 5000).catch(() => null),
  ])

  // Top Reddit r/Slovakia post
  if (redditRes.status === 'fulfilled' && redditRes.value?.data?.children?.length) {
    try {
      const top = redditRes.value.data.children[0].data
      items.push({
        category: 'reddit',
        icon: '🟠',
        text: top.title,
        detail: `▲${top.score} · 💬${top.num_comments} · r/Slovakia`,
        link: `https://reddit.com${top.permalink}`,
      })
    } catch { /* skip */ }
  }

  // BBC News top headline (from RSS via allorigins)
  if (newsRes.status === 'fulfilled' && typeof newsRes.value === 'string') {
    try {
      const titleMatch = newsRes.value.match(/<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/)
        ?? newsRes.value.match(/<item>[\s\S]*?<title>(.*?)<\/title>/)
      if (titleMatch?.[1]) {
        items.push({
          category: 'world',
          icon: '🌍',
          text: titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
          detail: 'BBC News · Svet',
        })
      }
    } catch { /* skip */ }
  }

  return NextResponse.json({ items, timestamp: Date.now() })
}
