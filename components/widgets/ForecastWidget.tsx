'use client'

import { useWidget } from '@/hooks/useWidget'
import { getWeatherInfo, formatShortDate } from '@/lib/utils'
import type { WeatherData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'

export default function ForecastWidget() {
  const { data, loading, error } = useWidget<WeatherData>('/api/weather', 10 * 60 * 1000)

  if (loading) return <ForecastSkeleton />
  if (error || !data?.daily) return (
    <WidgetCard accent="blue" title="7-dňová predpoveď" icon="📅" className="h-full">
      <WidgetError />
    </WidgetCard>
  )

  const { daily } = data

  return (
    <WidgetCard accent="blue" title="7-dňová predpoveď" icon="📅" className="h-full">
      <div className="grid grid-cols-7 gap-1">
        {daily.time.map((day, i) => {
          const { emoji } = getWeatherInfo(daily.weather_code[i])
          const isToday = i === 0
          return (
            <div
              key={day}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-colors ${
                isToday ? 'bg-blue-500/15 border border-blue-500/20' : 'hover:bg-white/4'
              }`}
            >
              <div className={`text-[10px] font-semibold uppercase tracking-wide ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>
                {isToday ? 'Dnes' : formatShortDate(day).split(' ')[0]}
              </div>
              <div className="text-xl my-0.5">{emoji}</div>
              <div className="text-xs font-bold text-white">{Math.round(daily.temperature_2m_max[i])}°</div>
              <div className="text-xs text-slate-500">{Math.round(daily.temperature_2m_min[i])}°</div>
              {daily.precipitation_sum[i] > 0 && (
                <div className="text-[9px] text-blue-400 mt-0.5">
                  💧{daily.precipitation_sum[i].toFixed(1)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </WidgetCard>
  )
}

function ForecastSkeleton() {
  return (
    <WidgetCard accent="blue" className="h-full">
      <div className="skeleton h-3 w-28 rounded mb-4" />
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-2">
            <div className="skeleton h-3 w-8 rounded" />
            <div className="skeleton h-6 w-6 rounded" />
            <div className="skeleton h-3 w-6 rounded" />
            <div className="skeleton h-3 w-6 rounded" />
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
