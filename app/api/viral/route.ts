import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface ViralVideo {
  title: string
  channel: string
  views: string
  platform: 'YouTube' | 'TikTok' | 'Instagram'
  link: string
  thumbnail?: string
}

export async function GET() {
  const ytVideos: ViralVideo[] = []
  const ytShorts: ViralVideo[] = []

  // YouTube trending (Slovakia region) via Invidious public API
  const ytUrls = [
    'https://vid.puffyan.us/api/v1/trending?region=SK&type=default',
    'https://invidious.fdn.fr/api/v1/trending?region=SK&type=default',
    'https://inv.nadeko.net/api/v1/trending?region=SK&type=default',
    'https://invidious.nerdvpn.de/api/v1/trending?region=SK&type=default',
    'https://invidious.privacyredirect.com/api/v1/trending?region=SK&type=default',
    'https://iv.datura.network/api/v1/trending?region=SK&type=default',
  ]

  for (const url of ytUrls) {
    if (ytVideos.length >= 6) break
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)' },
      })
      if (!res.ok) continue
      const text = await res.text()
      if (!text.startsWith('[') && !text.startsWith('{')) continue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any[] = JSON.parse(text)
      if (!Array.isArray(data) || data.length === 0) continue
      for (const v of data.slice(0, 10)) {
        const viewCount = v.viewCount ?? v.viewCountText ?? 0
        const vid: ViralVideo = {
          title: v.title ?? '',
          channel: v.author ?? v.authorId ?? '',
          views: formatViews(typeof viewCount === 'number' ? viewCount : parseInt(String(viewCount).replace(/\D/g, '')) || 0),
          platform: 'YouTube',
          link: `https://www.youtube.com/watch?v=${v.videoId}`,
          thumbnail: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
        }
        // Shorts are typically < 60s
        const dur = v.lengthSeconds ?? 999
        if (dur <= 60 && ytShorts.length < 3) {
          ytShorts.push(vid)
        } else if (ytVideos.length < 6) {
          ytVideos.push(vid)
        }
      }
      break
    } catch { /* try next */ }
  }

  // Fallback for YT shorts from SK YouTube channels
  if (ytShorts.length < 3) {
    const shortUrls = [
      'https://vid.puffyan.us/api/v1/trending?region=SK&type=music',
      'https://invidious.fdn.fr/api/v1/trending?region=SK&type=music',
    ]
    for (const url of shortUrls) {
      if (ytShorts.length >= 3) break
      try {
        const res = await fetch(url, {
          cache: 'no-store', signal: AbortSignal.timeout(5000),
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)' },
        })
        if (!res.ok) continue
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = await res.json()
        if (!Array.isArray(data)) continue
        for (const v of data.slice(0, 5)) {
          if (ytShorts.length >= 3) break
          ytShorts.push({
            title: v.title ?? '',
            channel: v.author ?? '',
            views: formatViews(v.viewCount ?? 0),
            platform: 'YouTube',
            link: `https://www.youtube.com/watch?v=${v.videoId}`,
            thumbnail: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
          })
        }
        break
      } catch { /* try next */ }
    }
  }

  // Fallback 2: YouTube RSS popular channels from SK
  if (ytVideos.length === 0 && ytShorts.length === 0) {
    const skChannels = [
      'UCt7dTB7xR65umWoVibMgjMw',
      'UC3vd_YjS_TNAvRLhSfMfQ5Q',
      'UCc_dYNpJM2S_HA6CrUP0Z8g',
      'UCjoGIz1Ei8AWWQT0VG_O0Xw',
    ]
    for (const chId of skChannels) {
      if (ytVideos.length >= 6) break
      try {
        const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${chId}`, {
          cache: 'no-store',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InfoSK/1.0)' },
          signal: AbortSignal.timeout(5000),
        })
        if (!res.ok) continue
        const xml = await res.text()
        const entries = xml.split('<entry>').slice(1, 3)
        const channelName = xml.match(/<name>([\s\S]*?)<\/name>/)?.[1]?.trim() ?? ''
        for (const entry of entries) {
          const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/)
          const idMatch = entry.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/)
          const viewsMatch = entry.match(/<media:statistics views="(\d+)"/)
          if (titleMatch?.[1] && idMatch?.[1]) {
            ytVideos.push({
              title: titleMatch[1].trim(),
              channel: channelName,
              views: formatViews(parseInt(viewsMatch?.[1] ?? '0')),
              platform: 'YouTube',
              link: `https://www.youtube.com/watch?v=${idMatch[1].trim()}`,
              thumbnail: `https://i.ytimg.com/vi/${idMatch[1].trim()}/mqdefault.jpg`,
            })
          }
        }
      } catch { /* try next channel */ }
    }
  }

  // Instagram placeholders (no free API available)
  const instagramVideos: ViralVideo[] = [
    { title: 'Trending Reel 🇸🇰', channel: 'Instagram SK', views: '', platform: 'Instagram', link: 'https://www.instagram.com/reels/', thumbnail: '' },
    { title: 'Virálny Reel', channel: 'Instagram SK', views: '', platform: 'Instagram', link: 'https://www.instagram.com/reels/', thumbnail: '' },
    { title: 'Top Reel dnes', channel: 'Instagram SK', views: '', platform: 'Instagram', link: 'https://www.instagram.com/reels/', thumbnail: '' },
  ]

  // TikTok placeholders (no free API available)
  const tiktokVideos: ViralVideo[] = [
    { title: 'Trending TikTok 🇸🇰', channel: 'TikTok SK', views: '', platform: 'TikTok', link: 'https://www.tiktok.com/discover', thumbnail: '' },
    { title: 'Virálne TikTok', channel: 'TikTok SK', views: '', platform: 'TikTok', link: 'https://www.tiktok.com/discover', thumbnail: '' },
    { title: 'Top TikTok dnes', channel: 'TikTok SK', views: '', platform: 'TikTok', link: 'https://www.tiktok.com/discover', thumbnail: '' },
  ]

  // Build grid: 3 shorts, 3 instagram, 3 tiktok (+ regular YT)
  const shorts = ytShorts.slice(0, 3)
  while (shorts.length < 3 && ytVideos.length > 0) shorts.push({ ...ytVideos.pop()!, platform: 'YouTube' })

  return NextResponse.json({
    videos: ytVideos.slice(0, 6),
    shorts: shorts,
    instagram: instagramVideos.slice(0, 3),
    tiktok: tiktokVideos.slice(0, 3),
    timestamp: Date.now(),
  })
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n > 0 ? String(n) : ''
}
