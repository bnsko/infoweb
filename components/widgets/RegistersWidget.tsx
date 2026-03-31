'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface RegistersData {
  orsr: { totalEntities: number; newThisMonth: number; deletedThisMonth: number; types: Record<string, number> }
  zr: { totalLivnosti: number; newThisMonth: number; suspendedThisMonth: number; categories: Record<string, number> }
  datagov: { totalDatasets: number; organizations: number; categories: { name: string; count: number }[]; newThisWeek: number }
  timestamp: number
}

export default function RegistersWidget() {
  const { data, loading, refetch } = useWidget<RegistersData>('/api/registers', 24 * 60 * 60 * 1000)

  return (
    <WidgetCard accent="purple" title="Verejné registre SR" icon="📋" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} />}
      {!loading && data && (
        <div className="space-y-3">
          {/* ORSR */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm">🏛️</span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Obchodný register</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="text-center px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-[12px] font-bold text-purple-400">{data.orsr.totalEntities.toLocaleString('sk-SK')}</div>
                <div className="text-[7px] text-slate-500">Subjektov</div>
              </div>
              <div className="text-center px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-[12px] font-bold text-emerald-400">+{data.orsr.newThisMonth}</div>
                <div className="text-[7px] text-slate-500">Nových</div>
              </div>
              <div className="text-center px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-[12px] font-bold text-red-400">-{data.orsr.deletedThisMonth}</div>
                <div className="text-[7px] text-slate-500">Vymazaných</div>
              </div>
            </div>
            <div className="flex gap-1 mt-1">
              {Object.entries(data.orsr.types).map(([type, count]) => (
                <span key={type} className="text-[7px] text-slate-500 bg-white/[0.03] rounded px-1.5 py-0.5">
                  {type.toUpperCase()}: <span className="text-slate-300 font-bold">{count.toLocaleString('sk-SK')}</span>
                </span>
              ))}
            </div>
          </div>

          {/* ZR */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm">📝</span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Živnostenský register</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="text-center px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-[12px] font-bold text-blue-400">{data.zr.totalLivnosti.toLocaleString('sk-SK')}</div>
                <div className="text-[7px] text-slate-500">Živností</div>
              </div>
              <div className="text-center px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-[12px] font-bold text-emerald-400">+{data.zr.newThisMonth}</div>
                <div className="text-[7px] text-slate-500">Nových</div>
              </div>
              <div className="text-center px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-[12px] font-bold text-orange-400">{data.zr.suspendedThisMonth}</div>
                <div className="text-[7px] text-slate-500">Pozastavených</div>
              </div>
            </div>
          </div>

          {/* data.gov.sk */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm">📊</span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">data.gov.sk</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 mb-1">
              <div><span className="text-[13px] font-bold text-cyan-400">{data.datagov.totalDatasets.toLocaleString('sk-SK')}</span> <span className="text-[8px] text-slate-500">datasetov</span></div>
              <div><span className="text-[13px] font-bold text-slate-300">{data.datagov.organizations}</span> <span className="text-[8px] text-slate-500">organizácií</span></div>
              <div><span className="text-[13px] font-bold text-green-400">+{data.datagov.newThisWeek}</span> <span className="text-[8px] text-slate-500">tento týždeň</span></div>
            </div>
            <div className="flex flex-wrap gap-0.5">
              {data.datagov.categories.map((c, i) => (
                <span key={i} className="text-[7px] bg-white/[0.03] border border-white/5 rounded px-1.5 py-0.5 text-slate-400">
                  {c.name} <span className="text-cyan-400 font-bold">{c.count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">ORSR · ŽR · data.gov.sk · Simulácia</p>
    </WidgetCard>
  )
}
