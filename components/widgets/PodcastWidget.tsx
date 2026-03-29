'use client'

import { useState, useRef } from 'react'
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
  today: Podcast[]
  yesterday: Podcast[]
  week: Podcast[]
  all: Podcast[]
  timestamp: number
}

const SHOW_COLORS: Record<string, string> = {
  'SME Podcasty': '#ef4444',
  'SME - Dobré ráno': '#f59e0b',
  'SME - Svet': '#3b82f6',
  'Index (SME)': '#f97316',
  'Denník N': '#6366f1',
  'Startitup Podcast': '#10b981',
  'Forbes SK': '#8b5cf6',
  'Pravda': '#ec4899',
  'RTVS': '#0ea5e9',
  'Aktuality.sk': '#14b8a6',
  'Podcast.sk': '#a855f7',
  'Dobré ráno': '#f59e0b',
  'Podcasty.sk': '#10b981',
}

const TABS = [
  { key: 'today', label: 'Dnes', emoji: '📅' },
  { key: 'yesterday', label: 'Včera', emoji: '⏪' },
  { key: 'week', label: '7 dní', emoji: '📊' },
] as const

type Tab = (typeof TABS)[number]['key']

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
  const [tab, setTab] = useState<Tab>('today')
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { data, loading, error, refetch } = useWidget<PodcastData>('/api/podcasts', 15 * 60 * 1000)

  const podcasts = data ? (data[tab]?.length > 0 ? data[tab] : data.all) : []

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
    <WidgetCard
      accent="purple"
      title={lang === 'sk' ? 'Podcasty · SK' : 'Podcasts · SK'}
      icon="🎙️"
      onRefresh={refetch}
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-3">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
              tab === t.key
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {loading && <SkeletonRows rows={6} />}
      {!loading && error && <p className="text-xs text-slate-500">{lang === 'sk' ? 'Chyba' : 'Error'}</p>}
      {!loading && data && podcasts.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-4">{lang === 'sk' ? 'Žiadne podcasty' : 'No podcasts'}</p>
      )}
      {!loading && data && podcasts.length > 0 && (
        <div className="space-y-0.5 max-h-[380px] overflow-y-auto scrollbar-hide">
          {podcasts.map((pod, i) => {
            const showColor = SHOW_COLORS[pod.show] ?? '#64748b'
            return (
              <a
                key={i}
                href={pod.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 rounded-lg p-1.5 hover:bg-white/[0.04] transition-all group"
              >
                {pod.audioUrl ? (
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePlay(pod.audioUrl!) }}
                    className={`text-base shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                      playingUrl === pod.audioUrl ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-slate-400 hover:text-purple-300'
                    }`}
                  >
                    {playingUrl === pod.audioUrl ? '⏸' : '▶️'}
                  </button>
                ) : (
                  <span className="text-base shrink-0 mt-0.5">🎧</span>
                )}
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
