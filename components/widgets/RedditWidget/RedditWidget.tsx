'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { relativeTime } from '@/lib/utils'
import type { RedditResponse } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

const SORT_KEYS = [
  { key: 'hot',  emoji: '🔥', label: 'Hot' },
  { key: 'new',  emoji: '🆕', label: 'Nové' },
  { key: 'best', emoji: '⭐', label: 'Best' },
  { key: 'top',  emoji: '📈', label: 'Top' },
] as const

type Sort = (typeof SORT_KEYS)[number]['key']

function formatScore(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.min(100, max > 0 ? (score / max) * 100 : 0)
  return (
    <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden mt-1">
      <div className="h-full rounded-full bg-gradient-to-r from-orange-500/60 to-orange-400/30 transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function RedditWidget() {
  const { t } = useLang()
  const [sort, setSort] = useState<Sort>('hot')
  const { data, loading, error, refetch } = useWidget<RedditResponse>(
    `/api/reddit?sort=${sort}`,
    5 * 60 * 1000
  )

  const posts = data?.posts ?? []
  const maxScore = posts.length ? Math.max(...posts.map(p => p.score)) : 1

  return (
    <WidgetCard accent="orange" className="h-full" onRefresh={refetch}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🟠</span>
          <div>
            <div className="text-[12px] font-bold text-white">r/Slovakia</div>
            <div className="text-[8px] text-slate-500">reddit.com</div>
          </div>
          {!loading && posts.length > 0 && (
            <span className="text-[8px] bg-orange-500/10 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/15 font-bold">{posts.length} príspevkov</span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {SORT_KEYS.map((s) => (
            <button key={s.key} onClick={() => setSort(s.key)}
              className={`text-[9px] font-semibold px-2 py-1 rounded-lg transition-all ${
                sort === s.key
                  ? 'bg-orange-500/18 text-orange-300 border border-orange-500/25'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/4 border border-transparent'
              }`}>
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <SkeletonRows rows={8} />}
      {!loading && (error || !data) && <WidgetError />}
      {!loading && data && posts.length === 0 && (
        <p className="text-sm text-slate-500 py-4 text-center">Žiadne príspevky</p>
      )}
      {!loading && posts.length > 0 && (
        <div className="space-y-0.5 max-h-[440px] overflow-y-auto pr-1">
          {posts.slice(0, 20).map((post, i) => (
            <a key={post.id} href={post.permalink} target="_blank" rel="noopener noreferrer"
              className="group flex items-start gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/6 transition-all">
              {/* Rank + score */}
              <div className="shrink-0 w-10 text-center">
                <div className={`text-[10px] font-bold ${i < 3 ? 'text-orange-400' : 'text-slate-600'}`}>{i + 1}</div>
                <div className="text-[11px] font-bold text-orange-300 mt-0.5 tabular-nums">{formatScore(post.score)}</div>
                <div className="text-[8px] text-slate-600">▲</div>
                <ScoreBar score={post.score} max={maxScore} />
              </div>
              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-200 group-hover:text-white leading-snug line-clamp-2 transition-colors font-medium">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {post.flair && (
                    <span className="text-[8px] bg-orange-500/12 text-orange-300 px-1.5 py-0.5 rounded-full border border-orange-500/18 font-medium">
                      {post.flair}
                    </span>
                  )}
                  <span className="text-[8px] text-slate-600">u/{post.author}</span>
                  <span className="text-[8px] text-slate-700">·</span>
                  <span className="text-[8px] text-slate-600">{relativeTime(post.createdUtc)}</span>
                  <span className="text-[8px] text-slate-700">·</span>
                  <span className="flex items-center gap-0.5 text-[8px] text-slate-500">
                    <span>💬</span>
                    <span className="tabular-nums font-semibold text-slate-400">{formatScore(post.numComments)}</span>
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      <p className="text-[9px] text-slate-600 mt-2">reddit.com/r/Slovakia · {t('reddit.source')}</p>
    </WidgetCard>
  )
}

