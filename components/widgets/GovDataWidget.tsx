'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Vote {
  title: string
  date: string
  result: 'schválené' | 'zamietnuté' | 'presunuté'
  forVotes: number
  againstVotes: number
  abstained: number
  absent: number
}
interface Contract {
  name: string
  supplier: string
  value: number
  date: string
  ministry: string
}
interface RPVSStat {
  totalPartners: number
  newThisMonth: number
  sectors: { name: string; count: number }[]
}
interface StatItem {
  name: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
}
interface GovData {
  parliament: { votes: Vote[] }
  crz: { contracts: Contract[] }
  rpvs: RPVSStat
  statistics: { indicators: StatItem[] }
  timestamp: number
}

export default function GovDataWidget() {
  const { data, loading, refetch } = useWidget<GovData>('/api/govdata', 60 * 60 * 1000)

  const resultColor = (r: string) =>
    r === 'schválené' ? 'text-emerald-400 bg-emerald-500/10' : r === 'zamietnuté' ? 'text-red-400 bg-red-500/10' : 'text-amber-400 bg-amber-500/10'

  return (
    <WidgetCard accent="blue" title="Štát & Verejné dáta" icon="🏛️" onRefresh={refetch}>
      {loading && <SkeletonRows rows={10} />}
      {!loading && data && (
        <div className="space-y-4">
          {/* Štatistiky */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">📊 Štatistiky SR</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              {data.statistics.indicators.slice(0, 9).map((ind, i) => (
                <div key={i} className="text-center px-1 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[11px] font-bold text-slate-200">{ind.value}</div>
                  <span className={`text-[7px] ${ind.trend === 'up' ? 'text-emerald-400' : ind.trend === 'down' ? 'text-red-400' : 'text-slate-500'}`}>
                    {ind.change}
                  </span>
                  <div className="text-[7px] text-slate-500 truncate">{ind.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Parlament */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">🗳️ Parlament NR SR</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-1">
              {data.parliament.votes.slice(0, 5).map((v, i) => (
                <div key={i} className="px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <span className="text-[10px] text-slate-200 leading-snug line-clamp-1 flex-1">{v.title}</span>
                    <span className={`text-[7px] px-1.5 py-0.5 rounded font-bold shrink-0 ${resultColor(v.result)}`}>
                      {v.result}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[7px]">
                    <span className="text-slate-500">{v.date}</span>
                    <span className="text-emerald-400">Za: {v.forVotes}</span>
                    <span className="text-red-400">Proti: {v.againstVotes}</span>
                    <span className="text-slate-500">Zdržalo: {v.abstained}</span>
                    <span className="text-slate-600">Neprít.: {v.absent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CRZ */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">📄 CRZ zmluvy</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="space-y-0.5">
              {data.crz.contracts.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/[0.03] transition">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-200 truncate">{c.name}</div>
                    <div className="text-[7px] text-slate-500">{c.supplier} · {c.ministry}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono font-bold text-amber-400">
                      {c.value >= 1e6 ? `${(c.value / 1e6).toFixed(1)} mil €` : `${(c.value / 1e3).toFixed(0)} tis €`}
                    </div>
                    <div className="text-[7px] text-slate-600">{c.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RPVS */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">🔍 RPVS</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="flex items-center gap-3 text-[9px] mb-1">
              <span className="text-slate-300"><span className="text-blue-400 font-bold">{data.rpvs.totalPartners.toLocaleString('sk-SK')}</span> partnerov</span>
              <span className="text-emerald-400">+{data.rpvs.newThisMonth} tento mesiac</span>
            </div>
            <div className="flex flex-wrap gap-0.5">
              {data.rpvs.sectors.map((s, i) => (
                <span key={i} className="text-[7px] bg-white/[0.03] border border-white/5 rounded px-1.5 py-0.5 text-slate-400">
                  {s.name} <span className="text-blue-400 font-bold">{s.count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">NR SR · CRZ · RPVS · ŠÚSR · Simulácia</p>
    </WidgetCard>
  )
}
