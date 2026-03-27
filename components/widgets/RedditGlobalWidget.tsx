'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface RedditGlobalPost {
  id: string
  title: string
  subreddit: string
  permalink: string
  score: number
  numComments: number
  author: string
  createdUtc: number
  thumbnail: string | null
}

interface RedditGlobalData {
  posts: RedditGlobalPost[]
}

function formatScore(n: number): string {
  if (n >= 100000) return `${(n / 1000).toFixed(0)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function RedditGlobalWidget() {
  const { data, loading, error, refetch } = useWidget<RedditGlobalData>('/api/redditglobal', 5 * 60 * 1000)

  return (
    <WidgetCard accent="orange" title="Reddit Top 10 dnes" icon="📈" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba načítania</p>}
      {!loading && data && (
        <div className="space-y-0.5 max-h-[380px] overflow-y-auto">
          {data.posts.map((post, i) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 py-1.5 px-1 rounded-lg hover:bg-white/4 transition-all group"
            >
              <div className="flex-shrink-0 w-6 text-center">
                <span className={`text-sm font-bold ${i < 3 ? 'text-orange-400' : 'text-slate-600'}`}>
                  {i + 1}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-200 group-hover:text-white leading-snug line-clamp-2 transition-colors">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-orange-400/70 font-semibold">▲ {formatScore(post.score)}</span>
                  <span className="text-[10px] text-slate-600">{post.subreddit}</span>
                  <span className="text-[10px] text-slate-600">💬 {formatScore(post.numComments)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">reddit.com/r/all · top dnes</p>
    </WidgetCard>
  )
}
