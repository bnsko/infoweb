'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

interface RedditGlobalPost {
  id: string; title: string; subreddit: string; permalink: string
  score: number; numComments: number; author: string; createdUtc: number; thumbnail: string | null
}
interface RedditGlobalData { posts: RedditGlobalPost[] }

function formatScore(n: number): string {
  if (n >= 100000) return `${(n / 1000).toFixed(0)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

const RANK_COLOR = ['text-amber-400', 'text-slate-300', 'text-amber-600']

export default function RedditGlobalWidget() {
  const { t } = useLang()
  const { data, loading, error, refetch } = useWidget<RedditGlobalData>('/api/redditglobal', 5 * 60 * 1000)
  const posts = data?.posts ?? []
  const maxScore = posts.length ? Math.max(...posts.map(p => p.score)) : 1

  return (
    <WidgetCard accent="orange" title={t('reddit.globalTitle')} icon="📈" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} />}
      {!loading && (error || !data) && <p className="text-xs text-slate-500">{t('error')}</p>}
      {!loading && posts.length === 0 && <p className="text-xs text-slate-500 py-4 text-center">Žiadne príspevky</p>}
      {!loading && posts.length > 0 && (
        <div className="space-y-0.5 max-h-[380px] overflow-y-auto pr-1">
          {posts.map((post, i) => (
            <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer"
              className="group flex items-start gap-2.5 px-2 py-2 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/6 transition-all">
              {/* Rank */}
              <div className="shrink-0 w-8 text-center">
                <span className={`text-[11px] font-bold ${RANK_COLOR[i] ?? 'text-slate-600'}`}>{i + 1}</span>
                <div className="text-[10px] font-bold text-orange-300 mt-0.5 tabular-nums">{formatScore(post.score)}</div>
                <div className="text-[7px] text-slate-600">▲</div>
                {/* Score bar */}
                <div className="w-full h-0.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-orange-400/30 rounded-full" style={{ width: `${Math.min(100, (post.score / maxScore) * 100)}%` }} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-200 group-hover:text-white leading-snug line-clamp-2 transition-colors font-medium">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[8px] bg-orange-500/10 text-orange-300/70 px-1.5 py-0.5 rounded-full font-semibold">{post.subreddit}</span>
                  <span className="flex items-center gap-0.5 text-[8px] text-slate-500">
                    💬 <span className="tabular-nums text-slate-400 font-semibold">{formatScore(post.numComments)}</span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      <p className="text-[9px] text-slate-600 mt-2">reddit.com/r/all · {t('reddit.topToday')}</p>
    </WidgetCard>
  )
}

