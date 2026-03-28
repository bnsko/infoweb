'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import type { StatsData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'

const WMO: Record<number, { icon: string; label: string }> = {
  0: { icon: '☀️', label: 'Jasno' }, 1: { icon: '🌤️', label: 'Prevažne jasno' },
  2: { icon: '⛅', label: 'Polojasno' }, 3: { icon: '☁️', label: 'Zamračené' },
  45: { icon: '🌫️', label: 'Hmla' }, 48: { icon: '🌫️', label: 'Námraza' },
  51: { icon: '🌦️', label: 'Mrholenie' }, 53: { icon: '🌦️', label: 'Mrholenie' }, 55: { icon: '🌧️', label: 'Silné mrholenie' },
  61: { icon: '🌧️', label: 'Dážď' }, 63: { icon: '🌧️', label: 'Stredný dážď' }, 65: { icon: '🌧️', label: 'Silný dážď' },
  71: { icon: '🌨️', label: 'Sneženie' }, 73: { icon: '🌨️', label: 'Stredné sneženie' }, 75: { icon: '❄️', label: 'Silné sneženie' },
  77: { icon: '🌨️', label: 'Krúpy' },
  80: { icon: '🌦️', label: 'Prehánky' }, 81: { icon: '🌧️', label: 'Stredné prehánky' }, 82: { icon: '⛈️', label: 'Prudké prehánky' },
  85: { icon: '🌨️', label: 'Snehové prehánky' }, 86: { icon: '❄️', label: 'Silné snehové prehánky' },
  95: { icon: '⛈️', label: 'Búrka' }, 96: { icon: '⛈️', label: 'Búrka s krúpami' }, 99: { icon: '⛈️', label: 'Silná búrka' },
}

function windDirStr(deg: number): string {
  const dirs = ['S', 'SV', 'V', 'JV', 'J', 'JZ', 'Z', 'SZ']
  return dirs[Math.round(deg / 45) % 8]
}

export default function StatsWidget() {
  const { data, loading, refetch } = useWidget<StatsData>('/api/stats', 60 * 1000)
  const { lang } = useLang()

  const cityTemps = data?.cityTemps ?? []
  const sorted = [...cityTemps].sort((a, b) => b.temp - a.temp)
  const hottest = sorted[0]
  const coldest = sorted[sorted.length - 1]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const warnings: { type: string; message: string; severity: string }[] = data?.warnings ?? []

  return (
    <WidgetCard accent="blue" title={lang === 'sk' ? 'Počasie · Slovensko' : 'Weather · Slovakia'} icon="🌤️" onRefresh={refetch}>
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="skeleton h-36 rounded-xl" />)}</div>
      )}
      {!loading && cityTemps.length > 0 && (
        <>
          {/* Weather warnings */}
          {warnings.length > 0 && (
            <div className="mb-3 space-y-1">
              {warnings.map((w, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold border ${
                  w.severity === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                }`}>
                  <span>{w.type === 'wind' ? '💨' : w.type === 'rain' ? '🌧️' : w.type === 'uv' ? '☀️' : w.type === 'heat' ? '🔥' : '❄️'}</span>
                  <span>⚠️ {w.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cityTemps.map(c => {
              const wmo = WMO[c.weatherCode] ?? { icon: '🌡️', label: `Kód ${c.weatherCode}` }
              const wmoTomorrow = c.tomorrowCode != null ? (WMO[c.tomorrowCode] ?? { icon: '🌡️', label: '' }) : { icon: '🌡️', label: '' }
              const tempColor = c.temp >= 25 ? '#f97316' : c.temp >= 15 ? '#fbbf24' : c.temp >= 5 ? '#60a5fa' : c.temp >= 0 ? '#818cf8' : '#c4b5fd'
              const isHottest = hottest?.key === c.key && hottest.key !== coldest?.key
              const isColdest = coldest?.key === c.key && hottest?.key !== coldest?.key
              return (
                <div key={c.key} className="bg-white/[0.02] border border-white/8 rounded-xl p-3 hover:bg-white/[0.04] transition-all relative overflow-hidden">
                  {/* Hottest/Coldest badge */}
                  {(isHottest || isColdest) && (
                    <div className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isHottest ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                    }`}>
                      {isHottest ? '🔺 Najteplejšie' : '🔻 Najchladnejšie'}
                    </div>
                  )}
                  {/* City name + current weather icon */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{wmo.icon}</span>
                    <div>
                      <div className="text-[12px] font-bold text-white">{c.name}</div>
                      <div className="text-[9px] text-slate-500">{wmo.label}</div>
                    </div>
                  </div>
                  {/* Temperature */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold tabular-nums" style={{ color: tempColor }}>{c.temp}°</span>
                    <span className="text-[10px] text-slate-500">({c.feelsLike}°)</span>
                  </div>
                  {/* Min/Max */}
                  <div className="flex items-center gap-3 text-[10px] mb-2">
                    <span className="text-blue-400">🔻 {c.tempMin}°</span>
                    <span className="text-red-400">🔺 {c.tempMax}°</span>
                  </div>
                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px]">
                    <span className="text-slate-500">💨 Vietor</span>
                    <span className="text-slate-300 text-right">{c.windSpeed} km/h {windDirStr(c.windDir)}</span>
                    <span className="text-slate-500">🌡️ Tlak</span>
                    <span className="text-slate-300 text-right">{c.pressure} hPa</span>
                    <span className="text-slate-500">💧 Vlhkosť</span>
                    <span className="text-slate-300 text-right">{c.humidity}%</span>
                    {(c.precipitation ?? 0) > 0 && <>
                      <span className="text-slate-500">🌧️ Zrážky</span>
                      <span className="text-slate-300 text-right">{c.precipitation} mm</span>
                    </>}
                  </div>
                  {/* Tomorrow */}
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[9px]">
                    <span className="text-slate-500">Zajtra: {wmoTomorrow.icon} {c.tomorrowMin}°/{c.tomorrowMax}°</span>
                    {(c.tomorrowPrecipProb ?? 0) > 0 && <span className="text-blue-400">🌧 {c.tomorrowPrecipProb}%</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </WidgetCard>
  )
}
