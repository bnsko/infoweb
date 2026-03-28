'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { relativeTime } from '@/lib/utils'
import type { NewsResponse, HNResponse, HNItem, NewsItem } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

const TABS = [
  { key: 'sk',       emoji: '🇸🇰', tKey: 'news.slovakia',    url: '/api/news',         accent: 'text-orange-400',  border: 'border-orange-400' },
  { key: 'world',    emoji: '🌍', tKey: 'news.world',        url: '/api/worldnews',    accent: 'text-cyan-400',    border: 'border-cyan-400' },
  { key: 'sport',    emoji: '⚽', tKey: 'news.sport',        url: '/api/sportnews',    accent: 'text-green-400',   border: 'border-green-400' },
  { key: 'economy',  emoji: '📊', tKey: 'news.economy',      url: '/api/economynews',  accent: 'text-emerald-400', border: 'border-emerald-400' },
  { key: 'ai',       emoji: '🤖', tKey: 'AI',                url: '/api/ainews',       accent: 'text-violet-400',  border: 'border-violet-400' },
  { key: 'science',  emoji: '🔬', tKey: 'news.science',      url: '/api/sciencenews',  accent: 'text-teal-400',    border: 'border-teal-400' },
  { key: 'health',   emoji: '🏥', tKey: 'news.health',       url: '/api/healthnews',   accent: 'text-pink-400',    border: 'border-pink-400' },
  { key: 'crypto',   emoji: '₿',  tKey: 'news.crypto',       url: '/api/cryptonews',   accent: 'text-yellow-400',  border: 'border-yellow-400' },
  { key: 'gaming',   emoji: '🎮', tKey: 'Gaming',            url: '/api/gamingnews',   accent: 'text-purple-400',  border: 'border-purple-400' },
  { key: 'film',     emoji: '🎬', tKey: 'Film/TV',           url: '/api/filmnews',     accent: 'text-fuchsia-400', border: 'border-fuchsia-400' },
  { key: 'auto',     emoji: '🚗', tKey: 'Auto',              url: '/api/autonews',     accent: 'text-red-400',     border: 'border-red-400' },
  { key: 'travel',   emoji: '✈️', tKey: 'news.travel',       url: '/api/travelnews',   accent: 'text-sky-400',     border: 'border-sky-400' },
  { key: 'env',      emoji: '🌿', tKey: 'news.nature',       url: '/api/envinews',     accent: 'text-lime-400',    border: 'border-lime-400' },
  { key: 'music',    emoji: '🎵', tKey: 'news.music',        url: '/api/musicnews',    accent: 'text-rose-400',    border: 'border-rose-400' },
  { key: 'food',     emoji: '🍕', tKey: 'news.food',         url: '/api/foodnews',     accent: 'text-amber-400',   border: 'border-amber-400' },
  { key: 'edu',      emoji: '📚', tKey: 'news.education',    url: '/api/edunews',      accent: 'text-indigo-400',  border: 'border-indigo-400' },
  { key: 'history',  emoji: '📜', tKey: 'news.history',      url: '/api/historynews',  accent: 'text-amber-400',   border: 'border-amber-400' },
  { key: 'tech',     emoji: '🔥', tKey: 'Tech',              url: '/api/hacknews',     accent: 'text-red-400',     border: 'border-red-400', isHN: true },
] as const

type TabKey = (typeof TABS)[number]['key']

function formatDate(raw: string | undefined): string {
  if (!raw) return ''
  try {
    return new Date(raw).toLocaleString('sk-SK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function NewsItems({ items, accentClass }: { items: NewsItem[]; accentClass: string }) {
  return (
    <div className="divide-y divide-white/[0.04]">
      {items.map((item, i) => (
        <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-baseline gap-2 py-1 group hover:bg-white/[0.02] px-1 -mx-1 rounded transition-colors">
          <span className={`text-[9px] font-bold shrink-0 w-14 truncate ${accentClass} opacity-60`}>{item.source}</span>
          <span className="text-[11px] text-slate-200 group-hover:text-white leading-snug line-clamp-1 flex-1">{item.title}</span>
          {item.pubDate && <span className="text-[9px] text-slate-600 shrink-0 tabular-nums">{formatDate(item.pubDate)}</span>}
        </a>
      ))}
    </div>
  )
}

function HNItems({ items }: { items: HNItem[] }) {
  return (
    <div className="space-y-0.5">
      {items.map((item, i) => (
        <a
          key={item.id}
          href={item.url ?? `https://news.ycombinator.com/item?id=${item.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="news-item flex items-start gap-2 py-1 group"
        >
          <span className="text-[11px] text-slate-600 font-mono w-5 shrink-0 mt-0.5">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-200 group-hover:text-white leading-snug line-clamp-2 transition-colors">
              {item.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-red-400/80 font-semibold">▲ {item.score}</span>
              <span className="text-[10px] text-slate-600">{item.by} · {relativeTime(item.time)}</span>
              {item.descendants != null && (
                <span className="text-[10px] text-slate-600">💬 {item.descendants}</span>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}

function TabContent({ tabKey, isHN }: { tabKey: TabKey; isHN?: boolean }) {
  const { t } = useLang()
  const tab = TABS.find((tb) => tb.key === tabKey)!
  const newsState = useWidget<NewsResponse>(tab.url, 5 * 60 * 1000)
  const hnState   = useWidget<HNResponse>(tab.url, 5 * 60 * 1000)

  if (isHN) {
    if (hnState.loading) return <SkeletonRows rows={8} cols={2} />
    if (hnState.error || !hnState.data) return <p className="text-slate-500 text-sm py-4">{t('error')}</p>
    return <HNItems items={hnState.data.items} />
  }

  if (newsState.loading) return <SkeletonRows rows={8} />
  if (newsState.error || !newsState.data) return <p className="text-slate-500 text-sm py-4">{t('error')}</p>
  return <NewsItems items={newsState.data.items} accentClass={tab.accent} />
}

export default function NewsFeedWidget() {
  const { t } = useLang()
  const [active, setActive] = useState<TabKey>('sk')
  const activeTab = TABS.find((tb) => tb.key === active)!

  const tabLabel = (tab: typeof TABS[number]) => {
    const label = tab.tKey.includes('.') ? t(tab.tKey) : tab.tKey
    return `${tab.emoji} ${label}`
  }

  return (
    <WidgetCard className="h-full" accent="none">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {TABS.map((tab) => {
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? `bg-white/8 ${tab.accent} border ${tab.border}/40`
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'
              }`}
            >
              {tabLabel(tab)}
            </button>
          )
        })}
      </div>

      {/* Content – render all tabs but only show active (avoids refetch on switch) */}
      <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
        {TABS.map((tab) => (
          <div key={tab.key} className={active === tab.key ? 'block' : 'hidden'}>
            <TabContent tabKey={tab.key} isHN={'isHN' in tab ? tab.isHN : false} />
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
