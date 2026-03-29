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
  source: string
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

type Region = 'sk' | 'eu'

export default function JobsWidget() {
  const { lang } = useLang()
  const [region, setRegion] = useState<Region>('sk')
  const [category, setCategory] = useState<string>('all')

  const apiUrl = `/api/jobs?tab=${region}`
  const { data, loading, error, refetch } = useWidget<JobsData>(apiUrl, 30 * 60 * 1000)

  const filteredJobs = category === 'all' ? data?.topJobs : data?.topJobs.filter(j => {
    const tl = j.title.toLowerCase()
    const catMap: Record<string, RegExp> = {
      'IT & Vývoj': /it|develop|program|software|devops|data|cloud|web|frontend|backend|qa|test/,
      'Administratíva': /admin|asisten|recep|office|sekretár/,
      'Obchod': /obchod|predaj|sales|key account|obchodný/,
      'Výroba & Logistika': /výrob|sklad|logist|operátor|montáž|skladník/,
      'Financie': /účt|financ|ekon|audit|controlling/,
      'Marketing': /market|brand|pr |comm|social/,
    }
    return catMap[category]?.test(tl) ?? true
  })

  const CATEGORIES = [
    { key: 'all', emoji: '📋', label: 'Všetky' },
    { key: 'IT & Vývoj', emoji: '💻', label: 'IT' },
    { key: 'Administratíva', emoji: '📝', label: 'Admin' },
    { key: 'Obchod', emoji: '🤝', label: 'Obchod' },
    { key: 'Výroba & Logistika', emoji: '🏭', label: 'Výroba' },
    { key: 'Financie', emoji: '💰', label: 'Financie' },
    { key: 'Marketing', emoji: '📢', label: 'Marketing' },
  ]

  return (
    <WidgetCard
      accent="blue"
      title={lang === 'sk' ? 'Pracovné ponuky' : 'Job Offers'}
      icon="💼"
      onRefresh={refetch}
    >
      {/* Region tabs */}
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {([
          { key: 'sk' as Region, label: '🇸🇰 Slovensko' },
          { key: 'eu' as Region, label: '🇪🇺 Zahraničie' },
        ]).map(tb => (
          <button key={tb.key} onClick={() => setRegion(tb.key)}
            className={`flex-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              region === tb.key ? 'bg-blue-500/15 text-blue-300' : 'text-slate-500 hover:text-slate-300'
            }`}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)}
            className={`shrink-0 text-[9px] font-semibold px-2 py-1 rounded-full transition-all ${
              category === c.key
                ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
            }`}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      {data && (
        <div className="flex items-center gap-3 mb-3 text-[10px]">
          <span className="text-blue-400 font-bold">{(filteredJobs?.length ?? 0)} {lang === 'sk' ? 'ponúk' : 'offers'}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">{region === 'sk' ? 'profesia.sk' : 'EU portály'}</span>
        </div>
      )}

      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-xs text-slate-500">{lang === 'sk' ? 'Chyba' : 'Error'}</p>}

      {!loading && data && (
        <div className="space-y-0.5 max-h-[320px] overflow-y-auto scrollbar-hide">
          {(filteredJobs ?? []).length === 0 && (
            <p className="text-[10px] text-slate-500 py-4 text-center">Žiadne ponuky v tejto kategórii</p>
          )}
          {(filteredJobs ?? []).map((job, i) => (
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
              {job.source && (
                <span className="text-[8px] text-slate-600 shrink-0 mt-0.5">{job.source}</span>
              )}
            </a>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-600 mt-2">
        {region === 'sk' ? 'profesia.sk' : 'Jobs.cz · Karriere.at · Pracuj.pl · Profession.hu'} · {lang === 'sk' ? 'obnova 30 min' : 'refresh 30 min'}
      </p>
    </WidgetCard>
  )
}
