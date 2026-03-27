'use client'

import { useState, useMemo } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface WikiArticle { title: string; views: number; url: string }

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

type TimeRange = 'today' | 'yesterday' | 'week'
type Region = 'sk' | 'world'

function getDateStr(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`
}

export default function WikiWidget() {
  const { lang } = useLang()
  const [timeRange, setTimeRange] = useState<TimeRange>('today')
  const [region, setRegion] = useState<Region>('sk')

  // Wikipedia data is delayed by 1 day: "today" means yesterday's data
  const daysMapping = { today: 1, yesterday: 2, week: 1 }
  const dateStr = getDateStr(daysMapping[timeRange])
  const wikiLang = region === 'sk' ? 'sk' : 'en'
  const daysParam = timeRange === 'week' ? 7 : 1

  const { data, loading, refetch } = useWidget<{ items?: { articles: { article: string; views: number; rank: number }[] }[] }>(
    `/api/wiki?lang=${wikiLang}&date=${dateStr}&days=${daysParam}`,
    10 * 60 * 1000
  )

  // For "week" view, we'd ideally aggregate, but wiki API only gives daily. Show current day still.
  const articles = useMemo(() => {
    if (!data?.items?.[0]?.articles) return []
    return data.items[0].articles
      .filter(a => !a.article.startsWith('Main_Page') && !a.article.startsWith('Hlavná_stránka') && !a.article.startsWith('Special:') && !a.article.startsWith('Špeciálne:') && a.article !== '-')
      .slice(0, 15)
      .map(a => ({
        title: a.article.replace(/_/g, ' '),
        views: a.views,
        url: `https://${wikiLang}.wikipedia.org/wiki/${a.article}`
      }))
  }, [data, wikiLang])

  return (
    <WidgetCard accent="purple" title="Wikipedia Top" icon="📖" badge={articles.length || undefined} onRefresh={refetch}>
      {/* Region tabs */}
      <div className="flex items-center gap-0.5 mb-2 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        <button onClick={() => setRegion('sk')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${region === 'sk' ? 'bg-white/8 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
          🇸🇰 SK
        </button>
        <button onClick={() => setRegion('world')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${region === 'world' ? 'bg-white/8 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
          🌍 EN
        </button>
      </div>

      {/* Time range tabs */}
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        <button onClick={() => setTimeRange('today')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${timeRange === 'today' ? 'bg-violet-500/15 text-violet-300' : 'text-slate-500 hover:text-slate-300'}`}>
          {lang === 'sk' ? 'Dnes' : 'Today'}
        </button>
        <button onClick={() => setTimeRange('yesterday')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${timeRange === 'yesterday' ? 'bg-violet-500/15 text-violet-300' : 'text-slate-500 hover:text-slate-300'}`}>
          {lang === 'sk' ? 'Včera' : 'Yesterday'}
        </button>
        <button onClick={() => setTimeRange('week')}
          className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${timeRange === 'week' ? 'bg-violet-500/15 text-violet-300' : 'text-slate-500 hover:text-slate-300'}`}>
          {lang === 'sk' ? '7 dní' : '7 days'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-10 rounded-lg" />)}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-[11px] text-slate-500 py-4 text-center">{lang === 'sk' ? 'Žiadne dáta' : 'No data'}</p>
      ) : (
        <div className="space-y-0.5 max-h-[400px] overflow-y-auto scrollbar-hide">
          {articles.map((article, i) => (
            <a key={article.title} href={article.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 widget-item-hover group border border-transparent hover:border-violet-500/15">
              <span className={`text-[10px] font-mono w-5 text-center ${i < 3 ? 'text-violet-400 font-bold' : 'text-slate-600'}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-slate-200 group-hover:text-white truncate font-medium">{article.title}</div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono shrink-0">{formatViews(article.views)}</span>
            </a>
          ))}
        </div>
      )}
      <p className="text-[9px] text-slate-600 mt-2 text-center">Wikimedia REST API</p>
    </WidgetCard>
  )
}
