'use client'

import { useWidget } from '@/hooks/useWidget'
import { formatPrice } from '@/lib/utils'
import type { CryptoAsset } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

export default function CryptoWidget() {
  const { t } = useLang()
  const { data, loading, error, refetch } = useWidget<CryptoAsset[]>('/api/crypto', 5 * 60 * 1000)

  if (loading) return (
    <WidgetCard accent="purple" title={t('crypto.title')} icon="₿" onRefresh={refetch}>
      <SkeletonRows rows={5} cols={2} />
    </WidgetCard>
  )
  if (error || !data) return (
    <WidgetCard accent="purple" title={t('crypto.title')} icon="₿" onRefresh={refetch}>
      <WidgetError />
    </WidgetCard>
  )

  return (
    <WidgetCard accent="purple" title={t('crypto.title')} icon="₿" onRefresh={refetch}>
      <div className="space-y-1">
        {data.map((coin) => {
          const change = coin.price_change_percentage_24h
          const isPositive = change >= 0
          return (
            <div key={coin.id} className="flex items-center justify-between py-1 border-b border-white/4 last:border-0">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 uppercase">{coin.symbol}</span>
                  <span className="hidden sm:inline text-[10px] text-slate-500 ml-1.5">{coin.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-semibold text-slate-200">
                  {formatPrice(coin.current_price)}
                </div>
                <div className={`text-[10px] font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-slate-600 mt-2 text-right">{t('crypto.source')}</p>
    </WidgetCard>
  )
}
