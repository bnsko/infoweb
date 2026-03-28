'use client'

import { useWidget } from '@/hooks/useWidget'
import { getAQIInfo } from '@/lib/utils'
import type { AirQualityData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'

export default function AirQualityWidget() {
  const { data, loading, error } = useWidget<AirQualityData>('/api/airquality', 10 * 60 * 1000)

  if (loading) return (
    <WidgetCard accent="green" title="Kvalita ovzdušia · BA" icon="💨">
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-4 rounded" />
        ))}
      </div>
    </WidgetCard>
  )
  if (error || !data?.current) return (
    <WidgetCard accent="green" title="Kvalita ovzdušia · BA" icon="💨">
      <WidgetError />
    </WidgetCard>
  )

  const c = data.current
  const aqi = getAQIInfo(c.european_aqi)

  return (
    <WidgetCard accent="green" title="Kvalita ovzdušia · BA" icon="💨">
      {/* AQI badge */}
      <div
        className="flex items-center justify-between rounded-xl p-3 mb-3"
        style={{ background: aqi.bg }}
      >
        <div>
          <div className="text-xs text-slate-400">Európsky AQI</div>
          <div className="text-2xl font-bold" style={{ color: aqi.color }}>
            {c.european_aqi}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold" style={{ color: aqi.color }}>
            {aqi.label}
          </div>
          <div className="text-xs text-slate-500">Bratislava</div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2">
        <PollutantRow label="PM2.5" value={`${c.pm2_5?.toFixed(1)} µg/m³`} />
        <PollutantRow label="PM10" value={`${c.pm10?.toFixed(1)} µg/m³`} />
        <PollutantRow label="Ozón" value={`${c.ozone?.toFixed(0)} µg/m³`} />
        <PollutantRow label="NO₂" value={`${c.nitrogen_dioxide?.toFixed(1)} µg/m³`} />
      </div>
      <p className="text-[10px] text-slate-600 mt-2">OpenMeteo Air Quality</p>
    </WidgetCard>
  )
}

function PollutantRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/3 rounded-lg p-2">
      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-xs font-mono font-semibold text-slate-200 mt-0.5">{value}</div>
    </div>
  )
}
