'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface JobItem {
  title: string
  company: string
  location: string
  salary?: string
  link: string
  date: string
}

interface JobCategory {
  name: string
  count: number
}

interface JobsData {
  topJobs: JobItem[]
  categories: JobCategory[]
  totalNew: number
  timestamp: number
}

type Tab = 'jobs' | 'categories'

export default function JobsWidget() {
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('jobs')
  const { data, loading, error, refetch } = useWidget<JobsData>('/api/jobs', 30 * 60 * 1000)

  return (
    <WidgetCard
      accent="blue"
      title={lang === 'sk' ? 'Pracovné ponuky' : 'Job Offers'}
      icon="💼"
      onRefresh={refetch}
    >
      {/* Stats bar */}
      {data && (
        <div className="flex items-center gap-3 mb-3 text-[10px]">
          <span className="text-blue-400 font-bold">{data.totalNew} {lang === 'sk' ? 'nových' : 'new'}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">profesia.sk</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {([
          { key: 'jobs' as Tab, label: lang === 'sk' ? '📋 Ponuky' : '📋 Jobs' },
          { key: 'categories' as Tab, label: lang === 'sk' ? '📊 Kategórie' : '📊 Categories' },
        ]).map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === tb.key ? 'bg-blue-500/15 text-blue-300' : 'text-slate-500 hover:text-slate-300'
            }`}>
            {tb.label}
          </button>
        ))}
      </div>

      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">{lang === 'sk' ? 'Chyba' : 'Error'}</p>}

      {!loading && data && tab === 'jobs' && (
        <div className="space-y-0.5 max-h-[320px] overflow-y-auto scrollbar-hide">
          {data.topJobs.map((job, i) => (
            <a
              key={i}
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 rounded-lg p-1.5 hover:bg-white/[0.04] transition-all group"
            >
              <span className="text-[10px] text-slate-600 font-mono shrink-0 mt-0.5 w-4">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-200 group-hover:text-white leading-snug line-clamp-1 font-medium">{job.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {job.company && <span className="text-[9px] text-blue-400/80 font-medium">{job.company}</span>}
                  {job.location && <span className="text-[9px] text-slate-600">📍 {job.location}</span>}
                  {job.salary && <span className="text-[9px] text-emerald-400 font-semibold">{job.salary}</span>}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {!loading && data && tab === 'categories' && (
        <div className="space-y-2">
          {data.categories.map((cat, i) => {
            const maxCount = data.categories[0]?.count ?? 1
            const pct = Math.round((cat.count / maxCount) * 100)
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] text-slate-300 font-medium">{cat.name}</span>
                  <span className="text-[10px] text-blue-400 font-bold">{cat.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500/40 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-[10px] text-slate-600 mt-2">profesia.sk · {lang === 'sk' ? 'obnova 30 min' : 'refresh 30 min'}</p>
    </WidgetCard>
  )
}
