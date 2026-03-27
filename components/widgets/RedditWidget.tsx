'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { relativeTime } from '@/lib/utils'
import type { RedditResponse } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'

const SORTS = [
  { key: 'hot',  label: '🔥 Hot' },
  { key: 'new',  label: '🆕 Nové' },
  { key: 'best', label: '⭐ Best' },
  { key: 'top',  label: '📈 Top' },
] as const

type Sort = (typeof SORTS)[number]['key']

function RefreshBtn({ onClick }: { onClick: () => void }) {
  const [spinning, setSpinning] = useState(false)
  return (
    <button
      onClick={() => { setSpinning(true); onClick(); setTimeout(() => setSpinning(false), 800) }}
      className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
      title="Obnoviť"
    >
      <svg className={`w-3.5 h-3.5 ${spinning ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  )
}

function formatScore(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export default function RedditWidget() {
  const [sort, setSort] = useState<Sort>('hot')
  const { data, loading, error, refetch } = useWidget<RedditResponse>(
    `/api/reddit?sort=${sort}`,
    5 * 60 * 1000
  )

  return (
    <WidgetCard accent="orange" className="h-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="widget-title mb-0">
          <span>🟠</span>
          <span>r/Slovakia</span>
        </div>
        <div className="flex items-center gap-1">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition-all ${
                sort === s.key
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'
              }`}
            >
              {s.label}
            </button>
          ))}
          <RefreshBtn onClick={refetch} />
        </div>
      </div>

      {loading && <SkeletonRows rows={7} />}
      {!loading && (error || !data) && <WidgetError />}
      {!loading && data && data.posts.length === 0 && (
        <p className="text-sm text-slate-500 py-4 text-center">Žiadne príspevky k dispozícii</p>
      )}
      {!loading && data && data.posts.length > 0 && (
        <div className="space-y-0.5 max-h-[440px] overflow-y-auto">
          {data.posts.slice(0, 20).map((post, i) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="news-item flex items-start gap-3 py-1.5 group"
            >
              {/* Score */}
              <div className="flex-shrink-0 w-8 text-center">
                <div className="text-[11px] font-bold text-orange-400">{formatScore(post.score)}</div>
                <div className="text-[9px] text-slate-600">▲</div>
              </div>
              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200 group-hover:text-white leading-snug line-clamp-2 transition-colors">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {post.flair && (
                    <span className="text-[10px] bg-orange-500/15 text-orange-300 px-1.5 py-0.5 rounded-full border border-orange-500/20 font-medium">
                      {post.flair}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-600">
                    u/{post.author} · {relativeTime(post.createdUtc)}
                  </span>
                  <span className="text-[10px] text-slate-600">💬 {post.numComments}</span>
                </div>
              </div>
              {/* Rank */}
              <span className="flex-shrink-0 text-[10px] text-slate-700 font-mono">{i + 1}</span>
            </a>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">reddit.com/r/Slovakia · obnova 5 min</p>
    </WidgetCard>
  )
}
