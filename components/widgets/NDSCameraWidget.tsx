'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Camera { name: string; road: string; km: string; direction: string; traffic: string; speed: number; vehicles: number }
interface CameraData { cameras: Camera[]; timestamp: number }

const TRAFFIC_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'Plynulá' },
  moderate: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Stredná' },
  high: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'Vysoká' },
}

export default function NDSCameraWidget() {
  const { data, loading, refetch } = useWidget<CameraData>('/api/ndscameras', 5 * 60 * 1000)

  return (
    <WidgetCard accent="orange" title="Cestné kamery NDS" icon="📹" onRefresh={refetch}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && data && (
        <div className="space-y-1">
          {data.cameras.map((c, i) => {
            const t = TRAFFIC_COLORS[c.traffic] ?? TRAFFIC_COLORS.low
            return (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-slate-200 truncate">{c.name}</div>
                  <div className="text-[8px] text-slate-500">{c.road} km {c.km} · {c.direction}</div>
                </div>
                <div className="text-[10px] font-mono text-slate-400">{c.speed} km/h</div>
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${t.bg} ${t.text}`}>{t.label}</span>
              </div>
            )
          })}
        </div>
      )}
      <p className="text-[8px] text-slate-600 mt-2">NDS · Simulácia</p>
    </WidgetCard>
  )
}
