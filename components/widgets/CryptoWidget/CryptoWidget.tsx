'use client'

import { useWidget } from '@/hooks/useWidget'
import { formatPrice } from '@/lib/utils'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

interface CoinData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency?: number
  market_cap: number
  sparkline_in_7d?: { price: number[] }
}

function Sparkline({ prices, positive }: { prices: number[]; positive: boolean }) {
  if (!prices || prices.length < 2) return null
  // Downsample to ~40 points
  const step = Math.max(1, Math.floor(prices.length / 40))
  const pts = prices.filter((_, i) => i % step === 0)
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const range = max - min || 1
  const w = 120
  const h = 32
  const points = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * w
    const y = h - ((p - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const color = positive ? '#4ade80' : '#f87171'
  const gradId = `g-${positive ? 'p' : 'n'}`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#${gradId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatMcap(n: number): string {
  if (n >= 1e12) return `€${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `€${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `€${(n / 1e6).toFixed(0)}M`
  return `€${n}`
}

export default function CryptoWidget() {
  const { t } = useLang()
  const { data, loading, error, refetch } = useWidget<CoinData[]>('/api/crypto', 5 * 60 * 1000)

  if (loading) return (
    <WidgetCard accent="purple" title={t('crypto.title')} icon="₿" onRefresh={refetch}>
      <SkeletonRows rows={5} cols={2} />
    </WidgetCard>
  )
  if (error || !data || !Array.isArray(data)) return (
    <WidgetCard accent="purple" title={t('crypto.title')} icon="₿" onRefresh={refetch}>
      <WidgetError />
    </WidgetCard>
  )

  return (
    <WidgetCard accent="purple" title={t('crypto.title')} icon="₿" badge={data.length} onRefresh={refetch}>
      <div className="space-y-2">
        {data.map((coin) => {
          const change24 = coin.price_change_percentage_24h ?? 0
          const change7d = coin.price_change_percentage_7d_in_currency ?? 0
          const is24Pos = change24 >= 0
          const is7dPos = change7d >= 0
          const sparkPrices = coin.sparkline_in_7d?.price ?? []

          return (
            <div key={coin.id} className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5 hover:border-purple-500/20 transition-all">
              <div className="flex items-center gap-2 mb-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-white uppercase">{coin.symbol}</span>
                    <span className="text-[10px] text-slate-500">{coin.name}</span>
                  </div>
                  <span className="text-[9px] text-slate-600">{formatMcap(coin.market_cap)}</span>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-mono font-bold text-white">
                    {formatPrice(coin.current_price)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Sparkline prices={sparkPrices} positive={is7dPos} />
                <div className="flex gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[8px] text-slate-600 uppercase">24h</div>
                    <div className={`text-[11px] font-bold ${is24Pos ? 'text-green-400' : 'text-red-400'}`}>
                      {is24Pos ? '▲' : '▼'} {Math.abs(change24).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] text-slate-600 uppercase">7d</div>
                    <div className={`text-[11px] font-bold ${is7dPos ? 'text-green-400' : 'text-red-400'}`}>
                      {is7dPos ? '▲' : '▼'} {Math.abs(change7d).toFixed(2)}%
                    </div>
                  </div>
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
