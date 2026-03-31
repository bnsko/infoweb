'use client'

import { useWidget } from '@/hooks/useWidget'
import type { CurrencyResponse } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

export default function CurrencyWidget() {
  const { t } = useLang()
  const { data, loading, error, refetch } = useWidget<CurrencyResponse>('/api/currency', 60 * 60 * 1000)

  if (loading) return (
    <WidgetCard accent="green" title={t('currency.title')} icon="💱" onRefresh={refetch}>
      <SkeletonRows rows={5} cols={2} />
    </WidgetCard>
  )
  if (error || !data) return (
    <WidgetCard accent="green" title={t('currency.title')} icon="💱" onRefresh={refetch}>
      <WidgetError />
    </WidgetCard>
  )

  return (
    <WidgetCard accent="green" title={t('currency.title')} icon="💱" onRefresh={refetch}>
      <div className="space-y-1">
        {data.rates.map((r) => (
          <div key={r.code} className="flex items-center justify-between py-1 border-b border-white/4 last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-base">{r.flag}</span>
              <div>
                <span className="text-xs font-semibold text-slate-200">{r.code}</span>
                <span className="hidden sm:inline text-[10px] text-slate-500 ml-1.5">{r.name}</span>
              </div>
            </div>
            <div className="text-sm font-mono font-semibold text-green-300">
              {r.rate != null ? r.rate.toFixed(
                r.code === 'VND' || r.code === 'IDR' ? 0 :
                r.code === 'HUF' || r.code === 'CZK' || r.code === 'JPY' || r.code === 'THB' || r.code === 'RSD' || r.code.endsWith('K') ? 2 : 4
              ) : '—'}
            </div>
          </div>
        ))}
      </div>
      {data.date && (
        <p className="text-[10px] text-slate-600 mt-2 text-right">ECB · {data.date}</p>
      )}
    </WidgetCard>
  )
}
