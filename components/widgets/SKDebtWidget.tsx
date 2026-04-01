'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useEffect, useState } from 'react'

interface SKDebtData {
  baseDebt: number
  perSecondIncrease: number
  perPersonDebt: number
  gdpPct: number
  gdpEur: number
  population: number
  lastUpdated: string
}

function formatBillion(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' mld. €'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' mil. €'
  return n.toFixed(0) + ' €'
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n)
}

export default function SKDebtWidget() {
  const { data, loading, refetch } = useWidget<SKDebtData>('/api/sk-debt', 3600 * 1000)
  const [liveDebt, setLiveDebt] = useState<number | null>(null)

  useEffect(() => {
    if (!data) return
    const base = data.baseDebt
    const pps = data.perSecondIncrease
    const apiTime = new Date(data.lastUpdated).getTime()

    const update = () => {
      const elapsed = (Date.now() - apiTime) / 1000
      setLiveDebt(base + pps * elapsed)
    }
    update()
    const id = setInterval(update, 250)
    return () => clearInterval(id)
  }, [data])

  const display = liveDebt ?? data?.baseDebt ?? 0

  return (
    <WidgetCard accent="rose" title="Dlh Slovenska" icon="📉" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-8 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="text-center py-3 bg-slate-700/30 rounded-xl">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Aktuálny štátny dlh</div>
            <div className="text-2xl font-mono font-bold text-red-400 tabular-nums">
              {formatCurrency(display)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">rastie {formatCurrency(data.perSecondIncrease)}/sek</div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Na osobu', value: formatCurrency(data.perPersonDebt), icon: '👤' },
              { label: 'k HDP', value: data.gdpPct.toFixed(1) + ' %', icon: '📊' },
              { label: 'HDP SR', value: formatBillion(data.gdpEur * 1e9), icon: '🏭' },
            ].map(s => (
              <div key={s.label} className="bg-slate-700/40 rounded-lg p-2 text-center">
                <div className="text-base">{s.icon}</div>
                <div className="text-[11px] font-bold text-white">{s.value}</div>
                <div className="text-[9px] text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="text-[9px] text-slate-600 text-right">
            <a href="https://www.mfsr.sk" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400">mfsr.sk · Eurostat</a>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
