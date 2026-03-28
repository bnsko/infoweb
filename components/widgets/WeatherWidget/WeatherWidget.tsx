'use client'

import { useWidget } from '@/hooks/useWidget'
import { getWeatherInfo } from '@/lib/utils'
import type { WeatherData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'

export default function WeatherWidget() {
  const { data, loading, error } = useWidget<WeatherData>('/api/weather', 10 * 60 * 1000)

  if (loading) return <WeatherSkeleton />
  if (error || !data?.current) return (
    <WidgetCard accent="blue" title="Počasie · Bratislava" icon="🌤️" className="min-h-[200px]">
      <WidgetError message="Nepodarilo sa načítať počasie." />
    </WidgetCard>
  )

  const c = data.current
  const { label, emoji } = getWeatherInfo(c.weather_code)

  return (
    <WidgetCard accent="blue" className="min-h-[200px] relative overflow-hidden">
      {/* bg gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative">
        <div className="widget-title">
          <span>🌤️</span>
          <span>Počasie · Bratislava</span>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-6xl font-thin text-white leading-none">
              {Math.round(c.temperature_2m)}<span className="text-3xl text-slate-400">°C</span>
            </div>
            <div className="text-sm text-slate-300 mt-1">{label}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Pocitová: {Math.round(c.apparent_temperature)}°C
            </div>
          </div>
          <div className="text-6xl select-none">{emoji}</div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
          <Stat label="Vlhkosť" value={`${c.relative_humidity_2m}%`} />
          <Stat label="Vietor" value={`${Math.round(c.wind_speed_10m)} km/h`} />
          <Stat label="Zrážky" value={`${c.precipitation} mm`} />
        </div>
      </div>
    </WidgetCard>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold text-slate-200 mt-0.5">{value}</div>
    </div>
  )
}

function WeatherSkeleton() {
  return (
    <WidgetCard accent="blue" className="min-h-[200px]">
      <div className="skeleton h-3 w-28 rounded mb-4" />
      <div className="skeleton h-14 w-32 rounded mb-3" />
      <div className="skeleton h-4 w-40 rounded mb-2" />
      <div className="skeleton h-3 w-24 rounded" />
    </WidgetCard>
  )
}
