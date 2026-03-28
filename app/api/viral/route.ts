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
  const videos: ViralVideo[] = []

  // YouTube trending (Slovakia region) via Invidious public API
  const ytUrls = [
    'https://vid.puffyan.us/api/v1/trending?region=SK&type=default',
    'https://invidious.fdn.fr/api/v1/trending?region=SK&type=default',
  ]

  for (const url of ytUrls) {
    if (videos.length >= 5) break
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(6000),
      })
      if (!res.ok) continue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any[] = await res.json()
      for (const v of data.slice(0, 5)) {
        const viewCount = v.viewCount ?? v.viewCountText ?? 0
        videos.push({
          title: v.title ?? '',
          channel: v.author ?? v.authorId ?? '',
          views: formatViews(typeof viewCount === 'number' ? viewCount : parseInt(String(viewCount).replace(/\D/g, '')) || 0),
          platform: 'YouTube',
          link: `https://www.youtube.com/watch?v=${v.videoId}`,
          thumbnail: v.videoThumbnails?.[0]?.url ?? `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
        })
      }
      break
    } catch { /* try next */ }
  }

  // Fallback: YouTube RSS popular
  if (videos.length === 0) {
    try {
      const res = await fetch('https://www.youtube.com/feeds/videos.xml?chart=trending&gl=SK', {
        cache: 'no-store',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(6000),
      })
      if (res.ok) {
        const xml = await res.text()
        const entries = xml.split('<entry>').slice(1, 6)
        for (const entry of entries) {
          const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/)
          const authorMatch = entry.match(/<name>([\s\S]*?)<\/name>/)
          const idMatch = entry.match(/<yt:videoId>([\s\S]*?)<\/yt:videoId>/)
          const viewsMatch = entry.match(/<media:statistics views="(\d+)"/)

          if (titleMatch?.[1] && idMatch?.[1]) {
            videos.push({
              title: titleMatch[1].trim(),
              channel: authorMatch?.[1]?.trim() ?? '',
              views: formatViews(parseInt(viewsMatch?.[1] ?? '0')),
              platform: 'YouTube',
              link: `https://www.youtube.com/watch?v=${idMatch[1].trim()}`,
              thumbnail: `https://i.ytimg.com/vi/${idMatch[1].trim()}/mqdefault.jpg`,
            })
          }
        }
      }
    } catch { /* ignore */ }
  }

  return NextResponse.json({ videos: videos.slice(0, 5), timestamp: Date.now() })
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}
