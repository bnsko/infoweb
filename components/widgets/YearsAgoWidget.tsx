'use client'

import { useLang } from '@/hooks/useLang'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface WikiEvent {
  year: number
  text: string
  pageTitle: string | null
  pageUrl: string | null
}

interface YearsAgoMatch {
  yearsAgo: number
  year: number
  events: WikiEvent[]
}

interface YearsAgoResponse {
  matches: YearsAgoMatch[]
  month: number
  day: number
}

function yearsAgoLabel(y: number): string {
  if (y === 1) return 'pred rokom'
  return `pred ${y} rokmi`
}

export default function YearsAgoWidget() {
  const { lang } = useLang()
  const { data, loading, error } = useWidget<YearsAgoResponse>('/api/yearsago', 6 * 60 * 60 * 1000)

  const matches = data?.matches ?? []

  return (
    <WidgetCard
      accent="purple"
      title={lang === 'sk' ? 'Pred X rokmi' : 'Years Ago'}
      icon="⏳"
    >
      {loading && <SkeletonRows rows={5} />}
      {!loading && (error || !data) && <WidgetError />}
      {!loading && data && matches.length === 0 && (
        <p className="text-slate-500 text-xs text-center py-4">Žiadne udalosti</p>
      )}
      {!loading && data && (
        <div className="space-y-1 max-h-[340px] overflow-y-auto scrollbar-hide">
          {matches.map(m => (
            <div key={m.yearsAgo} className="rounded-lg border border-white/5 bg-white/[0.02] p-2 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-black text-purple-400 tabular-nums">{m.year}</span>
                <span className="text-[9px] bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded font-semibold uppercase">
                  {yearsAgoLabel(m.yearsAgo)}
                </span>
              </div>
              <div className="space-y-1">
                {m.events.map((ev, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-snug">
                    <span className="text-purple-400/50 mt-0.5 shrink-0">•</span>
                    <span>{ev.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
