'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Tool {
  name: string
  description: string
  descriptionSk: string
  category: string
  url: string
  emoji: string
  tags: string[]
  daysAgo?: number
}

interface ToolData {
  today: Tool
  yesterday: Tool
  tomorrow: Tool
  recent: Tool[]
  categoryLabels: Record<string, { sk: string; en: string; emoji: string }>
}

const CAT_COLORS: Record<string, string> = {
  ai: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  cli: 'bg-green-500/15 text-green-300 border-green-500/20',
  saas: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  devtool: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  design: 'bg-pink-500/15 text-pink-300 border-pink-500/20',
}

export default function ToolOfTheDayWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<ToolData>('/api/tooloftheday', 60 * 60 * 1000)

  const today = data?.today
  const recent = data?.recent?.slice(1) ?? []
  const labels = data?.categoryLabels

  return (
    <WidgetCard
      accent="purple"
      title={lang === 'sk' ? 'Nástroj dňa' : 'Tool of the Day'}
      icon="🛠️"
      onRefresh={refetch}
    >
      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && today && (
        <div className="space-y-3">
          {/* Today's highlight */}
          <a href={today.url} target="_blank" rel="noopener noreferrer"
             className="block rounded-xl p-3 border border-violet-500/20 bg-violet-500/[0.07] hover:bg-violet-500/[0.12] transition-colors group">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{today.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white group-hover:text-violet-200 transition-colors">{today.name}</span>
                  {labels && labels[today.category] && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${CAT_COLORS[today.category] ?? 'bg-slate-500/15 text-slate-300 border-slate-500/20'}`}>
                      {labels[today.category].emoji} {lang === 'sk' ? labels[today.category].sk : labels[today.category].en}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {lang === 'sk' ? today.descriptionSk : today.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {today.tags.map(tag => (
                    <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-500">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </a>

          {/* Recent tools */}
          {recent.length > 0 && (
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">
                {lang === 'sk' ? 'Predošlé' : 'Previous'}
              </div>
              <div className="space-y-1">
                {recent.map((tool) => (
                  <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
                    <span className="text-sm">{tool.emoji}</span>
                    <span className="text-[11px] text-slate-300 group-hover:text-white font-medium flex-1 truncate">{tool.name}</span>
                    <span className="text-[9px] text-slate-600">
                      {tool.daysAgo === 1
                        ? (lang === 'sk' ? 'včera' : 'yesterday')
                        : `${tool.daysAgo}d`}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  )
}
