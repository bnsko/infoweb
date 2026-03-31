'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Rate {
  currency: string
  buy: number
  sell: number
  mid: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

interface VUBData {
  rates: Rate[]
  bank: string
  validFrom: string
  timestamp: number
}

const FLAGS: Record<string, string> = {
  USD: '🇺🇸', GBP: '🇬🇧', CHF: '🇨🇭', CZK: '🇨🇿', PLN: '🇵🇱',
  HUF: '🇭🇺', JPY: '🇯🇵', CAD: '🇨🇦', AUD: '🇦🇺', SEK: '🇸🇪',
  NOK: '🇳🇴', DKK: '🇩🇰', HRK: '🇭🇷', RON: '🇷🇴', BGN: '🇧🇬',
  TRY: '🇹🇷', RSD: '🇷🇸', THB: '🇹🇭',
}

export default function VUBRatesWidget() {
  const { data, loading, refetch } = useWidget<VUBData>('/api/vubrates', 60 * 60 * 1000)

  const decimals = (c: string) => ['JPY', 'HUF', 'CZK', 'RSD'].includes(c) ? 2 : 4

  return (
    <WidgetCard accent="orange" title="VÚB Kurzový lístok" icon="🏦" onRefresh={refetch}>
      {loading && <SkeletonRows rows={8} />}
      {!loading && data && (
        <div>
          <div className="flex items-center gap-2 text-[8px] text-slate-500 mb-2">
            <span>Platný od: {data.validFrom}</span>
          </div>

          {/* Header */}
          <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr_1fr] gap-1 px-2 mb-1 text-[7px] text-slate-600 uppercase tracking-wider font-bold">
            <span>Mena</span>
            <span className="text-right">Nákup</span>
            <span className="text-right">Stred</span>
            <span className="text-right">Predaj</span>
            <span className="text-right">Zmena</span>
          </div>

          <div className="space-y-0">
            {data.rates.map((r) => {
              const d = decimals(r.currency)
              return (
                <div
                  key={r.currency}
                  className="grid grid-cols-[2.5rem_1fr_1fr_1fr_1fr] gap-1 px-2 py-1 rounded hover:bg-white/[0.03] transition text-[10px]"
                >
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <span className="text-[10px]">{FLAGS[r.currency] || '🏳️'}</span>
                    <span className="text-[9px]">{r.currency}</span>
                  </span>
                  <span className="text-right font-mono text-emerald-400">{r.buy.toFixed(d)}</span>
                  <span className="text-right font-mono text-slate-400">{r.mid.toFixed(d)}</span>
                  <span className="text-right font-mono text-red-400">{r.sell.toFixed(d)}</span>
                  <span className={`text-right font-mono text-[9px] ${r.trend === 'up' ? 'text-emerald-400' : r.trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
                    {r.change > 0 ? '+' : ''}{r.change.toFixed(d)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">VÚB banka · Simulácia · 1h</p>
    </WidgetCard>
  )
}
