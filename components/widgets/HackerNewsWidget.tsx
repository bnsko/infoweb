'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface Story {
  id: number
  title: string
  url: string
  hnUrl: string
  score: number
  by: string
  descendants: number
  time: number
  domain: string
}

function timeAgo(ts: number, lang: string): string {
  const diff = Math.floor(Date.now() / 1000 - ts)
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return lang === 'sk' ? `${Math.floor(diff / 86400)}d` : `${Math.floor(diff / 86400)}d`
}

export default function HackerNewsWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<{ stories: Story[] }>('/api/hackernews', 5 * 60 * 1000)

  return (
    <WidgetCard accent="orange" title="Hacker News Top 10" icon="🟠" badge={data?.stories?.length || undefined} onRefresh={refetch}>
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
                  i < 3 ? 'text-orange-400 font-bold' : 'text-slate-600'
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <a href={story.url} target="_blank" rel="noopener noreferrer"
                     className="text-[12px] text-slate-200 group-hover:text-white font-medium leading-snug line-clamp-2">
                    {story.title}
                  </a>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                    <span className="text-orange-400/80">▲ {story.score}</span>
                    <span>{story.by}</span>
                    <a href={story.hnUrl} target="_blank" rel="noopener noreferrer" className="hover:text-orange-300">
                      💬 {story.descendants}
                    </a>
                    <span className="text-slate-600">{story.domain}</span>
                    <span>{timeAgo(story.time, lang)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[9px] text-slate-600 mt-2 text-center">Hacker News Firebase API</p>
    </WidgetCard>
  )
}
