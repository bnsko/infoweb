'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface NewsItem {
  title: string
  link: string
  source: string
  pubDate: string
}

interface NewsData {
  items: NewsItem[]
  timestamp: number
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export default function GoogleNewsSKWidget() {
  const { data, loading, refetch } = useWidget<NewsData>('/api/googlenews', 15 * 60 * 1000)

  return (
    <WidgetCard accent="rose" title="Google News SK" icon="📰" onRefresh={refetch}>
      {loading && <SkeletonRows rows={8} />}
      {!loading && data && (
        <div className="space-y-1">
          {data.items.slice(0, 12).map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition group"
            >
              <span className="text-[8px] font-mono text-slate-600 mt-0.5 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-slate-200 group-hover:text-white leading-snug line-clamp-2">
                  {item.title}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[8px] text-slate-500">{item.source}</span>
                  <span className="text-[6px] text-slate-700">•</span>
                  <span className="text-[8px] text-slate-600">{timeAgo(item.pubDate)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">Google News · RSS · 15 min</p>
    </WidgetCard>
  )
}
