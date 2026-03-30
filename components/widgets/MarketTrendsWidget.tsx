'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Sector { name: string; growth: string; avgSalary: number; icon: string }
interface MarketData { avgSalary: number; avgSalaryGrowth: string; unemployment: number; inflation: number; gdpGrowth: number; minWage: number; avgRent: { bratislava: number; kosice: number; zilina: number }; topSectors: Sector[]; bizStats: { totalCompanies: number; newCompaniesPerMonth: number; bankruptciesPerMonth: number; selfEmployed: number }; timestamp: number }

export default function MarketTrendsWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<MarketData>('/api/markettrends', 60 * 60 * 1000)

  return (
    <WidgetCard accent="cyan" title={lang === 'sk' ? 'Trh & Ekonomika SK' : 'Market SK'} icon="📊" onRefresh={refetch}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && data && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Priem. plat', value: `${data.avgSalary}€`, sub: data.avgSalaryGrowth, color: 'text-emerald-400' },
              { label: 'Nezamestnanosť', value: `${data.unemployment}%`, sub: '', color: 'text-blue-400' },
              { label: 'Inflácia', value: `${data.inflation}%`, sub: '', color: 'text-amber-400' },
              { label: 'Rast HDP', value: `${data.gdpGrowth}%`, sub: '', color: 'text-green-400' },
              { label: 'Min. mzda', value: `${data.minWage}€`, sub: '', color: 'text-slate-300' },
              { label: 'Nájom BA', value: `${data.avgRent.bratislava}€`, sub: '', color: 'text-purple-400' },
            ].map((m, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-lg p-2 text-center">
                <div className={`text-[12px] font-bold font-mono ${m.color}`}>{m.value}</div>
                <div className="text-[7px] text-slate-500">{m.label}</div>
                {m.sub && <div className="text-[7px] text-emerald-400 font-bold">{m.sub}</div>}
              </div>
            ))}
          </div>
          <div>
            <div className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Top sektory</div>
            <div className="space-y-0.5">
              {data.topSectors.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1 bg-white/[0.02] hover:bg-white/[0.04]">
                  <span>{s.icon}</span>
                  <span className="text-[9px] text-slate-300 font-medium flex-1">{s.name}</span>
                  <span className="text-[8px] text-emerald-400 font-bold">{s.growth}</span>
                  <span className="text-[8px] text-slate-500">{s.avgSalary}€</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-center">
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
              <div className="text-[11px] font-bold text-white">{data.bizStats.totalCompanies.toLocaleString('sk-SK')}</div>
              <div className="text-[7px] text-slate-500">Firiem na SK</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
              <div className="text-[11px] font-bold text-emerald-400">+{data.bizStats.newCompaniesPerMonth}/mes</div>
              <div className="text-[7px] text-slate-500">Nové firmy</div>
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
