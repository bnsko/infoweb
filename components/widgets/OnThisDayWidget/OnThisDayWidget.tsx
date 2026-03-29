'use client'

import { useMemo, useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import type { OnThisDayResponse } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

const SK_MONTHS = ['januára', 'februára', 'marca', 'apríla', 'mája', 'júna', 'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra']
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

type HistoryType = 'events' | 'births' | 'deaths' | 'selected'

const TABS: { key: HistoryType; emoji: string; sk: string; en: string }[] = [
  { key: 'selected', emoji: '⭐', sk: 'Zaujímavosti', en: 'Highlights' },
  { key: 'events', emoji: '📅', sk: 'Udalosti', en: 'Events' },
  { key: 'births', emoji: '👶', sk: 'Narodení', en: 'Births' },
  { key: 'deaths', emoji: '🕯️', sk: 'Úmrtia', en: 'Deaths' },
]

function yearsAgoLabel(year: number): string {
  const ago = new Date().getFullYear() - year
  if (ago === 0) return 'tento rok'
  return `pred ${ago} rokmi`
}

export default function OnThisDayWidget() {
  const { t, lang } = useLang()
  const [histType, setHistType] = useState<HistoryType>('selected')
  const { data, loading, error, refetch } = useWidget<OnThisDayResponse>(`/api/onthisday?type=${histType}`, 6 * 60 * 60 * 1000)
  const months = lang === 'sk' ? SK_MONTHS : EN_MONTHS

  const dateLabel = useMemo(() => {
    if (!data) return ''
    return `${data.day}. ${months[data.month - 1]}`
  }, [data, months])

  return (
    <WidgetCard accent="cyan" title={t('onthisday.title')} icon="📖" className="h-full" onRefresh={refetch}>
      {dateLabel && (
        <div className="text-[11px] text-cyan-400/70 font-semibold mb-2 -mt-1">{dateLabel}</div>
      )}

      {/* Type tabs */}
      <div className="flex gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setHistType(tb.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              histType === tb.key
                ? 'bg-cyan-500/15 text-cyan-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{tb.emoji}</span>
            <span>{lang === 'sk' ? tb.sk : tb.en}</span>
          </button>
        ))}
      </div>

      {loading && <SkeletonRows rows={6} />}
      {!loading && (error || !data) && <WidgetError />}
      {!loading && data && (
        <div className="space-y-1.5 max-h-[380px] overflow-y-auto scrollbar-hide">
          {data.events.map((ev, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-white/[0.03] transition-colors group">
              <div className="flex-shrink-0 text-center min-w-[48px]">
                <div className="text-[13px] font-black text-cyan-400 tabular-nums leading-none">{ev.year}</div>
                <div className="text-[8px] text-slate-600 mt-0.5">{yearsAgoLabel(ev.year)}</div>
              </div>
              <div className="flex-1 min-w-0 border-l-2 border-cyan-500/10 pl-2.5">
                {ev.pageUrl ? (
                  <a href={ev.pageUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-slate-300 group-hover:text-white transition-colors leading-snug line-clamp-3">
                    {ev.text}
                  </a>
                ) : (
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-3">{ev.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[9px] text-slate-600 mt-2">{t('onthisday.source')}</p>
    </WidgetCard>
  )
}
