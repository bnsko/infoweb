'use client'

import { useRef, useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Podcast {
  title: string
  show: string
  link: string
  audioUrl?: string
  date: string
  duration?: string
}

interface PodcastData {
  podcasts: Podcast[]
  timestamp: number
}

const SHOW_STYLE: Record<string, { color: string; bg: string }> = {
  'Denník N': { color: '#6366f1', bg: 'bg-indigo-500/10' },
  'Startitup': { color: '#10b981', bg: 'bg-emerald-500/10' },
  'Lužifčák': { color: '#f59e0b', bg: 'bg-amber-500/10' },
  'Recast': { color: '#ec4899', bg: 'bg-pink-500/10' },
  'Jirka Král': { color: '#ef4444', bg: 'bg-red-500/10' },
  'Dobré ráno': { color: '#f97316', bg: 'bg-orange-500/10' },
  'Index': { color: '#3b82f6', bg: 'bg-blue-500/10' },
  'Forbes SK': { color: '#8b5cf6', bg: 'bg-violet-500/10' },
  'Pravda': { color: '#ef4444', bg: 'bg-red-500/10' },
  'Tech.sme': { color: '#06b6d4', bg: 'bg-cyan-500/10' },
  'Para podcast': { color: '#14b8a6', bg: 'bg-teal-500/10' },
  'Aktuality': { color: '#f43f5e', bg: 'bg-rose-500/10' },
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
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const [showFilter, setShowFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'show'>('recent')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { data, loading, error, refetch } = useWidget<PodcastData>('/api/podcasts', 15 * 60 * 1000)

  const allPodcasts = data?.podcasts ?? []
  const shows = Array.from(new Set(allPodcasts.map(p => p.show))).sort()
  const filtered = showFilter === 'all' ? allPodcasts : allPodcasts.filter(p => p.show === showFilter)
  const podcasts = sortBy === 'show'
    ? [...filtered].sort((a, b) => a.show.localeCompare(b.show) || new Date(b.date).getTime() - new Date(a.date).getTime())
    : filtered

  const togglePlay = (url: string) => {
    if (playingUrl === url) {
      audioRef.current?.pause()
      setPlayingUrl(null)
    } else {
      if (audioRef.current) audioRef.current.pause()
      const audio = new Audio(url)
      audio.play()
      audio.onended = () => setPlayingUrl(null)
      audioRef.current = audio
      setPlayingUrl(url)
    }
  }

  return (
    <WidgetCard accent="purple" title={lang === 'sk' ? 'Podcasty · SK' : 'Podcasts · SK'} icon="🎙️" onRefresh={refetch}
      badge={allPodcasts.length > 0 ? `${allPodcasts.length}` : undefined}>
      {loading && <SkeletonRows rows={6} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && allPodcasts.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-4">Žiadne podcasty</p>
      )}
      {!loading && allPodcasts.length > 0 && (
        <>
          {/* Show filter */}
          <div className="flex flex-wrap gap-1 mb-2">
            <button onClick={() => setShowFilter('all')}
              className={`text-[8px] px-2 py-0.5 rounded-full font-semibold transition-colors ${showFilter === 'all' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-500 hover:text-slate-300'}`}>
              Všetky ({allPodcasts.length})
            </button>
            {shows.map(s => {
              const style = SHOW_STYLE[s]
              return (
                <button key={s} onClick={() => setShowFilter(s)}
                  className={`text-[8px] px-2 py-0.5 rounded-full font-semibold transition-colors ${showFilter === s ? `${style?.bg ?? 'bg-white/10'} text-white` : 'text-slate-500 hover:text-slate-300'}`}
                  style={showFilter === s && style ? { color: style.color } : undefined}>
                  {s}
                </button>
              )
            })}
          </div>
          {/* Sort toggle */}
          <div className="flex gap-1 mb-3">
            <button onClick={() => setSortBy('recent')} className={`text-[8px] px-2 py-0.5 rounded-full font-semibold transition-colors ${sortBy === 'recent' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-500 hover:text-slate-300'}`}>🕐 Najnovšie</button>
            <button onClick={() => setSortBy('show')} className={`text-[8px] px-2 py-0.5 rounded-full font-semibold transition-colors ${sortBy === 'show' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-500 hover:text-slate-300'}`}>📻 Podľa relácie</button>
          </div>

          {/* Episode list */}
          <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-hide">
            {podcasts.map((pod, i) => {
              const style = SHOW_STYLE[pod.show] ?? { color: '#64748b', bg: 'bg-slate-500/10' }
              return (
                <div key={i} className="rounded-xl p-2.5 border border-white/5 bg-white/[0.015] hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-start gap-2">
                    {/* Play button or link icon */}
                    {pod.audioUrl ? (
                      <button
                        onClick={() => togglePlay(pod.audioUrl!)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full shrink-0 transition-all ${
                          playingUrl === pod.audioUrl ? 'bg-purple-500/30 text-purple-300 scale-110' : 'bg-white/5 text-slate-400 hover:text-purple-300 hover:bg-purple-500/15'
                        }`}>
                        {playingUrl === pod.audioUrl ? '⏸' : '▶'}
                      </button>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 shrink-0">
                        <span className="text-sm">🎧</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <a href={pod.link} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] text-slate-200 group-hover:text-white leading-snug line-clamp-2 font-medium hover:underline decoration-slate-500/40 underline-offset-2">
                        {pod.title}
                      </a>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: style.color, backgroundColor: style.color + '15' }}>
                          {pod.show}
                        </span>
                        {pod.duration && <span className="text-[8px] text-slate-600">⏱ {pod.duration}</span>}
                        <span className="text-[8px] text-slate-600">{relativeDate(pod.date)}</span>
                        <a href={pod.link} target="_blank" rel="noopener noreferrer"
                          className="text-[8px] text-purple-400/60 hover:text-purple-300 ml-auto">
                          Otvoriť ↗
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
      <p className="text-[10px] text-slate-600 mt-2">Denník N · Startitup · Lužifčák · Recast · Jirka Král · Dobré ráno · Forbes SK + ďalšie</p>
    </WidgetCard>
  )
}
