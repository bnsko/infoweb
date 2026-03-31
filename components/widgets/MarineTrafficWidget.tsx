'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Vessel {
  name: string; type: string; flag: string; direction: string; from: string; to: string
  speed: number; kmFromBA: number; position: string; eta: string; cargo: string | null; passengers: number | null
}
interface RiverData { waterLevel: number; flowRate: number; waterTemp: number; navigation: string }
interface MarineData { vessels: Vessel[]; riverData: RiverData; stats: { totalVessels: number; cargo: number; cruise: number; ferry: number }; timestamp: number }

const TYPE_ICONS: Record<string, string> = { cargo: '🚢', cruise: '🛳️', tanker: '⛽', ferry: '⛴️' }

export default function MarineTrafficWidget() {
  const { data, loading, refetch } = useWidget<MarineData>('/api/marinetrafic', 10 * 60 * 1000)

  return (
    <WidgetCard accent="blue" title="Lodná doprava – Dunaj" icon="🚢" onRefresh={refetch}>
      {loading && <SkeletonRows rows={6} />}
      {!loading && data && (
        <div className="space-y-3">
          {/* River conditions */}
          <div className="grid grid-cols-4 gap-1">
            <div className="text-center px-1 py-1.5 rounded-lg bg-blue-500/[0.06] border border-blue-500/10">
              <div className="text-[12px] font-bold text-blue-400">{data.riverData.waterLevel} cm</div>
              <div className="text-[7px] text-slate-500">Hladina</div>
            </div>
            <div className="text-center px-1 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[12px] font-bold text-cyan-400">{data.riverData.flowRate} m³/s</div>
              <div className="text-[7px] text-slate-500">Prietok</div>
            </div>
            <div className="text-center px-1 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[12px] font-bold text-emerald-400">{data.riverData.waterTemp}°C</div>
              <div className="text-[7px] text-slate-500">Teplota</div>
            </div>
            <div className="text-center px-1 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className={`text-[10px] font-bold ${data.riverData.navigation === 'open' ? 'text-green-400' : 'text-amber-400'}`}>
                {data.riverData.navigation === 'open' ? '✅ Otv.' : '⚠️ Obm.'}
              </div>
              <div className="text-[7px] text-slate-500">Plavba</div>
            </div>
          </div>

          {/* Vessels */}
          <div>
            <div className="flex items-center gap-2 text-[9px] text-slate-500 mb-1">
              <span>{data.stats.totalVessels} plavidiel</span>
              <span>🚢 {data.stats.cargo}</span>
              <span>🛳️ {data.stats.cruise}</span>
              <span>⛴️ {data.stats.ferry}</span>
            </div>
            <div className="space-y-0.5 max-h-[220px] overflow-y-auto scrollbar-hide">
              {data.vessels.map((v, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition">
                  <span className="text-lg shrink-0">{TYPE_ICONS[v.type] ?? '🚢'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-white">{v.flag} {v.name}</span>
                      <span className="text-[7px] bg-white/[0.03] text-slate-400 px-1 py-0.5 rounded">{v.type}</span>
                    </div>
                    <div className="text-[8px] text-slate-500">{v.from} → {v.to} · {v.position}</div>
                    {v.cargo && <span className="text-[7px] text-amber-400">📦 {v.cargo}</span>}
                    {v.passengers && <span className="text-[7px] text-blue-400 ml-1">👥 {v.passengers}</span>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] font-mono text-slate-300">{v.speed} kn</div>
                    <div className="text-[8px] text-slate-500">{v.eta}</div>
                    <div className="text-[7px] text-slate-600">{v.direction === 'upstream' ? '⬆️' : '⬇️'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">MarineTraffic · Simulácia · 10 min</p>
    </WidgetCard>
  )
}
