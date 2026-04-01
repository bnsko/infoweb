'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'

interface Material {
  name: string
  unit: string
  price: number
  trend: number
  category: string
}

interface ConstructionIndex {
  currentValue: number
  baseYear: number
  yearOnYearPct: number
  monthOnMonthPct: number
  trend: string
  source: string
}

interface ConstructionPricesData {
  materials: Material[]
  index: ConstructionIndex
  lastUpdated: string
  source: string
}

const CATEGORY_ICON: Record<string, string> = {
  murivo: '🧱', drevo: '🪵', omietky: '🪣', izolácia: '🌡️',
  dlažba: '🔲', inštalácie: '💧', elektro: '⚡', strecha: '🏠', beton: '🏗️',
}

export default function ConstructionPricesWidget() {
  const { data, loading, refetch } = useWidget<ConstructionPricesData>('/api/construction-prices', 3600 * 1000)

  return (
    <WidgetCard accent="yellow" title="Ceny stavebného materiálu" icon="🏗️" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-slate-700/30 rounded-xl px-3 py-2.5">
            <div>
              <div className="text-[10px] text-slate-500">Index cien stavby ({data.index.baseYear}=100)</div>
              <div className="text-xl font-bold text-white">{data.index.currentValue}</div>
            </div>
            <div className="ml-auto text-right">
              <div className={`text-sm font-bold ${data.index.yearOnYearPct >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {data.index.yearOnYearPct > 0 ? '+' : ''}{data.index.yearOnYearPct}%
              </div>
              <div className="text-[9px] text-slate-500">rok/rok</div>
            </div>
          </div>

          <div className="space-y-1">
            {data.materials.map(m => (
              <div key={m.name} className="flex items-center gap-2 bg-slate-700/30 rounded-lg px-2.5 py-2">
                <span className="text-sm shrink-0">{CATEGORY_ICON[m.category] ?? '📦'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-200 truncate">{m.name}</div>
                  <div className="text-[9px] text-slate-500">{m.unit}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] font-bold text-white">{m.price} €</div>
                  <div className={`text-[10px] font-medium ${m.trend > 0 ? 'text-red-400' : m.trend < 0 ? 'text-green-400' : 'text-slate-500'}`}>
                    {m.trend > 0 ? '↑' : m.trend < 0 ? '↓' : '→'} {Math.abs(m.trend)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[9px] text-slate-600 text-right">{data.source}</div>
        </div>
      )}
    </WidgetCard>
  )
}
