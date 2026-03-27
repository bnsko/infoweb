'use client'

import { useWidget } from '@/hooks/useWidget'
import { degreesToDirection } from '@/lib/utils'
import type { FlightsResponse } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'

export default function FlightsWidget() {
  const { data, loading, error, refetch } = useWidget<FlightsResponse>('/api/flights', 60 * 1000)

  if (loading) return (
    <WidgetCard accent="cyan" title="Lety nad Slovenskom" icon="✈️" className="h-full" onRefresh={refetch}>
      <SkeletonRows rows={7} cols={2} />
    </WidgetCard>
  )
  if (error || !data) return (
    <WidgetCard accent="cyan" title="Lety nad Slovenskom" icon="✈️" className="h-full" onRefresh={refetch}>
      <WidgetError />
    </WidgetCard>
  )

  const airborne = data.flights.filter((f) => !f.on_ground)

  return (
    <WidgetCard accent="cyan" title="Lety nad Slovenskom" icon="✈️" badge={airborne.length} className="h-full" onRefresh={refetch}>
      {airborne.length === 0 ? (
        <p className="text-slate-500 text-sm">Žiadne aktívne lety.</p>
      ) : (
        <div className="space-y-1 overflow-auto max-h-[280px]">
          <div className="grid grid-cols-4 text-[10px] uppercase tracking-wide text-slate-600 pb-1 border-b border-white/5">
            <span>Volacia zn.</span>
            <span>Krajina</span>
            <span className="text-right">Výška</span>
            <span className="text-right">Rýchlosť</span>
          </div>
          {airborne.slice(0, 15).map((f) => (
            <div key={f.icao24} className="grid grid-cols-4 items-center py-1 border-b border-white/4 last:border-0">
              <div className="flex items-center gap-1">
                <span className="text-cyan-400 text-xs font-mono font-bold leading-none">
                  {f.callsign || '—'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 truncate">{f.origin_country}</span>
              <span className="text-[11px] text-slate-300 text-right font-mono">
                {f.altitude != null ? `${Math.round(f.altitude)} m` : '—'}
              </span>
              <span className="text-[11px] text-slate-300 text-right font-mono">
                {f.velocity != null ? `${f.velocity} km/h` : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">OpenSky Network · aktualizácia 1 min</p>
    </WidgetCard>
  )
}
