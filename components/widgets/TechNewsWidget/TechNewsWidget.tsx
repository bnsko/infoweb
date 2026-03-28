'use client'

import { useWidget } from '@/hooks/useWidget'
import { relativeTime } from '@/lib/utils'
import type { HNResponse } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'

export default function TechNewsWidget() {
  const { data, loading, error } = useWidget<HNResponse>('/api/hacknews', 5 * 60 * 1000)

  if (loading) return (
    <WidgetCard accent="rose" title="Technologické správy · Hacker News" icon="🔥" className="h-full">
      <SkeletonRows rows={8} cols={2} />
    </WidgetCard>
  )
  if (error || !data) return (
    <WidgetCard accent="rose" title="Technologické správy · Hacker News" icon="🔥" className="h-full">
      <WidgetError />
    </WidgetCard>
  )

  return (
    <WidgetCard accent="rose" title="Technologické správy · Hacker News" icon="🔥" badge={data.items.length} className="h-full">
      <div className="space-y-0.5">
        {data.items.map((item, i) => (
          <a
            key={item.id}
            href={item.url ?? `https://news.ycombinator.com/item?id=${item.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="news-item flex items-start gap-3 group"
          >
            <span className="text-[11px] text-slate-600 font-mono w-4 shrink-0 mt-0.5">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-200 group-hover:text-white leading-snug transition-colors line-clamp-2">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-rose-500/70 font-semibold">
                  ▲ {item.score}
                </span>
                <span className="text-[10px] text-slate-600">
                  {item.by} · {relativeTime(item.time)}
                </span>
                {item.descendants != null && (
                  <span className="text-[10px] text-slate-600">
                    💬 {item.descendants}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </WidgetCard>
  )
}
