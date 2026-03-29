import { NextResponse } from 'next/server'

export const revalidate = 86400

interface StreamItem {
  title: string
  platform: string
  type: 'movie' | 'series'
  genre: string
  rating?: string
  year?: number
  note?: string
}

// Trending content on streaming platforms in SK region
function getStreamingTrending(): StreamItem[] {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)

  const catalog: StreamItem[] = [
    { title: 'Adolescence', platform: 'Netflix', type: 'series', genre: 'Dráma', rating: '8.9', year: 2025 },
    { title: 'Black Mirror S7', platform: 'Netflix', type: 'series', genre: 'Sci-fi', rating: '8.2', year: 2025 },
    { title: 'The White Lotus S3', platform: 'HBO Max', type: 'series', genre: 'Satira', rating: '8.5', year: 2025 },
    { title: 'Dune: Prophecy', platform: 'HBO Max', type: 'series', genre: 'Sci-fi', rating: '7.8', year: 2024 },
    { title: 'Severance S2', platform: 'Apple TV+', type: 'series', genre: 'Thriller', rating: '9.1', year: 2025 },
    { title: 'The Bear S4', platform: 'Disney+', type: 'series', genre: 'Komédia', rating: '8.6', year: 2025 },
    { title: 'Reacher S3', platform: 'Amazon Prime', type: 'series', genre: 'Akčný', rating: '8.0', year: 2025 },
    { title: 'Squid Game S3', platform: 'Netflix', type: 'series', genre: 'Dráma', rating: '7.9', year: 2025 },
    { title: 'Andor S2', platform: 'Disney+', type: 'series', genre: 'Sci-fi', rating: '8.4', year: 2025 },
    { title: 'The Last of Us S2', platform: 'HBO Max', type: 'series', genre: 'Dráma', rating: '9.0', year: 2025 },
    { title: 'Hacks S4', platform: 'HBO Max', type: 'series', genre: 'Komédia', rating: '8.3', year: 2025 },
    { title: 'Stranger Things S5', platform: 'Netflix', type: 'series', genre: 'Sci-fi', rating: '8.8', year: 2025 },
    { title: 'Slow Horses S4', platform: 'Apple TV+', type: 'series', genre: 'Špionáž', rating: '8.7', year: 2025 },
    { title: 'The Diplomat S3', platform: 'Netflix', type: 'series', genre: 'Politika', rating: '7.8', year: 2025 },
    { title: 'Fallout S2', platform: 'Amazon Prime', type: 'series', genre: 'Sci-fi', rating: '8.5', year: 2025 },
  ]

  // Rotate selection daily
  const startIdx = (dayOfYear * 3) % catalog.length
  const items: StreamItem[] = []
  for (let i = 0; i < 10; i++) {
    items.push(catalog[(startIdx + i) % catalog.length])
  }
  return items
}

const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  'Netflix': { bg: 'bg-red-500/15', text: 'text-red-400' },
  'HBO Max': { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  'Disney+': { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  'Apple TV+': { bg: 'bg-slate-500/15', text: 'text-slate-300' },
  'Amazon Prime': { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
}

export async function GET() {
  const items = getStreamingTrending()

  return NextResponse.json({
    items,
    platformColors: PLATFORM_COLORS,
    timestamp: Date.now(),
  })
}
