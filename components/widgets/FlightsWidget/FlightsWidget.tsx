'use client'

import { useWidget } from '@/hooks/useWidget'
import { degreesToDirection } from '@/lib/utils'
import type { FlightsResponse, Flight } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { useLang } from '@/hooks/useLang'

interface FlightExt extends Flight {
  origin?: string | null
  destination?: string | null
}

export default function FlightsWidget() {
  const { t, lang } = useLang()
  const { data, loading, error, refetch } = useWidget<FlightsResponse>('/api/flights', 60 * 1000)

  if (loading) return (
    <WidgetCard accent="cyan" title={t('flights.title')} icon="✈️" className="h-full" onRefresh={refetch}>
      <SkeletonRows rows={7} cols={2} />
    </WidgetCard>
  )
  if (error || !data) return (
    <WidgetCard accent="cyan" title={t('flights.title')} icon="✈️" className="h-full" onRefresh={refetch}>
      <WidgetError />
    </WidgetCard>
  )

  const flights = data.flights

  return (
    <WidgetCard accent="cyan" title={t('flights.title')} icon="✈️" badge={data.count} className="h-full" onRefresh={refetch}>
      {flights.length === 0 ? (
        <p className="text-slate-500 text-sm">{t('flights.noFlights')}</p>
      ) : (
        <div className="space-y-1 max-h-[280px] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-5 text-[10px] uppercase tracking-wide text-slate-600 pb-1 border-b border-white/5 sticky top-0 bg-[var(--bg-card)] z-[1]">
            <span>{t('flights.callsign')}</span>
            <span>{t('flights.country')}</span>
            <span className="col-span-2">{lang === 'sk' ? 'Trasa' : 'Route'}</span>
            <span className="text-right">{t('flights.alt')}</span>
          </div>
          {flights.slice(0, 20).map((f) => (
            <div key={f.icao24} className="grid grid-cols-5 items-center py-1 border-b border-white/4 last:border-0">
              <div className="flex items-center gap-1">
                <span className="text-cyan-400 text-xs font-mono font-bold leading-none">
                  {f.callsign || '—'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 truncate">{f.origin_country}</span>
              <span className="col-span-2 text-[10px] text-slate-300 truncate">
                {(f as FlightExt).origin && (f as FlightExt).destination
                  ? <><span className="text-cyan-400 font-mono">{(f as FlightExt).origin}</span><span className="text-slate-500 mx-1">→</span><span className="text-cyan-400 font-mono">{(f as FlightExt).destination}</span></>
                  : f.true_track != null
                    ? <span className="text-slate-500">→ {degreesToDirection(f.true_track)}{f.velocity ? ` · ${f.velocity} km/h` : ''}</span>
                    : <span className="text-slate-600">—</span>
                }
              </span>
              <span className="text-[11px] text-slate-300 text-right font-mono">
                {f.altitude != null ? `${Math.round(f.altitude)} m` : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">{t('flights.source')}</p>
    </WidgetCard>
  )
}
