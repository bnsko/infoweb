'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

/* ── Unemployment ── */
interface RegionData { region: string; rate: number; change: number; jobsCount: number }
interface SalaryData { country: string; flag: string; avgSalary: number; currency: string }
interface UnemploymentData { regions: RegionData[]; salaries: SalaryData[]; nationalAvgRate: number; skAvgSalary: number; timestamp: number }

/* ── Jobs ── */
interface JobItem { title: string; company: string; location: string; salary?: string; link: string; date: string; source: string }
interface JobsData { topJobs: JobItem[]; categories: { name: string; count: number }[]; totalNew: number; timestamp: number }

type Tab = 'jobs' | 'unemployment' | 'salary'

export default function JobMarketWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('jobs')
  const [region, setRegion] = useState<'sk' | 'eu'>('sk')

  const unemployment = useWidget<UnemploymentData>('/api/unemployment', 60 * 60 * 1000)
  const jobs = useWidget<JobsData>(`/api/jobs?tab=${region}`, 30 * 60 * 1000)

  const refetchAll = () => { unemployment.refetch(); jobs.refetch() }

  return (
    <WidgetCard accent="blue" title={lang === 'sk' ? 'Trh práce & Profesie' : 'Job Market'} icon="💼" onRefresh={refetchAll}>
      {/* Tabs */}
      <div className="flex gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {([
          { key: 'jobs' as Tab, icon: '💼', label: 'Ponuky' },
          { key: 'unemployment' as Tab, icon: '📉', label: 'Nezamestnanosť' },
          { key: 'salary' as Tab, icon: '💰', label: 'Mzdy' },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === t.key ? 'bg-blue-500/15 text-blue-300' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{t.icon}</span><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Jobs tab */}
      {tab === 'jobs' && (
        <>
          <div className="flex items-center gap-0.5 mb-2 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
            {([{ key: 'sk' as const, label: '🇸🇰 SK' }, { key: 'eu' as const, label: '🇪🇺 EU' }]).map(r => (
              <button key={r.key} onClick={() => setRegion(r.key)}
                className={`flex-1 text-[10px] font-semibold py-1 rounded-md transition-all ${region === r.key ? 'bg-blue-500/15 text-blue-300' : 'text-slate-500 hover:text-slate-300'}`}>
                {r.label}
              </button>
            ))}
          </div>
          {jobs.loading && <SkeletonRows rows={5} />}
          {!jobs.loading && jobs.data && (
            <div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-hide">
              {(jobs.data.topJobs ?? []).length === 0 ? (
                <p className="text-[10px] text-slate-500 text-center py-4">Žiadne ponuky</p>
              ) : (jobs.data.topJobs ?? []).map((job, i) => (
                <a key={i} href={job.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-2 rounded-lg p-1.5 hover:bg-white/[0.04] transition-all group">
                  <span className="text-[10px] text-slate-600 font-mono shrink-0 mt-0.5 w-4">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-200 group-hover:text-white leading-snug line-clamp-1 font-medium">{job.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {job.company && <span className="text-[9px] text-blue-400/80 font-medium">{job.company}</span>}
                      {job.location && <span className="text-[9px] text-slate-600">📍 {job.location}</span>}
                      {job.salary && <span className="text-[9px] text-emerald-400 font-semibold">{job.salary}</span>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      )}

      {/* Unemployment tab */}
      {tab === 'unemployment' && (
        <>
          {unemployment.loading && <SkeletonRows rows={5} />}
          {!unemployment.loading && unemployment.data && (
            <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-hide">
              <div className="text-[9px] text-rose-400/60 font-bold uppercase tracking-wider mb-2">
                Priemer SR: <span className="text-rose-300">{unemployment.data.nationalAvgRate}%</span>
              </div>
              {unemployment.data.regions.map(r => (
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
        </>
      )}

      {/* Salary tab */}
      {tab === 'salary' && (
        <>
          {unemployment.loading && <SkeletonRows rows={5} />}
          {!unemployment.loading && unemployment.data && (
            <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-hide">
              {unemployment.data.salaries.map(s => (
                <div key={s.country} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${s.country === 'Slovensko' ? 'bg-blue-500/[0.07] border border-blue-500/15' : 'hover:bg-white/[0.03]'}`}>
                  <span className="text-sm">{s.flag}</span>
                  <span className="text-[10px] text-slate-300 flex-1">{s.country}</span>
                  <span className={`text-[11px] font-bold tabular-nums ${s.country === 'Slovensko' ? 'text-blue-300' : 'text-slate-200'}`}>
                    {s.avgSalary.toLocaleString()} {s.currency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <p className="text-[10px] text-slate-600 mt-2">profesia.sk · ÚPSVaR · Eurostat</p>
    </WidgetCard>
  )
}
