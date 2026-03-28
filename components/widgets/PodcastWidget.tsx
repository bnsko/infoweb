'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Podcast {
  title: string
  show: string
  link: string
  date: string
  duration?: string
}

interface PodcastData {
  podcasts: Podcast[]
  timestamp: number
}

const SHOW_COLORS: Record<string, string> = {
  'SME Podcasty': '#ef4444',
  'Denník N': '#6366f1',
  'Dobré ráno': '#f59e0b',
  'RTVS': '#3b82f6',
}

function relativeDate(dateStr: string): string {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 3600000)
  if (diff < 1) return 'teraz'
  if (diff < 24) return `${diff}h`
  if (diff < 48) return 'včera'
  return `${Math.floor(diff / 24)}d`
}

export default function PodcastWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<PodcastData>('/api/podcasts', 15 * 60 * 1000)

  return (
    <WidgetCard
      accent="purple"
      title={lang === 'sk' ? 'Podcasty · SK' : 'Podcasts · SK'}
      icon="🎙️"
      onRefresh={refetch}
    >
      {loading && <SkeletonRows rows={6} />}
      {!loading && error && <p className="text-xs text-slate-500">{lang === 'sk' ? 'Chyba' : 'Error'}</p>}
      {!loading && data && data.podcasts.length > 0 && (
        <div className="space-y-0.5 max-h-[380px] overflow-y-auto scrollbar-hide">
          {data.podcasts.map((pod, i) => {
            const showColor = SHOW_COLORS[pod.show] ?? '#64748b'
            return (
              <a
                key={i}
                href={pod.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 rounded-lg p-1.5 hover:bg-white/[0.04] transition-all group"
              >
                <span className="text-base shrink-0 mt-0.5">🎧</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-200 group-hover:text-white leading-snug line-clamp-2 font-medium">{pod.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[9px] font-semibold" style={{ color: showColor }}>{pod.show}</span>
                    {pod.duration && <span className="text-[9px] text-slate-600">⏱ {pod.duration}</span>}
                    <span className="text-[9px] text-slate-600">{relativeDate(pod.date)}</span>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">{lang === 'sk' ? 'SK podcasty · obnova 15 min' : 'SK podcasts · refresh 15 min'}</p>
    </WidgetCard>
  )
}
