'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useState } from 'react'

interface RegionData { region: string; rate: number; change: number; jobsCount: number }
interface SalaryData { country: string; flag: string; avgSalary: number; currency: string }
interface UnemploymentData {
  regions: RegionData[]
  salaries: SalaryData[]
  nationalAvgRate: number
  skAvgSalary: number
  timestamp: number
}

export default function UnemploymentWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<UnemploymentData>('/api/unemployment', 60 * 60 * 1000)
  const [tab, setTab] = useState<'unemployment' | 'salary'>('unemployment')

  return (
    <WidgetCard accent="rose" title={lang === 'sk' ? 'Trh práce' : 'Job Market'} icon="📊" onRefresh={refetch}
      headerRight={
        <div className="flex gap-1">
          {(['unemployment', 'salary'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-[9px] px-2 py-0.5 rounded-full font-semibold transition-colors ${tab === t ? 'bg-rose-500/20 text-rose-300' : 'text-slate-500 hover:text-slate-300'}`}>
              {t === 'unemployment' ? '📉 Nezamestnanosť' : '💰 Mzdy'}
            </button>
          ))}
        </div>
      }>
      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && data && tab === 'unemployment' && (
        <div className="space-y-1">
          <div className="text-[9px] text-rose-400/60 font-bold uppercase tracking-wider mb-2">
            Priemer SR: <span className="text-rose-300">{data.nationalAvgRate}%</span>
          </div>
          {data.regions.map(r => (
            <div key={r.region} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.03]">
              <span className="text-[10px] text-slate-300 flex-1">{r.region}</span>
              <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${Math.min(100, r.rate * 10)}%`,
                  background: r.rate > 7 ? '#ef4444' : r.rate > 5 ? '#f59e0b' : '#22c55e',
                }} />
              </div>
              <span className={`text-[10px] font-bold tabular-nums w-10 text-right ${r.rate > 7 ? 'text-red-400' : r.rate > 5 ? 'text-orange-400' : 'text-emerald-400'}`}>
                {r.rate}%
              </span>
              <span className={`text-[8px] w-8 text-right ${r.change > 0 ? 'text-red-400' : r.change < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {r.change > 0 ? `+${r.change}` : r.change === 0 ? '=' : r.change}
              </span>
            </div>
          ))}
        </div>
      )}
      {!loading && data && tab === 'salary' && (
        <div className="space-y-1">
          {data.salaries.map(s => (
            <div key={s.country} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${s.country === 'Slovensko' ? 'bg-rose-500/[0.07] border border-rose-500/15' : 'hover:bg-white/[0.03]'}`}>
              <span className="text-sm">{s.flag}</span>
              <span className="text-[10px] text-slate-300 flex-1">{s.country}</span>
              <span className={`text-[11px] font-bold tabular-nums ${s.country === 'Slovensko' ? 'text-rose-300' : 'text-slate-200'}`}>
                {s.avgSalary.toLocaleString()} {s.currency}
              </span>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
