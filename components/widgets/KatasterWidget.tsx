'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Transfer {
  type: string; area: string; property: string; price: number; size: number; pricePerM2: number; date: string
}
interface PriceStats { avgPriceBA: number; avgPriceKE: number; avgPriceSK: number; changeYoY: number; totalTransactions: number; avgMortgageRate: number }
interface KatasterData { transfers: Transfer[]; priceStats: PriceStats; interestingFacts: string[]; timestamp: number }

export default function KatasterWidget() {
  const { data, loading, refetch } = useWidget<KatasterData>('/api/kataster', 24 * 60 * 60 * 1000)

  return (
    <WidgetCard accent="yellow" title="Kataster – Nehnuteľnosti" icon="🏠" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} />}
      {!loading && data && (
        <div className="space-y-3">
          {/* Price stats */}
          <div className="grid grid-cols-3 gap-1">
            <div className="text-center px-1 py-1.5 rounded-lg bg-yellow-500/[0.06] border border-yellow-500/10">
              <div className="text-[12px] font-bold text-yellow-400">{data.priceStats.avgPriceBA.toLocaleString('sk-SK')} €</div>
              <div className="text-[7px] text-slate-500">Ø m² BA</div>
            </div>
            <div className="text-center px-1 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[12px] font-bold text-blue-400">{data.priceStats.avgPriceKE.toLocaleString('sk-SK')} €</div>
              <div className="text-[7px] text-slate-500">Ø m² KE</div>
            </div>
            <div className="text-center px-1 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[12px] font-bold text-emerald-400">+{data.priceStats.changeYoY}%</div>
              <div className="text-[7px] text-slate-500">MeR zmena</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[8px] text-slate-500 px-1">
            <span>🏦 Hypo: {data.priceStats.avgMortgageRate}% p.a.</span>
            <span>📊 {data.priceStats.totalTransactions.toLocaleString('sk-SK')} transakcií/mes</span>
          </div>

          {/* Interesting facts */}
          <div className="space-y-0.5">
            {data.interestingFacts.slice(0, 3).map((f, i) => (
              <div key={i} className="flex items-start gap-1.5 px-2 py-1 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[9px] mt-0.5">💡</span>
                <span className="text-[9px] text-slate-300">{f}</span>
              </div>
            ))}
          </div>

          {/* Recent transfers */}
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1">📝 Posledné prevody</div>
            <div className="space-y-0.5 max-h-[180px] overflow-y-auto scrollbar-hide">
              {data.transfers.slice(0, 6).map((t, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <span className={`text-[7px] px-1.5 py-0.5 rounded ${t.type === 'Predaj' ? 'bg-green-500/15 text-green-300' : 'bg-blue-500/15 text-blue-300'} font-bold`}>{t.type}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-200 truncate">{t.property}</div>
                    <div className="text-[8px] text-slate-500">{t.area} · {t.size} m² · {t.date}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-bold text-amber-400">{t.price.toLocaleString('sk-SK')} €</div>
                    <div className="text-[7px] text-slate-600">{t.pricePerM2.toLocaleString('sk-SK')} €/m²</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">Katasterportál · Simulácia</p>
    </WidgetCard>
  )
}
