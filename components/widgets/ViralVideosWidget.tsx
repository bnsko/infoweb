'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Video {
  title: string
  channel: string
  views: string
  link: string
  thumbnail?: string
  platform: string
}

interface ViralData {
  videos: Video[]
  shorts: Video[]
  instagram: Video[]
  tiktok: Video[]
  timestamp: number
}

const PLATFORM_STYLE: Record<string, { emoji: string; color: string; bg: string }> = {
  YouTube: { emoji: '▶️', color: '#ef4444', bg: 'bg-red-500/10 border-red-500/20' },
  TikTok: { emoji: '🎵', color: '#00f2ea', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  Instagram: { emoji: '📸', color: '#e1306c', bg: 'bg-pink-500/10 border-pink-500/20' },
}

function VideoCard({ v }: { v: Video }) {
  const plat = PLATFORM_STYLE[v.platform] ?? { emoji: '🎬', color: '#64748b', bg: 'bg-slate-500/10 border-slate-500/20' }
  return (
    <a href={v.link} target="_blank" rel="noopener noreferrer"
       className={`block rounded-xl overflow-hidden border ${plat.bg} hover:scale-[1.02] transition-all group`}>
      {v.thumbnail ? (
        <div className="relative aspect-video bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" loading="lazy" />
          <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: plat.color + '20', color: plat.color }}>
            {plat.emoji} {v.platform}
          </span>
          {v.views && (
            <span className="absolute bottom-1 right-1 text-[9px] text-white/80 bg-black/50 px-1 py-0.5 rounded">
              👀 {v.views}
            </span>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-white/[0.03] flex items-center justify-center">
          <span className="text-2xl">{plat.emoji}</span>
        </div>
      )}
      <div className="p-2">
        <p className="text-[10px] text-slate-200 group-hover:text-white leading-snug line-clamp-2 font-medium">{v.title}</p>
        <p className="text-[9px] text-slate-500 mt-0.5 truncate">{v.channel}</p>
      </div>
    </a>
  )
}

export default function ViralVideosWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<ViralData>('/api/viral', 20 * 60 * 1000)

  const shorts = data?.shorts ?? []
  const instagram = data?.instagram ?? []
  const tiktok = data?.tiktok ?? []
  const hasGrid = shorts.length > 0 || instagram.length > 0 || tiktok.length > 0

  return (
    <WidgetCard
      accent="rose"
      title={lang === 'sk' ? 'Virálne videá' : 'Viral Videos'}
      icon="🔥"
      onRefresh={refetch}
    >
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">{lang === 'sk' ? 'Chyba' : 'Error'}</p>}
      {!loading && data && !hasGrid && data.videos.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-4">{lang === 'sk' ? 'Žiadne videá' : 'No videos'}</p>
      )}
      {!loading && data && hasGrid && (
        <div className="space-y-3">
          {/* YT Shorts row */}
          {shorts.length > 0 && (
            <div>
              <div className="text-[9px] text-red-400 font-semibold uppercase tracking-wide mb-1.5">▶️ YouTube Shorts</div>
              <div className="grid grid-cols-3 gap-2">
                {shorts.map((v, i) => <VideoCard key={`s${i}`} v={v} />)}
              </div>
            </div>
          )}
          {/* Instagram row */}
          {instagram.length > 0 && (
            <div>
              <div className="text-[9px] text-pink-400 font-semibold uppercase tracking-wide mb-1.5">📸 Instagram Reels</div>
              <div className="grid grid-cols-3 gap-2">
                {instagram.map((v, i) => <VideoCard key={`i${i}`} v={v} />)}
              </div>
            </div>
          )}
          {/* TikTok row */}
          {tiktok.length > 0 && (
            <div>
              <div className="text-[9px] text-cyan-400 font-semibold uppercase tracking-wide mb-1.5">🎵 TikTok</div>
              <div className="grid grid-cols-3 gap-2">
                {tiktok.map((v, i) => <VideoCard key={`t${i}`} v={v} />)}
              </div>
            </div>
          )}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">{lang === 'sk' ? 'Top videá · obnova 20 min' : 'Top videos · refresh 20 min'}</p>
    </WidgetCard>
  )
}
