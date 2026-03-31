'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface NewsItem { title: string; link: string; source: string }
interface StartupNewsData { items: NewsItem[]; count: number; timestamp: number }

export default function StartupNewsWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<StartupNewsData>('/api/startupnews', 30 * 60 * 1000)

  const sourceColor: Record<string, string> = {
    'StartItUp': 'bg-emerald-500/15 text-emerald-300',
    'TouchIT': 'bg-blue-500/15 text-blue-300',
    'Trend': 'bg-amber-500/15 text-amber-300',
    'Forbes SK': 'bg-red-500/15 text-red-300',
    'Denník N': 'bg-purple-500/15 text-purple-300',
  }

  return (
    <WidgetCard accent="green" title={lang === 'sk' ? 'Startupy & Tech SK' : 'Startup News SK'} icon="🚀" onRefresh={refetch}
      badge={data ? `${data.count}` : undefined}>
      {loading && <SkeletonRows rows={5} />}
      {!loading && data && (
        <div className="space-y-0.5 max-h-[300px] overflow-y-auto scrollbar-hide">
          {data.items.length === 0 ? (
            <p className="text-[10px] text-slate-500 text-center py-3">Žiadne novinky</p>
          ) : data.items.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.03] transition-colors">
              <span className="text-xs mt-0.5">📰</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-200 font-medium line-clamp-2">{item.title}</p>
              </div>
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${sourceColor[item.source] ?? 'bg-white/5 text-slate-400'}`}>{item.source}</span>
            </a>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
