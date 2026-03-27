'use client'

import { useWidget } from '@/hooks/useWidget'
import type { NewsResponse } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'

export default function MusicNewsWidget() {
  const { data, loading, error } = useWidget<NewsResponse>('/api/musicnews', 5 * 60 * 1000)

  if (loading) return (
    <WidgetCard accent="rose" title="Hudobný svet" icon="🎵" className="h-full">
      <SkeletonRows rows={6} />
    </WidgetCard>
  )
  if (error || !data) return (
    <WidgetCard accent="rose" title="Hudobný svet" icon="🎵" className="h-full">
      <WidgetError />
    </WidgetCard>
  )

  const items = data.items.slice(0, 10)

  return (
    <WidgetCard accent="rose" title="Hudobný svet" icon="🎵" badge={items.length} className="h-full">
      <div className="space-y-0.5">
        {items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="news-item block group"
          >
            <div className="flex items-start gap-2">
              <span className="text-[10px] text-rose-400/70 font-bold mt-0.5 shrink-0 w-20 truncate">
                {item.source}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-slate-200 group-hover:text-white leading-snug line-clamp-2 transition-colors">
                  {item.title}
                </p>
                {item.pubDate && (
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {(() => {
                      try {
                        return new Date(item.pubDate).toLocaleString('sk-SK', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })
                      } catch { return '' }
                    })()}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </WidgetCard>
  )
}
