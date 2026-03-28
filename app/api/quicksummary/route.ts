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

  const [weatherRes, newsRes, redditRes, cryptoRes, sportsRes] = await Promise.allSettled([
    fetchJSON('https://api.open-meteo.com/v1/forecast?latitude=48.1486&longitude=17.1077&current=temperature_2m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset&timezone=Europe%2FBratislava&forecast_days=1'),
    fetchJSON('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://feeds.bbci.co.uk/news/world/rss.xml'), 5000).catch(() => null),
    fetchJSON('https://www.reddit.com/r/Slovakia/hot.json?limit=3&raw_json=1', 5000).catch(() => null),
    fetchJSON('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=eur&include_24hr_change=true', 5000).catch(() => null),
    fetchJSON('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard', 5000).catch(() => null),
  ])

  // Weather summary for Bratislava
  if (weatherRes.status === 'fulfilled') {
    try {
      const w = weatherRes.value
      const temp = Math.round(w.current?.temperature_2m ?? 0)
      const feels = Math.round(w.current?.apparent_temperature ?? 0)
      const max = Math.round(w.daily?.temperature_2m_max?.[0] ?? 0)
      const min = Math.round(w.daily?.temperature_2m_min?.[0] ?? 0)
      const uv = w.daily?.uv_index_max?.[0] ?? 0
      const sunrise = w.daily?.sunrise?.[0] ?? ''
      const sunset = w.daily?.sunset?.[0] ?? ''
      const sTime = sunrise ? new Date(sunrise).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }) : ''
      const eTime = sunset ? new Date(sunset).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }) : ''
      items.push({
        category: 'weather',
        icon: '🌤️',
        text: `BA: ${temp}° (pocit ${feels}°), max ${max}°/min ${min}°`,
        detail: `UV ${uv.toFixed(1)} · 🌅 ${sTime} · 🌇 ${eTime}`,
      })
    } catch { /* skip */ }
  }

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

  // Crypto prices
  if (cryptoRes.status === 'fulfilled') {
    try {
      const btc = cryptoRes.value?.bitcoin
      const eth = cryptoRes.value?.ethereum
      if (btc) {
        const btcChange = btc.eur_24h_change?.toFixed(1) ?? '0'
        const ethChange = eth?.eur_24h_change?.toFixed(1) ?? '0'
        items.push({
          category: 'crypto',
          icon: '₿',
          text: `BTC €${Math.round(btc.eur).toLocaleString('sk-SK')} (${Number(btcChange) >= 0 ? '+' : ''}${btcChange}%)`,
          detail: eth ? `ETH €${Math.round(eth.eur).toLocaleString('sk-SK')} (${Number(ethChange) >= 0 ? '+' : ''}${ethChange}%)` : undefined,
        })
      }
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
