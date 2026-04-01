'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Project {
  id: string; name: string; category: string; district: string
  budgetEur: number; spentEur: number; progress: number
  status: string; startYear: number; endYear: number; url: string
}
interface BudgetData {
  year: number; totalRevenues: number; totalExpenses: number
  capitalExpenses: number; debtEur: number; executionPct: number
}
interface TopSpend { category: string; amount: number; pct: number }
interface BratislavaData {
  projects: Project[]; budget: BudgetData; topSpendingCategories: TopSpend[]
  sourceUrl: string; updatedAt: string
}

function fmtM(n: number) { return `${(n / 1_000_000).toFixed(1)}M €` }

const STATUS_COLOR = { 'dokončený': 'text-green-400', 'v realizácii': 'text-blue-400', 'prípravná fáza': 'text-slate-400' }
const CATEGORY_ICON: Record<string, string> = { 'infraštruktúra': '🏗️', 'doprava': '🚌', 'zeleň': '🌳', 'sociálne': '🤝', 'digitalizácia': '💻', 'životné prostredie': '♻️' }

export default function BratislavaOpenDataWidget() {
  const { data, loading, refetch } = useWidget<BratislavaData>('/api/bratislava-opendata', 60 * 60 * 1000)
  const [tab, setTab] = useState<'projects' | 'budget'>('budget')

  return (
    <WidgetCard accent="cyan" title="Bratislava — Opendata" icon="🏙️" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={7} /> : (
        <div className="space-y-3">
          <div className="flex gap-1">
            {(['budget', 'projects'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 text-[9px] py-1 rounded-lg transition-colors ${tab === t ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                {t === 'budget' ? 'Rozpočet' : 'Projekty'}
              </button>
            ))}
          </div>

          {tab === 'budget' && data?.budget && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col bg-slate-800/50 rounded-xl p-2.5">
                  <span className="text-[7px] text-slate-500 uppercase">Príjmy {data.budget.year}</span>
                  <span className="text-[14px] font-bold text-green-400">{fmtM(data.budget.totalRevenues)}</span>
                </div>
                <div className="flex flex-col bg-slate-800/50 rounded-xl p-2.5">
                  <span className="text-[7px] text-slate-500 uppercase">Výdavky</span>
                  <span className="text-[14px] font-bold text-blue-400">{fmtM(data.budget.totalExpenses)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="flex flex-col items-center bg-slate-800/40 rounded-xl p-2">
                  <span className="text-[7px] text-slate-500">Kapitálové</span>
                  <span className="text-[11px] font-bold text-amber-400">{fmtM(data.budget.capitalExpenses)}</span>
                </div>
                <div className="flex flex-col items-center bg-slate-800/40 rounded-xl p-2">
                  <span className="text-[7px] text-slate-500">Dlh</span>
                  <span className="text-[11px] font-bold text-rose-400">{fmtM(data.budget.debtEur)}</span>
                </div>
                <div className="flex flex-col items-center bg-slate-800/40 rounded-xl p-2">
                  <span className="text-[7px] text-slate-500">Čerpanie</span>
                  <span className="text-[11px] font-bold text-cyan-400">{data.budget.executionPct}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider px-1">Top výdavky</span>
                {(data?.topSpendingCategories ?? []).map(c => (
                  <div key={c.category} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-800/30">
                    <span className="text-[9px] text-slate-300 flex-1">{c.category}</span>
                    <span className="text-[9px] font-bold text-white">{fmtM(c.amount)}</span>
                    <span className="text-[8px] text-slate-500 w-8 text-right">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'projects' && (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {(data?.projects ?? []).map(p => (
                <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-2 px-2.5 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 transition-colors block">
                  <span className="text-[12px] shrink-0 mt-0.5">{CATEGORY_ICON[p.category] ?? '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium text-white leading-tight">{p.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500/70 rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-[8px] text-slate-400 shrink-0">{p.progress}%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] text-slate-500">{fmtM(p.budgetEur)}</span>
                      <span className={`text-[7px] ${STATUS_COLOR[p.status as keyof typeof STATUS_COLOR] ?? 'text-slate-500'}`}>{p.status}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          <a href={data?.sourceUrl ?? 'https://opendata.bratislava.sk'} target="_blank" rel="noopener noreferrer"
            className="block text-center text-[8px] text-slate-500 hover:text-cyan-400 transition-colors py-1 rounded-lg bg-slate-800/30">
            opendata.bratislava.sk &rarr;
          </a>
        </div>
      )}
    </WidgetCard>
  )
}
