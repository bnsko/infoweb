'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface Tool {
  name: string; description: string; descriptionSk: string
  category: string; url: string; emoji: string; tags: string[]
  daysAgo?: number
}
interface CatLabel { sk: string; en: string; emoji: string }

const TAG_COLORS = ['bg-blue-500/15 text-blue-300', 'bg-purple-500/15 text-purple-300', 'bg-emerald-500/15 text-emerald-300', 'bg-amber-500/15 text-amber-300', 'bg-rose-500/15 text-rose-300']

export default function ToolOfTheDayWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<{
    today: Tool; yesterday: Tool; tomorrow: Tool
    recent: Tool[]; categoryLabels: Record<string, CatLabel>
  }>('/api/tooloftheday', 60 * 60 * 1000)

  const tool = data?.today
  const catLabel = tool ? data?.categoryLabels?.[tool.category] : null

  return (
    <WidgetCard accent="purple" title={lang === 'sk' ? '🛠️ Nástroj dňa' : '🛠️ Tool of the Day'} icon="" onRefresh={refetch}>
      {loading || !tool ? (
        <div className="space-y-3">
          <div className="skeleton h-28 rounded-xl" />
          <div className="skeleton h-12 rounded-lg" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Hero card */}
          <a href={tool.url} target="_blank" rel="noopener noreferrer"
             className="block group rounded-xl p-4 border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/5 hover:border-purple-500/40 transition-all">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{tool.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors">{tool.name}</h3>
                  {catLabel && (
                    <span className="text-[9px] font-semibold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full">
                      {catLabel.emoji} {lang === 'sk' ? catLabel.sk : catLabel.en}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-slate-300 leading-relaxed">
                  {lang === 'sk' ? tool.descriptionSk : tool.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tool.tags.map((tag, i) => (
                    <span key={tag} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${TAG_COLORS[i % TAG_COLORS.length]}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </a>

          {/* Recent list */}
          <div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5">
              {lang === 'sk' ? 'Posledné nástroje' : 'Recent tools'}
            </div>
            <div className="space-y-0.5">
              {(data?.recent ?? []).slice(1).map((t) => (
                <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 rounded-lg px-2 py-1.5 widget-item-hover">
                  <span className="text-sm">{t.emoji}</span>
                  <span className="text-[11px] text-slate-300 font-medium flex-1 truncate">{t.name}</span>
                  <span className="text-[9px] text-slate-600">
                    {t.daysAgo === 1 ? (lang === 'sk' ? 'včera' : 'yesterday') : `${t.daysAgo}d`}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
