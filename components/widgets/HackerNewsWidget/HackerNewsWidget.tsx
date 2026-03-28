'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface Story {
  id: number; title: string; url: string; hnUrl: string; score: number
  by: string; descendants: number; time: number; domain: string; source: string
}

function timeAgo(ts: number, lang: string): string {
  const diff = Math.floor(Date.now() / 1000 - ts)
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return lang === 'sk' ? `${Math.floor(diff / 86400)}d` : `${Math.floor(diff / 86400)}d`
}

type Source = 'hn' | 'devto' | 'lobsters' | 'producthunt'

const SOURCES: { key: Source; icon: string; label: string; accent: string }[] = [
  { key: 'hn',          icon: '🟠', label: 'HN',          accent: 'text-orange-400' },
  { key: 'devto',       icon: '🟣', label: 'DEV.to',       accent: 'text-violet-400' },
  { key: 'lobsters',    icon: '🦞', label: 'Lobsters',    accent: 'text-red-400' },
  { key: 'producthunt', icon: '🐱', label: 'PH',          accent: 'text-rose-400' },
]

export default function HackerNewsWidget() {
  const { lang } = useLang()
  const [source, setSource] = useState<Source>('hn')
  const { data, loading, refetch } = useWidget<{ stories: Story[] }>(
    `/api/hackernews?source=${source}`, 5 * 60 * 1000
  )

  const accentColor = SOURCES.find(s => s.key === source)?.accent ?? 'text-orange-400'

  return (
    <WidgetCard accent="orange" title="Tech News" icon="📡" badge={data?.stories?.length || undefined} onRefresh={refetch}>
      {/* Source tabs */}
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {SOURCES.map(s => (
          <button key={s.key} onClick={() => setSource(s.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              source === s.key ? 'bg-orange-500/15 text-orange-300' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-0.5 max-h-[500px] overflow-y-auto scrollbar-hide">
          {(data?.stories ?? []).map((story, i) => (
            <div key={story.id} className="group rounded-lg p-2 widget-item-hover">
              <div className="flex items-start gap-2.5">
                <span className={`text-[11px] font-mono w-5 text-center shrink-0 mt-0.5 ${
                  i < 3 ? `${accentColor} font-bold` : 'text-slate-600'
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <a href={story.url} target="_blank" rel="noopener noreferrer"
                     className="text-[12px] text-slate-200 group-hover:text-white font-medium leading-snug line-clamp-2">
                    {story.title}
                  </a>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                    {story.score > 0 && <span className={accentColor}>▲ {story.score}</span>}
                    {story.by && <span>{story.by}</span>}
                    {story.hnUrl && (
                      <a href={story.hnUrl} target="_blank" rel="noopener noreferrer" className="hover:text-orange-300">
                        💬 {story.descendants}
                      </a>
                    )}
                    <span className="text-slate-600">{story.domain}</span>
                    <span>{timeAgo(story.time, lang)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[9px] text-slate-600 mt-2 text-center">
        {source === 'hn' ? 'Hacker News Firebase API' : source === 'devto' ? 'DEV.to API' : source === 'lobsters' ? 'Lobste.rs RSS' : 'Product Hunt'}
      </p>
    </WidgetCard>
  )
}
