'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

interface FinanceItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
  region: 'EU' | 'US'
}

interface FinanceData {
  eu: FinanceItem[]
  us: FinanceItem[]
}

interface Tweet {
  author: string; handle: string; text: string; url: string; time: string; likes: number; retweets: number
}
interface TweetData { tweets: Tweet[] }

interface RedditPost {
  title: string; url: string; score: number; comments: number; subreddit: string; author: string; created: number
}
interface RedditData { posts: RedditPost[] }

function timeAgo(pubDate: string): string {
  if (!pubDate) return ''
  try {
    const diff = Math.floor((Date.now() - new Date(pubDate).getTime()) / 60000)
    if (diff < 1) return 'práve'
    if (diff < 60) return `${diff}m`
    if (diff < 1440) return `${Math.floor(diff / 60)}h`
    return `${Math.floor(diff / 1440)}d`
  } catch { return '' }
}

function tsAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000 - ts)
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

type Tab = 'eu' | 'us' | 'twitter' | 'reddit'

export default function FinanceNewsWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('eu')
  const { data, loading, refetch } = useWidget<FinanceData>('/api/bloomberg', 5 * 60 * 1000)
  const tweets = useWidget<TweetData>('/api/twitter', 10 * 60 * 1000)
  const reddit  = useWidget<RedditData>('/api/reddit-finance', 10 * 60 * 1000)

  const TAB_DEF = [
    { key: 'eu' as Tab,      icon: '🇪🇺', label: lang === 'sk' ? 'Európa' : 'Europe' },
    { key: 'us' as Tab,      icon: '🇺🇸', label: 'USA' },
    { key: 'twitter' as Tab, icon: '🐦', label: 'Twitter/X' },
    { key: 'reddit' as Tab,  icon: '🪐', label: 'Reddit' },
  ]

  const finItems = tab === 'eu' ? (data?.eu ?? []) : tab === 'us' ? (data?.us ?? []) : []
  const isLoading = (tab === 'eu' || tab === 'us') ? loading : tab === 'twitter' ? tweets.loading : reddit.loading

  return (
    <WidgetCard
      accent="green"
      title={lang === 'sk' ? 'Finančné správy' : 'Finance News'}
      icon="📈"
      badge={tab === 'eu' ? (data?.eu.length || undefined) : tab === 'us' ? (data?.us.length || undefined) : undefined}
      onRefresh={refetch}
    >
      {/* Tabs */}
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TAB_DEF.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === t.key ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonRows rows={5} />
      ) : (tab === 'eu' || tab === 'us') ? (
        finItems.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">{lang === 'sk' ? 'Žiadne správy' : 'No articles'}</p>
        ) : (
          <div className="space-y-0.5 max-h-[380px] overflow-y-auto scrollbar-hide">
            {finItems.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                 className="block group rounded-xl p-2.5 widget-item-hover transition-all">
                <div className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">📊</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-slate-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">{item.title}</p>
                    {item.description && <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-emerald-600 font-semibold">{item.source}</span>
                      {item.pubDate && <span className="text-[9px] text-slate-600">{timeAgo(item.pubDate)}</span>}
                    </div>
                  </div>
                  <span className="text-slate-700 group-hover:text-slate-500 transition-colors shrink-0 mt-0.5">↗</span>
                </div>
              </a>
            ))}
          </div>
        )
      ) : tab === 'twitter' ? (
        <div className="space-y-2 max-h-[380px] overflow-y-auto scrollbar-hide">
          {(tweets.data?.tweets ?? []).map((tw, i) => (
            <a key={i} href={tw.url} target="_blank" rel="noopener noreferrer"
               className="block group rounded-xl p-2.5 bg-white/[0.02] border border-white/5 hover:border-sky-500/15 hover:bg-white/[0.04] transition-all">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-sky-500/15 border border-sky-500/20 flex items-center justify-center text-xs font-bold text-sky-300 shrink-0">{tw.author.slice(0,1)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-semibold text-slate-200">{tw.author}</span>
                    <span className="text-[9px] text-slate-600">{tw.handle}</span>
                    <span className="text-[9px] text-slate-600 ml-auto">{timeAgo(tw.time)}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-3">{tw.text}</p>
                  <div className="flex items-center gap-3 mt-1 text-[9px] text-slate-600">
                    <span>❤️ {tw.likes.toLocaleString()}</span>
                    <span>🔁 {tw.retweets.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
          {!tweets.data?.tweets?.length && <p className="text-xs text-slate-500 text-center py-6">Žiadne tweety</p>}
        </div>
      ) : (
        <div className="space-y-0.5 max-h-[380px] overflow-y-auto scrollbar-hide">
          {(reddit.data?.posts ?? []).map((post, i) => (
            <a key={i} href={post.url} target="_blank" rel="noopener noreferrer"
               className="block group rounded-xl p-2 widget-item-hover transition-all">
              <div className="flex items-start gap-2">
                <span className="text-[10px] text-orange-400 font-bold w-5 text-center shrink-0 mt-0.5">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-200 leading-snug line-clamp-2 group-hover:text-white">{post.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-orange-500 font-semibold">r/{post.subreddit}</span>
                    <span className="text-[9px] text-slate-600">▲ {post.score}</span>
                    <span className="text-[9px] text-slate-600">💬 {post.comments}</span>
                    <span className="text-[9px] text-slate-600">{tsAgo(post.created)}</span>
                  </div>
                </div>
                <span className="text-slate-600 group-hover:text-slate-400 shrink-0">↗</span>
              </div>
            </a>
          ))}
          {!reddit.data?.posts?.length && <p className="text-xs text-slate-500 text-center py-6">Žiadne príspevky</p>}
        </div>
      )}
    </WidgetCard>
  )
}
