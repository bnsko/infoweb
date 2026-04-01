'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Amendment {
  id: string; title: string; shortTitle: string; num: string
  effectiveDate: string; daysAgo: number; type: string; status: string; url: string
}
interface Decision {
  id: string; court: string; date: string; daysAgo: number; summary: string; impact: string; url: string
}
interface SlovLexStats { totalLaws: number; amendedThisYear: number; newThisYear: number; pendingInParliament: number }
interface SlovLexData { recentAmendments: Amendment[]; interestingDecisions: Decision[]; stats: SlovLexStats; sourceUrl: string; updatedAt: string }

export default function SlovLexWidget() {
  const { data, loading, refetch } = useWidget<SlovLexData>('/api/slovlex', 60 * 60 * 1000)
  const [tab, setTab] = useState<'laws' | 'decisions'>('laws')

  return (
    <WidgetCard accent="blue" title="Slov-lex & Justícia" icon="⚖️" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={7} /> : (
        <div className="space-y-3">
          {data?.stats && (
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { label: 'Zákonov', value: data.stats.totalLaws.toLocaleString('sk-SK'), color: 'text-blue-400' },
                { label: 'Novelizovaných', value: data.stats.amendedThisYear, color: 'text-amber-400' },
                { label: 'Nových', value: data.stats.newThisYear, color: 'text-green-400' },
                { label: 'V parlamente', value: data.stats.pendingInParliament, color: 'text-slate-400' },
              ]).map(s => (
                <div key={s.label} className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                  <span className={`text-[13px] font-bold ${s.color}`}>{s.value}</span>
                  <span className="text-[6.5px] text-slate-500 text-center leading-tight">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-1">
            {(['laws', 'decisions'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 text-[9px] py-1 rounded-lg transition-colors ${tab === t ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                {t === 'laws' ? 'Nedávne zmeny zákonov' : 'Zaujímavé rozhodnutia'}
              </button>
            ))}
          </div>

          {tab === 'laws' && (
            <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
              {(data?.recentAmendments ?? []).map(a => (
                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-2 px-2.5 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 transition-colors group block">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-mono text-blue-400">{a.num}</span>
                      <span className={`text-[7px] px-1 rounded ${a.type === 'novela' ? 'bg-amber-500/15 text-amber-400' : 'bg-green-500/15 text-green-400'}`}>{a.type}</span>
                    </div>
                    <div className="text-[10px] font-medium text-white leading-tight mt-0.5 truncate">{a.shortTitle}</div>
                    <div className="text-[8px] text-slate-500">{a.effectiveDate} · {a.status}</div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {tab === 'decisions' && (
            <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
              {(data?.interestingDecisions ?? []).map(d => (
                <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-2 px-2.5 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 transition-colors block">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-semibold text-white truncate">{d.court}</span>
                      {d.impact === 'precedent' && <span className="text-[7px] bg-blue-500/20 text-blue-400 px-1 rounded shrink-0">precedent</span>}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">{d.summary}</div>
                    <div className="text-[8px] text-slate-500">{d.date}</div>
                  </div>
                </a>
              ))}
            </div>
          )}

          <a href={data?.sourceUrl ?? 'https://www.slov-lex.sk'} target="_blank" rel="noopener noreferrer"
            className="block text-center text-[8px] text-slate-500 hover:text-blue-400 transition-colors py-1 rounded-lg bg-slate-800/30">
            slov-lex.sk &rarr;
          </a>
        </div>
      )}
    </WidgetCard>
  )
}
