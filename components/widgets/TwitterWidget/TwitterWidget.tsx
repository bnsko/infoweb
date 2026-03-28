'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface Tweet {
  author: string
  handle: string
  text: string
  url: string
  time: string
  likes: number
  retweets: number
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function timeAgo(iso: string, lang: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return lang === 'sk' ? `${Math.floor(diff / 86400)}d` : `${Math.floor(diff / 86400)}d`
  } catch { return '' }
}

export default function TwitterWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<{ tweets: Tweet[]; source: string }>('/api/twitter', 10 * 60 * 1000)

  return (
    <WidgetCard accent="blue" title="𝕏 / Twitter" icon="" onRefresh={refetch}>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-hide">
          {(data?.tweets ?? []).map((tweet, i) => (
            <a key={i} href={tweet.url} target="_blank" rel="noopener noreferrer"
               className="block group rounded-xl p-3 border border-white/5 hover:border-sky-500/20 hover:bg-sky-500/5 transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-sky-500/10 flex items-center justify-center text-[11px] font-bold text-sky-400">
                  {tweet.author[0]?.toUpperCase()}
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-200">{tweet.author}</span>
                  <span className="text-[10px] text-slate-500 ml-1">{tweet.handle}</span>
                </div>
                <span className="ml-auto text-[10px] text-slate-600">{timeAgo(tweet.time, lang)}</span>
              </div>
              <p className="text-[12px] text-slate-300 leading-relaxed line-clamp-3">{tweet.text}</p>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1 hover:text-red-400 transition-colors">
                  ❤️ {formatNum(tweet.likes)}
                </span>
                <span className="flex items-center gap-1 hover:text-green-400 transition-colors">
                  🔁 {formatNum(tweet.retweets)}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
      {data?.source === 'curated' && (
        <p className="text-[9px] text-slate-600 mt-2 text-center italic">
          {lang === 'sk' ? 'Kurátorský výber (X API vyžaduje platený prístup)' : 'Curated selection (X API requires paid access)'}
        </p>
      )}
    </WidgetCard>
  )
}
