'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface MPAttendance {
  name: string; party: string; sessionCount: number; attended: number
  attendancePct: number; votingPct: number; absences: number; excusedAbsences: number; grade: string
}
interface PartyStat { party: string; avgAttendance: number; mpCount: number }
interface OverallStats { totalMPs: number; avgAttendance: number; currentSession: string; totalSessions: number }
interface AttendanceData {
  attendance: MPAttendance[]; worstAbsentees: MPAttendance[]; bestAttendees: MPAttendance[]
  partyStats: PartyStat[]; overallStats: OverallStats; sourceUrl: string; updatedAt: string
}

const GRADE_COLOR: Record<string, string> = { A: 'text-green-400', B: 'text-blue-400', C: 'text-amber-400', D: 'text-orange-400', F: 'text-rose-400' }
const PARTY_COLORS: Record<string, string> = {
  'Hlas-SD': 'bg-rose-500/70', 'Smer-SD': 'bg-red-700/70', 'PS': 'bg-blue-500/70',
  'OĽaNO': 'bg-purple-500/70', 'SaS': 'bg-yellow-500/70', 'Sme rodina': 'bg-green-600/70', 'SNS': 'bg-blue-800/70',
}

export default function ParliamentAttendanceWidget() {
  const { data, loading, refetch } = useWidget<AttendanceData>('/api/parliament-attendance', 24 * 60 * 60 * 1000)
  const [tab, setTab] = useState<'worst' | 'best' | 'parties'>('worst')

  return (
    <WidgetCard accent="rose" title="Dochádzka poslancov" icon="🏛️" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={7} /> : (
        <div className="space-y-3">
          {data?.overallStats && (
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase">Priemer</span>
                <span className="text-[14px] font-bold text-white">{data.overallStats.avgAttendance}%</span>
              </div>
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase">Schôdze</span>
                <span className="text-[14px] font-bold text-blue-400">{data.overallStats.totalSessions}</span>
              </div>
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2 col-span-1">
                <span className="text-[7px] text-slate-500 uppercase">Poslancov</span>
                <span className="text-[14px] font-bold text-slate-300">{data.overallStats.totalMPs}</span>
              </div>
            </div>
          )}

          <div className="flex gap-1">
            {(['worst', 'best', 'parties'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 text-[8px] py-1 rounded-lg transition-colors ${tab === t ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                {t === 'worst' ? 'Absentéri' : t === 'best' ? 'Vzorní' : 'Strany'}
              </button>
            ))}
          </div>

          {(tab === 'worst' || tab === 'best') && (
            <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
              {((tab === 'worst' ? data?.worstAbsentees : data?.bestAttendees) ?? []).map((mp, i) => (
                <div key={mp.name} className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-800/40">
                  <span className="text-[9px] text-slate-500 w-4 shrink-0">#{i + 1}</span>
                  <div className={`w-1.5 h-4 rounded-full shrink-0 ${PARTY_COLORS[mp.party] ?? 'bg-slate-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-white truncate">{mp.name}</div>
                    <div className="text-[8px] text-slate-400">{mp.party} · {mp.absences} absencií</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-[12px] font-bold ${GRADE_COLOR[mp.grade]}`}>{mp.grade}</div>
                    <div className="text-[8px] text-slate-400">{mp.attendancePct}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'parties' && (
            <div className="space-y-1.5">
              {(data?.partyStats ?? []).map(p => (
                <div key={p.party} className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-800/30">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${PARTY_COLORS[p.party] ?? 'bg-slate-600'}`} />
                  <span className="text-[10px] font-medium text-white flex-1">{p.party}</span>
                  <div className="flex-1">
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.avgAttendance >= 80 ? 'bg-green-500/70' : p.avgAttendance >= 60 ? 'bg-amber-500/70' : 'bg-rose-500/70'}`}
                        style={{ width: `${p.avgAttendance}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-white w-10 text-right">{p.avgAttendance}%</span>
                </div>
              ))}
            </div>
          )}

          <a href={data?.sourceUrl ?? 'https://www.nrsr.sk'} target="_blank" rel="noopener noreferrer"
            className="block text-center text-[8px] text-slate-500 hover:text-rose-400 transition-colors py-1 rounded-lg bg-slate-800/30">
            nrsr.sk — dochádzka poslancov &rarr;
          </a>
        </div>
      )}
    </WidgetCard>
  )
}
