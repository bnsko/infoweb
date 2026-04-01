'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface WantedPerson {
  id: string; name: string; age: number; region: string; crime: string
  wantedSince: string; dangerous: boolean; reward: number | null
}
interface MissingPerson {
  id: string; name: string; age: number; region: string; missingFrom: string; description: string
}
interface KrimiStats { activeWanted: number; activeMissing: number; resolvedThisMonth: number; recentOperations: number }
interface KrimiData { wanted: WantedPerson[]; missing: MissingPerson[]; stats: KrimiStats; sourceUrl: string; updatedAt: string }

export default function KrimiWidget() {
  const { data, loading, refetch } = useWidget<KrimiData>('/api/krimi', 15 * 60 * 1000)
  const [tab, setTab] = useState<'wanted' | 'missing'>('wanted')

  return (
    <WidgetCard accent="rose" title="Polícia SR — Pátranie" icon="🚔" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={7} /> : (
        <div className="space-y-3">
          {data?.stats && (
            <div className="grid grid-cols-4 gap-1.5">
              {([
                { label: 'Hľadaní', value: data.stats.activeWanted, color: 'text-rose-400' },
                { label: 'Nezvestní', value: data.stats.activeMissing, color: 'text-amber-400' },
                { label: 'Vyriešené/mes.', value: data.stats.resolvedThisMonth, color: 'text-green-400' },
                { label: 'Operácie', value: data.stats.recentOperations, color: 'text-blue-400' },
              ]).map(s => (
                <div key={s.label} className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                  <span className={`text-[14px] font-bold ${s.color}`}>{s.value}</span>
                  <span className="text-[7px] text-slate-500 text-center">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-1">
            {(['wanted', 'missing'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 text-[9px] py-1 rounded-lg transition-colors font-medium ${tab === t ? (t === 'wanted' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300') : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                {t === 'wanted' ? 'Hľadané osoby' : 'Nezvestní'}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
            {tab === 'wanted' && (data?.wanted ?? []).map(p => (
              <div key={p.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-800/40">
                <div className={`w-2 h-2 rounded-full shrink-0 ${p.dangerous ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-white">{p.name}</span>
                    {p.dangerous && <span className="text-[7px] bg-rose-500/20 text-rose-400 px-1 rounded">nebezpečný</span>}
                  </div>
                  <div className="text-[9px] text-slate-400">{p.age} r. · {p.region} · {p.crime}</div>
                </div>
                {p.reward && <span className="text-[9px] text-amber-400 font-bold shrink-0">{p.reward} €</span>}
              </div>
            ))}
            {tab === 'missing' && (data?.missing ?? []).map(p => (
              <div key={p.id} className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl bg-slate-800/40">
                <div className="w-2 h-2 rounded-full bg-amber-500/80 shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-white">{p.name}</span>
                  <div className="text-[9px] text-slate-400">{p.age} r. · {p.description}</div>
                  <div className="text-[8px] text-slate-500">Nezvestný od {p.missingFrom}</div>
                </div>
              </div>
            ))}
          </div>

          <a href={data?.sourceUrl ?? 'https://www.minv.sk'} target="_blank" rel="noopener noreferrer"
            className="block text-center text-[8px] text-slate-500 hover:text-rose-400 transition-colors py-1 rounded-lg bg-slate-800/30">
            minv.sk &rarr;
          </a>
        </div>
      )}
    </WidgetCard>
  )
}
