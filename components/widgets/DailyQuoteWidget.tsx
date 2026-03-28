'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

interface QuoteData {
  quote: { text: string; author: string; category: string }
  fact: { text: string; emoji: string; category: string }
}

export default function DailyQuoteWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<QuoteData>('/api/daily-quote', 60 * 60 * 1000)

  return (
    <WidgetCard accent="purple" title={lang === 'sk' ? 'Denný citát & Fakt' : 'Daily Quote & Fact'} icon="💬" onRefresh={refetch}>
      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-20 rounded-xl" />
          <div className="skeleton h-12 rounded-xl" />
        </div>
      ) : data ? (
        <div className="space-y-3">
          {/* Quote */}
          <div className="relative bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/15 rounded-xl p-4">
            <span className="absolute top-2 left-3 text-3xl text-purple-500/20 font-serif leading-none">"</span>
            <p className="text-[12px] text-slate-200 leading-relaxed italic pl-4 pr-2">
              {data.quote.text}
            </p>
            <div className="flex items-center justify-between mt-2 pl-4">
              <span className="text-[10px] text-purple-400 font-semibold">— {data.quote.author}</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-white/5">
                {data.quote.category}
              </span>
            </div>
          </div>

          {/* Random Fact */}
          <div className="bg-gradient-to-r from-amber-500/8 via-orange-500/5 to-transparent border border-amber-500/15 rounded-xl p-3 flex items-start gap-2">
            <span className="text-xl shrink-0">{data.fact.emoji}</span>
            <div>
              <div className="text-[9px] text-amber-400/70 font-bold uppercase tracking-wider mb-1">
                {lang === 'sk' ? 'Vedeli ste?' : 'Did you know?'}
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">{data.fact.text}</p>
            </div>
          </div>
        </div>
      ) : null}
    </WidgetCard>
  )
}
