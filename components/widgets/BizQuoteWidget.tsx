'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Quote { quote: string; author: string; emoji: string }
interface QuoteData { todayQuote: Quote; timestamp: number }

export default function BizQuoteWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<QuoteData>('/api/bizquote', 60 * 60 * 1000)

  return (
    <WidgetCard accent="yellow" title={lang === 'sk' ? 'Motivácia dňa' : 'Daily Motivation'} icon="🌟" onRefresh={refetch}>
      {loading && <SkeletonRows rows={2} />}
      {!loading && data && (
        <div className="rounded-xl p-4 bg-gradient-to-br from-amber-500/[0.06] via-orange-500/[0.04] to-transparent border border-amber-500/10">
          <div className="text-center">
            <span className="text-2xl mb-2 block">{data.todayQuote.emoji}</span>
            <p className="text-[11px] text-slate-200 leading-relaxed italic">&ldquo;{data.todayQuote.quote}&rdquo;</p>
            <p className="text-[9px] text-amber-400 font-semibold mt-2">— {data.todayQuote.author}</p>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
