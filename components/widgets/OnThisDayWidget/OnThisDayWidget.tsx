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

type HistoryType = 'events' | 'births' | 'deaths' | 'selected' | 'holidays'

const TABS: { key: HistoryType; emoji: string; sk: string; en: string }[] = [
  { key: 'events', emoji: '📅', sk: 'Udalosti', en: 'Events' },
  { key: 'births', emoji: '👶', sk: 'Narodení', en: 'Births' },
  { key: 'deaths', emoji: '🕯️', sk: 'Úmrtia', en: 'Deaths' },
  { key: 'selected', emoji: '⭐', sk: 'Zaujímavosti', en: 'Highlights' },
  { key: 'holidays', emoji: '🎉', sk: 'Sviatky', en: 'Holidays' },
]

export default function OnThisDayWidget() {
  const { t, lang } = useLang()
  const [histType, setHistType] = useState<HistoryType>('events')
  const { data, loading, error, refetch } = useWidget<OnThisDayResponse>(`/api/onthisday?type=${histType}`, 6 * 60 * 60 * 1000)
  const months = lang === 'sk' ? SK_MONTHS : EN_MONTHS

  const dateLabel = useMemo(() => {
    if (!data) return ''
    return `${data.day}. ${months[data.month - 1]}`
  }, [data, months])

  return (
    <WidgetCard accent="cyan" title={t('onthisday.title')} icon="📖" className="h-full" onRefresh={refetch}>
      {dateLabel && (
        <div className="text-xs text-slate-500 mb-2 -mt-1">{t('onthisday.onThisDay')} {dateLabel}</div>
      )}

      {/* Type tabs */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto scrollbar-hide">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setHistType(tb.key)}
            className={`flex items-center gap-1 shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
              histType === tb.key
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'
            }`}>
            <span>{tb.emoji}</span>
            <span>{lang === 'sk' ? tb.sk : tb.en}</span>
          </button>
        ))}
      </div>

      {loading && <SkeletonRows rows={6} />}
      {!loading && (error || !data) && <WidgetError />}
      {!loading && data && (
        <div className="space-y-2 max-h-[380px] overflow-y-auto scrollbar-hide">
          {data.events.map((ev, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 text-center min-w-[42px]">
                <div className="text-sm font-bold text-cyan-400 leading-none">{ev.year}</div>
                <div className="text-[10px] text-slate-600">{new Date().getFullYear() - ev.year} {t('onthisday.yearsAgo')}</div>
              </div>
              <div className="flex-1 border-l border-white/5 pl-3 min-w-0">
                {ev.pageUrl ? (
                  <a
                    href={ev.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-200 hover:text-white transition-colors leading-snug line-clamp-3 cursor-pointer"
                  >
                    {ev.text}
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 leading-snug line-clamp-3">{ev.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">{t('onthisday.source')}</p>
    </WidgetCard>
  )
}
