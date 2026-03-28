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
  timestamp: number
}

const PLATFORM_BADGE: Record<string, { emoji: string; color: string }> = {
  YouTube: { emoji: '▶️', color: '#ef4444' },
  TikTok: { emoji: '🎵', color: '#00f2ea' },
  Instagram: { emoji: '📸', color: '#e1306c' },
}

export default function ViralVideosWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<ViralData>('/api/viral', 20 * 60 * 1000)

  return (
    <WidgetCard
      accent="rose"
      title={lang === 'sk' ? 'Virálne videá' : 'Viral Videos'}
      icon="🔥"
      onRefresh={refetch}
    >
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">{lang === 'sk' ? 'Chyba' : 'Error'}</p>}
      {!loading && data && data.videos.length > 0 && (
        <div className="space-y-1.5">
          {data.videos.slice(0, 5).map((v, i) => {
            const plat = PLATFORM_BADGE[v.platform] ?? { emoji: '🎬', color: '#64748b' }
            return (
              <a
                key={i}
                href={v.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 rounded-lg p-1.5 hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.06] text-lg shrink-0">
                  <span className="font-bold text-sm text-slate-400">#{i + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-200 group-hover:text-white leading-snug line-clamp-2 font-medium">{v.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[9px] font-semibold" style={{ color: plat.color }}>{plat.emoji} {v.platform}</span>
                    <span className="text-[9px] text-slate-500">{v.channel}</span>
                    <span className="text-[9px] text-slate-500">👀 {v.views}</span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">{lang === 'sk' ? 'Top videá · obnova 20 min' : 'Top videos · refresh 20 min'}</p>
    </WidgetCard>
  )
}
