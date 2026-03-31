'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Dataset { name: string; category: string; records: number; updated: string; source: string }
interface VaxCenter { name: string; city: string; capacity: number; active: boolean; vaccines: string[] }
interface Hospital { name: string; city: string; beds: number; icu: number; occupancy: number; emergency: boolean }
interface NCZIStats { totalHospitals: number; totalBeds: number; totalDoctors: number; totalNurses: number; avgWaitDays: number; eReceptsToday: number }
interface NCZIData { datasets: Dataset[]; vaccinationCenters: VaxCenter[]; hospitals: Hospital[]; stats: NCZIStats; timestamp: number }

export default function NCZIWidget() {
  const { data, loading, refetch } = useWidget<NCZIData>('/api/nczi', 60 * 60 * 1000)
  const [tab, setTab] = useState<'hospitals' | 'vaccination' | 'datasets'>('hospitals')

  return (
    <WidgetCard accent="cyan" title="NCZI – Zdravotníctvo SR" icon="🏥" onRefresh={refetch}>
      {loading && <SkeletonRows rows={8} />}
      {!loading && data && (
        <div className="space-y-2">
          {/* Stats overview */}
          <div className="grid grid-cols-3 gap-1">
            <div className="text-center px-1 py-1.5 rounded-lg bg-cyan-500/[0.06] border border-cyan-500/10">
              <div className="text-[12px] font-bold text-cyan-400">{data.stats.totalHospitals}</div>
              <div className="text-[7px] text-slate-500">Nemocníc</div>
            </div>
            <div className="text-center px-1 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[12px] font-bold text-blue-400">{data.stats.totalDoctors.toLocaleString('sk-SK')}</div>
              <div className="text-[7px] text-slate-500">Lekárov</div>
            </div>
            <div className="text-center px-1 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[12px] font-bold text-green-400">{data.stats.eReceptsToday.toLocaleString('sk-SK')}</div>
              <div className="text-[7px] text-slate-500">eReceptov dnes</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[8px] text-slate-500 px-1">
            <span>🛏️ {data.stats.totalBeds.toLocaleString('sk-SK')} lôžok</span>
            <span>👩‍⚕️ {data.stats.totalNurses.toLocaleString('sk-SK')} sestier</span>
            <span>⏳ Ø čakanie: {data.stats.avgWaitDays} dní</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 border-b border-white/5 pb-1">
            {(['hospitals', 'vaccination', 'datasets'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`text-[8px] px-2 py-1 rounded-t-lg transition-all ${tab === t ? 'bg-cyan-500/15 text-cyan-300 font-bold' : 'text-slate-500 hover:text-slate-300'}`}>
                {t === 'hospitals' ? '🏥 Nemocnice' : t === 'vaccination' ? '💉 Očkovanie' : '📊 Datasety'}
              </button>
            ))}
          </div>

          {/* Hospitals */}
          {tab === 'hospitals' && (
            <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-hide">
              {data.hospitals.map((h, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-white">{h.name}</div>
                    <div className="text-[8px] text-slate-500">📍 {h.city} · {h.beds} lôžok · {h.icu} JIS</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-[10px] font-bold ${+h.occupancy > 85 ? 'text-red-400' : +h.occupancy > 70 ? 'text-amber-400' : 'text-green-400'}`}>{h.occupancy}%</div>
                    <div className="text-[7px] text-slate-600">obsadenosť</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vaccination */}
          {tab === 'vaccination' && (
            <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-hide">
              {data.vaccinationCenters.map((v, i) => (
                <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${v.active ? 'bg-white/[0.02] border-white/5' : 'bg-red-500/5 border-red-500/10 opacity-60'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-white">{v.name}</div>
                    <div className="text-[8px] text-slate-500">📍 {v.city} · Kapacita: {v.capacity}/deň</div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold ${v.active ? 'bg-green-500/15 text-green-300' : 'bg-red-500/15 text-red-300'}`}>{v.active ? '✅ Aktívne' : '❌ Zatvorené'}</span>
                    <span className="text-[7px] text-slate-600">{v.vaccines.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Datasets */}
          {tab === 'datasets' && (
            <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-hide">
              {data.datasets.map((d, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-slate-200">{d.name}</div>
                    <div className="text-[8px] text-slate-500">{d.category} · {d.source}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] font-mono text-cyan-400">{(d.records / 1000).toFixed(d.records > 100000 ? 0 : 1)}k</div>
                    <div className="text-[7px] text-slate-600">{d.updated}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">nczi.sk · data.gov.sk · Simulácia</p>
    </WidgetCard>
  )
}
