'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Camera { name: string; road: string; km: string; direction: string; traffic: string; speed: number; vehicles: number }
interface CameraData { cameras: Camera[]; timestamp: number }

const TRAFFIC_INFO: Record<string, { bg: string; text: string; label: string; desc: string; icon: string }> = {
  low: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Plynulá', desc: 'Voľná cesta, kapacita pod 50%', icon: '🟢' },
  moderate: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Stredná', desc: '50-80% kapacity, mierne spomalenia', icon: '🟡' },
  high: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Vysoká', desc: 'Nad 80% kapacity, kolóny a zdržania', icon: '🔴' },
}

export default function NDSCameraWidget() {
  const { data, loading, refetch } = useWidget<CameraData>('/api/ndscameras', 5 * 60 * 1000)

  const cameras = data?.cameras ?? []
  const lowCount = cameras.filter(c => c.traffic === 'low').length
  const modCount = cameras.filter(c => c.traffic === 'moderate').length
  const highCount = cameras.filter(c => c.traffic === 'high').length
  const avgSpeed = cameras.length ? Math.round(cameras.reduce((s, c) => s + c.speed, 0) / cameras.length) : 0
  const totalVehicles = cameras.reduce((s, c) => s + c.vehicles, 0)

  return (
    <WidgetCard accent="orange" title="Cestné kamery NDS" icon="📹" onRefresh={refetch}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && data && (
        <div className="space-y-3">
          {/* Overview stats */}
          <div className="grid grid-cols-4 gap-1.5">
            <div className="text-center px-1.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[13px] font-bold text-white">{cameras.length}</div>
              <div className="text-[7px] text-slate-500">Kamier</div>
            </div>
            <div className="text-center px-1.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[13px] font-bold text-cyan-400">{avgSpeed}</div>
              <div className="text-[7px] text-slate-500">Priem. km/h</div>
            </div>
            <div className="text-center px-1.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[13px] font-bold text-orange-400">{totalVehicles}</div>
              <div className="text-[7px] text-slate-500">Vozidiel</div>
            </div>
            <div className="text-center px-1.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="flex justify-center gap-1">
                <span className="text-[9px] text-green-400 font-bold">{lowCount}</span>
                <span className="text-[9px] text-amber-400 font-bold">{modCount}</span>
                <span className="text-[9px] text-red-400 font-bold">{highCount}</span>
              </div>
              <div className="text-[7px] text-slate-500">🟢🟡🔴</div>
            </div>
          </div>

          {/* Traffic level legend */}
          <div className="flex gap-1">
            {Object.entries(TRAFFIC_INFO).map(([key, t]) => (
              <div key={key} className={`flex-1 rounded-lg px-2 py-1.5 ${t.bg} border border-white/5`}>
                <div className="flex items-center gap-1">
                  <span className="text-[8px]">{t.icon}</span>
                  <span className={`text-[8px] font-bold ${t.text}`}>{t.label}</span>
                </div>
                <div className="text-[7px] text-slate-500 mt-0.5">{t.desc}</div>
              </div>
            ))}
          </div>

          {/* Camera list */}
          <div className="space-y-1">
            {cameras.map((c, i) => {
              const t = TRAFFIC_INFO[c.traffic] ?? TRAFFIC_INFO.low
              return (
                <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-200 truncate">{c.name}</span>
                    </div>
                    <div className="text-[8px] text-slate-500 mt-0.5">
                      {c.road} km {c.km} · {c.direction} · {c.vehicles} vozidiel
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] font-mono font-bold text-slate-300">{c.speed} <span className="text-[8px] text-slate-500">km/h</span></div>
                  </div>
                  <span className={`text-[8px] px-2 py-1 rounded-full font-bold ${t.bg} ${t.text} shrink-0`}>{t.icon} {t.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">NDS · Národná diaľničná spoločnosť · 5 min</p>
    </WidgetCard>
  )
}
