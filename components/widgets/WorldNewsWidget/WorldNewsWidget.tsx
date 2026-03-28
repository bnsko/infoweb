'use client'

import { useWidget } from '@/hooks/useWidget'
import type { NewsResponse } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'

export default function WorldNewsWidget() {
  const { data, loading, error } = useWidget<NewsResponse>('/api/worldnews', 5 * 60 * 1000)

  if (loading) return (
    <WidgetCard accent="cyan" title="Správy zo sveta" icon="🌍" className="h-full">
      <SkeletonRows rows={6} />
    </WidgetCard>
  )
  if (error || !data) return (
    <WidgetCard accent="cyan" title="Správy zo sveta" icon="🌍" className="h-full">
      <WidgetError />
    </WidgetCard>
  )

  return (
    <WidgetCard accent="cyan" title="Správy zo sveta" icon="🌍" badge={data.items.length} className="h-full">
      <div className="space-y-0.5">
        {data.items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="news-item block group"
          >
            <div className="flex items-start gap-2">
              <span className="text-[10px] text-cyan-500/60 font-bold mt-0.5 shrink-0 w-14">
                {item.source}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-slate-200 group-hover:text-white leading-snug line-clamp-2 transition-colors">
                  {item.title}
                </p>
                {item.pubDate && (
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {new Date(item.pubDate).toLocaleString('sk-SK', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    }).replace('Invalid Date', '')}
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
