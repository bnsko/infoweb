'use client'

import { useMemo } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { getWeatherInfo, formatShortDate } from '@/lib/utils'
import type { WeatherData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'

// Returns CSS animation class based on WMO weather code
function getWeatherAnimation(code: number): string {
  if (code >= 95) return 'anim-shake'       // thunderstorm
  if (code >= 71) return 'anim-float'       // snow
  if (code >= 51) return 'anim-drop'        // rain/drizzle
  if (code >= 45) return 'anim-sway'        // fog
  if (code >= 3)  return 'anim-float'       // cloudy
  if (code >= 1)  return 'anim-bounce'      // partly cloudy
  return 'anim-bounce'                       // clear
}

interface Tip {
  icon: string
  text: string
  cls: string
}

function generateTips(daily: WeatherData['daily']): Tip[] {
  const tips: Tip[] = []
  const days = ['Dnes', 'Zajtra', 'Pozajtra', 'Za 3 dni']

  for (let i = 0; i < Math.min(4, daily.time.length); i++) {
    const code = daily.weather_code[i]
    const max = Math.round(daily.temperature_2m_max[i])
    const min = Math.round(daily.temperature_2m_min[i])
    const wind = Math.round(daily.wind_speed_10m_max[i])
    const rain = daily.precipitation_sum[i]
    const d = days[i]

    if (code >= 95) {
      tips.push({ icon: '⛈️', text: `${d}: Búrka – vyhni sa otv. priestranstvu`, cls: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' })
    } else if (code >= 85) {
      tips.push({ icon: '🌨️', text: `${d}: Snehové prehánky – opatrne na cestách`, cls: 'bg-sky-400/15 text-sky-300 border-sky-400/30' })
    } else if (code >= 71) {
      tips.push({ icon: '❄️', text: `${d}: Sneženie – počítaj so zdržaním na cestách`, cls: 'bg-blue-400/15 text-blue-300 border-blue-400/30' })
    } else if (code >= 61 && rain >= 5) {
      tips.push({ icon: '☔', text: `${d}: Silný dážď – nezabudni dáždnik a bundu`, cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30' })
    } else if (code >= 51) {
      tips.push({ icon: '🌂', text: `${d}: Mrholenie – odporúčame ľahkú bundu`, cls: 'bg-slate-400/15 text-slate-300 border-slate-400/30' })
    } else if (code <= 2 && max >= 18 && min >= 10) {
      tips.push({ icon: '🌟', text: `${d}: Pekné počasie! Ideálny čas na outdoor`, cls: 'bg-green-500/15 text-green-300 border-green-500/30' })
    }

    if (max >= 30) {
      tips.push({ icon: '🥵', text: `${d}: Horúco (${max}°C) – hydratácia, SPF 50+`, cls: 'bg-orange-500/15 text-orange-300 border-orange-500/30' })
    } else if (min <= -10) {
      tips.push({ icon: '🥶', text: `${d}: Veľký mráz (${min}°C) – obliekaj sa vo vrstvách`, cls: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30' })
    } else if (min < 0) {
      tips.push({ icon: '🧊', text: `${d}: Mráz (${min}°C) – pozor na poľadovicu`, cls: 'bg-sky-300/15 text-sky-200 border-sky-300/30' })
    }

    if (wind >= 60) {
      tips.push({ icon: '💨', text: `${d}: Silný vietor (${wind} km/h) – dávaj pozor vonku`, cls: 'bg-slate-300/15 text-slate-200 border-slate-300/30' })
    }
  }

  if (tips.length === 0) {
    tips.push({ icon: '😊', text: 'Nasledujúce dni vyzerajú príjemne – nič špeciálne si nepripravuj.', cls: 'bg-green-500/15 text-green-300 border-green-500/30' })
  }

  return tips.slice(0, 5)
}

export default function WeatherTipsWidget() {
  const { data, loading } = useWidget<WeatherData>('/api/weather', 10 * 60 * 1000)

  const tips = useMemo(() => {
    if (!data?.daily) return []
    return generateTips(data.daily)
  }, [data])

  const { emoji: currentEmoji, label: currentLabel } = data?.current
    ? getWeatherInfo(data.current.weather_code)
    : { emoji: '🌡️', label: 'Načítanie...' }

  const animClass = data?.current ? getWeatherAnimation(data.current.weather_code) : 'anim-float'

  return (
    <WidgetCard accent="blue" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row gap-5">
        {/* Left – animated current + feels like */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center min-w-[140px] text-center border-b lg:border-b-0 lg:border-r border-white/5 pb-3 lg:pb-0 lg:pr-5">
          <div className="text-6xl select-none mb-1">
            <span className={animClass}>{currentEmoji}</span>
          </div>
          {data?.current ? (
            <>
              <div className="text-3xl font-thin text-white">
                {Math.round(data.current.temperature_2m)}<span className="text-lg text-slate-400">°C</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{currentLabel}</div>
              <div className="mt-2 bg-white/5 rounded-lg px-3 py-1.5">
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">Pocitová teplota</div>
                <div className="text-lg font-semibold text-blue-300">
                  {Math.round(data.current.apparent_temperature)}°C
                </div>
              </div>
            </>
          ) : (
            <div className="skeleton h-8 w-20 rounded mt-2" />
          )}
          <div className="widget-title mt-3 justify-center">
            <span>💡</span>
            <span>Prognóza & tipy</span>
          </div>
        </div>

        {/* Center – feels like per day */}
        {data?.daily && (
          <div className="flex-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Pocitová teplota – najbližšie dni</div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
              {data.daily.time.slice(0, 5).map((day, i) => {
                const { emoji } = getWeatherInfo(data.daily.weather_code[i])
                const max = Math.round(data.daily.temperature_2m_max[i])
                const min = Math.round(data.daily.temperature_2m_min[i])
                // Approximate feels-like from wind chill / heat index heuristic
                const wind = data.daily.wind_speed_10m_max[i]
                const avgTemp = (max + min) / 2
                const feelsLike = avgTemp > 10
                  ? Math.round(avgTemp - wind * 0.07)    // wind-adjusted
                  : Math.round(13.12 + 0.6215 * avgTemp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * avgTemp * Math.pow(wind, 0.16))
                const isToday = i === 0
                return (
                  <div
                    key={day}
                    className={`rounded-xl p-2.5 text-center transition-colors ${
                      isToday ? 'bg-blue-500/15 border border-blue-500/25' : 'bg-white/3 border border-white/5'
                    }`}
                  >
                    <div className={`text-[10px] font-bold uppercase tracking-wide ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>
                      {isToday ? 'Dnes' : formatShortDate(day).split(' ')[0]}
                    </div>
                    <div className="text-xl my-1">{emoji}</div>
                    <div className="text-xs font-bold text-white">{max}° / {min}°</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Pocit: <span className="text-blue-300 font-semibold">{feelsLike}°</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tips */}
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Odporúčania na najbližšie dni</div>
            <div className="flex flex-wrap gap-2">
              {loading && (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-7 w-48 rounded-full" />
                ))
              )}
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border ${tip.cls} font-medium`}
                >
                  <span>{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </WidgetCard>
  )
}
