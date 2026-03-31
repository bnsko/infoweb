'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Company { name: string; ico: string; sector: string; revenue: number; profit: number; employees: number }
interface Stats { totalCompanies: number; newThisMonth: number; closedThisMonth: number; avgRevenue: string }
interface FinstatData { companies: Company[]; stats: Stats; timestamp: number }

function fmtEur(n: number): string {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + ' mld €'
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(0) + ' mil €'
  return n.toLocaleString('sk-SK') + ' €'
}

export default function FinstatWidget() {
  const { data, loading, refetch } = useWidget<FinstatData>('/api/finstat', 24 * 60 * 60 * 1000)

  return (
    <WidgetCard accent="green" title="Finstat – Firmy SR" icon="🏢" onRefresh={refetch}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && data && (
        <div className="space-y-3">
          {/* Stats overview */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="text-center px-2 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[14px] font-bold text-green-400">{data.stats.totalCompanies.toLocaleString('sk-SK')}</div>
              <div className="text-[7px] text-slate-500">Firiem celkom</div>
            </div>
            <div className="text-center px-2 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[14px] font-bold text-emerald-400">+{data.stats.newThisMonth}</div>
              <div className="text-[7px] text-slate-500">Nových tento mesiac</div>
            </div>
            <div className="text-center px-2 py-2 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[14px] font-bold text-red-400">-{data.stats.closedThisMonth}</div>
              <div className="text-[7px] text-slate-500">Zaniknutých</div>
            </div>
          </div>

          {/* Top companies */}
          <div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">🏆 Top firmy podľa tržieb</div>
            <div className="space-y-0.5 max-h-[240px] overflow-y-auto scrollbar-hide">
              {data.companies.map((c, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <span className="text-[10px] font-bold text-slate-500 w-5 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-slate-200 truncate">{c.name}</div>
                    <div className="text-[8px] text-slate-500">{c.sector} · {c.employees.toLocaleString('sk-SK')} zamestnancov</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-bold text-green-400">{fmtEur(c.revenue)}</div>
                    <div className={`text-[8px] font-semibold ${c.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{c.profit >= 0 ? '+' : ''}{fmtEur(c.profit)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">Finstat.sk · Simulácia</p>
    </WidgetCard>
  )
}
