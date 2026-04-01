'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface School {
  name: string; type: string; district: string; studentsCount: number
  teachersCount: number; studentTeacherRatio: number; maturityPassRate: number
  avgMaturityScore: number; rating: string; ranking: number; hasGrants: boolean; url: string
}
interface NationalStats {
  totalPrimarySchools: number; totalSecondarySchools: number; totalUniversities: number
  avgMaturityPassRate: number; studentsInSK: number; teacherShortage: number; avgTeacherSalary: number
}
interface MaturityResult { subject: string; passRate: number; avgScore: number }
interface SchoolsData { schools: School[]; nationalStats: NationalStats; maturitySubjectResults: MaturityResult[]; sourceUrl: string; updatedAt: string }

export default function SchoolsWidget() {
  const { data, loading, refetch } = useWidget<SchoolsData>('/api/schools', 60 * 60 * 1000)
  const [tab, setTab] = useState<'schools' | 'stats' | 'maturity'>('stats')

  return (
    <WidgetCard accent="purple" title="Školstvo SR" icon="🎓" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={7} /> : (
        <div className="space-y-3">
          <div className="flex gap-1">
            {(['stats', 'schools', 'maturity'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 text-[8px] py-1 rounded-lg transition-colors ${tab === t ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                {t === 'stats' ? 'Štatistiky' : t === 'schools' ? 'Školy BA' : 'Maturita'}
              </button>
            ))}
          </div>

          {tab === 'stats' && data?.nationalStats && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                  <span className="text-[13px] font-bold text-purple-400">{data.nationalStats.totalPrimarySchools.toLocaleString('sk-SK')}</span>
                  <span className="text-[7px] text-slate-500 text-center">Základné školy</span>
                </div>
                <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                  <span className="text-[13px] font-bold text-blue-400">{data.nationalStats.totalSecondarySchools}</span>
                  <span className="text-[7px] text-slate-500 text-center">Stredné školy</span>
                </div>
                <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                  <span className="text-[13px] font-bold text-green-400">{data.nationalStats.totalUniversities}</span>
                  <span className="text-[7px] text-slate-500 text-center">Univerzity</span>
                </div>
              </div>
              <div className="space-y-1">
                {([
                  { label: 'Žiakov v SR', value: data.nationalStats.studentsInSK.toLocaleString('sk-SK'), color: 'text-white' },
                  { label: 'Priemer maturít', value: `${data.nationalStats.avgMaturityPassRate}%`, color: 'text-green-400' },
                  { label: 'Nedostatok učiteľov', value: data.nationalStats.teacherShortage.toLocaleString('sk-SK'), color: 'text-amber-400' },
                  { label: 'Priem. plat učiteľa', value: `${data.nationalStats.avgTeacherSalary} €`, color: 'text-blue-400' },
                ]).map(item => (
                  <div key={item.label} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-800/30">
                    <span className="text-[9px] text-slate-400">{item.label}</span>
                    <span className={`text-[10px] font-semibold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'schools' && (
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
              {(data?.schools ?? []).map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-2 px-2.5 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 transition-colors block">
                  <div className="text-[9px] font-bold text-slate-500 w-5 shrink-0">#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-white truncate">{s.name}</div>
                    <div className="text-[8px] text-slate-400">{s.type} · {s.district}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] text-slate-500">{s.studentsCount} žiakov</span>
                      <span className="text-[8px] text-slate-500">1:{s.studentTeacherRatio} učiteľ</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-bold text-green-400">{s.maturityPassRate}%</div>
                    <div className="text-[7px] text-slate-500">úspešnosť</div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {tab === 'maturity' && (
            <div className="space-y-2">
              {(data?.maturitySubjectResults ?? []).map(m => (
                <div key={m.subject} className="px-2.5 py-2 rounded-xl bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-white">{m.subject}</span>
                    <span className="text-[10px] font-bold text-green-400">{m.passRate}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-purple-500/70" style={{ width: `${m.passRate}%` }} />
                  </div>
                  <div className="text-[8px] text-slate-500 mt-1">Priem. skóre: {m.avgScore} b.</div>
                </div>
              ))}
            </div>
          )}

          <a href={data?.sourceUrl ?? 'https://www.minedu.sk'} target="_blank" rel="noopener noreferrer"
            className="block text-center text-[8px] text-slate-500 hover:text-purple-400 transition-colors py-1 rounded-lg bg-slate-800/30">
            minedu.sk &rarr;
          </a>
        </div>
      )}
    </WidgetCard>
  )
}
