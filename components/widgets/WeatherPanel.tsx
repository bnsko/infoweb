'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { getWeatherInfo, formatShortDate } from '@/lib/utils'
import type { WeatherData, StatsData } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import { useLang } from '@/hooks/useLang'

function getWeatherAnimation(code: number): string {
  if (code >= 95) return 'anim-shake'
  if (code >= 71) return 'anim-float'
  if (code >= 51) return 'anim-drop'
  if (code >= 3)  return 'anim-float'
  return 'anim-bounce'
}

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

function uvColor(uv: number): string {
  if (uv <= 2) return '#4ade80'
  if (uv <= 5) return '#fbbf24'
  if (uv <= 7) return '#f97316'
  if (uv <= 10) return '#ef4444'
  return '#a855f7'
}

function degreesToCompass(deg: number): string {
  const dirs = ['S', 'SV', 'V', 'JV', 'J', 'JZ', 'Z', 'SZ']
  return dirs[Math.round(deg / 45) % 8]
}

/* ── Wind Direction Arrow ─────────────────────────────────────────────── */
function WindArrow({ degrees, className = '' }: { degrees: number; className?: string }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 18 18"
      className={`inline-block transition-transform duration-500 ${className}`}
      style={{ transform: `rotate(${degrees}deg)` }}
    >
      <path d="M9 1 L12 9 L10.5 9 L10.5 17 L7.5 17 L7.5 9 L6 9 Z" fill="currentColor" />
    </svg>
  )
}

/* ── Sunrise/Sunset Arc (proper SVG ellipse) ─────────────────────────── */
function SunriseSunset({ sunrise, sunset, nightLabel }: { sunrise: string; sunset: string; nightLabel: string }) {
  const [nowMs, setNowMs] = useState<number | null>(null)

  useEffect(() => {
    setNowMs(Date.now())
    const iv = setInterval(() => setNowMs(Date.now()), 30_000)
    return () => clearInterval(iv)
  }, [])

  const riseMs  = new Date(sunrise).getTime()
  const setMs   = new Date(sunset).getTime()
  const total   = setMs - riseMs
  const nowTime = nowMs ?? riseMs
  const elapsed = Math.max(0, Math.min(total, nowTime - riseMs))
  const progress = total > 0 ? elapsed / total : 0
  const isDay   = nowMs !== null && nowTime >= riseMs && nowTime <= setMs

  const dH = Math.floor(total / 3600000)
  const dM = Math.floor((total % 3600000) / 60000)

  // SVG layout params
  const W = 300, H = 90, pad = 22
  const cx = W / 2
  const horizY = H - 14
  const rx = (W - 2 * pad) / 2   // 128
  const ry = 58
  const leftX  = cx - rx          // 22
  const rightX = cx + rx          // 278

  // Sun position: angle goes from π (left/sunrise) to 0 (right/sunset)
  const angle  = Math.PI * (1 - progress)
  const sunX   = cx + rx * Math.cos(angle)
  const sunY   = horizY - ry * Math.sin(angle)

  // Full arc built as two halves (avoids SVG large-arc 180° ambiguity)
  const midX   = cx
  const midTopY = horizY - ry
  const arcPath = `M ${leftX} ${horizY} A ${rx} ${ry} 0 0 1 ${midX} ${midTopY} A ${rx} ${ry} 0 0 1 ${rightX} ${horizY}`

  // Clip progress: show arc up to sun position
  const clipW = Math.max(1, progress >= 0.999 ? W : sunX + 2)

  return (
    <div className="bg-gradient-to-b from-slate-800/40 to-slate-900/20 border border-white/8 rounded-2xl p-3">
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full" style={{ maxHeight: 130 }}>
        <defs>
          <radialGradient id="ss-sun-rg" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#fde68a" />
            <stop offset="65%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ss-arc-g" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="50%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.35" />
          </linearGradient>
          <clipPath id="ss-clip">
            <rect x={0} y={0} width={clipW} height={H + 22} />
          </clipPath>
        </defs>

        {/* Horizon */}
        <line x1={leftX - 6} y1={horizY} x2={rightX + 6} y2={horizY}
              stroke="rgba(255,255,255,0.10)" strokeWidth={1} />

        {/* Full dotted arc */}
        <path d={arcPath} fill="none"
              stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} strokeDasharray="4 5" />

        {/* Glow beneath progress arc */}
        {progress > 0.02 && (
          <path d={arcPath} fill="none" stroke="#fbbf24" strokeWidth={16}
                opacity={0.035} clipPath="url(#ss-clip)" />
        )}

        {/* Progress arc */}
        {progress > 0.02 && (
          <path d={arcPath} fill="none" stroke="url(#ss-arc-g)"
                strokeWidth={2.5} strokeLinecap="round" clipPath="url(#ss-clip)" />
        )}

        {/* Sun or Moon */}
        {isDay ? (
          <>
            <circle cx={sunX} cy={sunY} r={18} fill="#fbbf24" opacity={0.06} />
            <circle cx={sunX} cy={sunY} r={11} fill="#fbbf24" opacity={0.10} />
            <circle cx={sunX} cy={sunY} r={6.5} fill="url(#ss-sun-rg)" />
            <circle cx={sunX} cy={sunY} r={4}   fill="#fde68a" />
          </>
        ) : (
          <g>
            <text x={W / 2} y={horizY - 22} textAnchor="middle" fontSize={22} opacity={0.55}>🌙</text>
            <text x={W / 2} y={horizY - 4}  textAnchor="middle" fontSize={10} fill="#64748b">{nightLabel}</text>
          </g>
        )}

        {/* Labels */}
        <text x={leftX}  y={horizY + 11} textAnchor="start" fontSize={9} fill="#fbbf24" fontWeight="600">↗ {formatTime(sunrise)}</text>
        <text x={rightX} y={horizY + 11} textAnchor="end"   fontSize={9} fill="#fb923c" fontWeight="600">{formatTime(sunset)} ↘</text>
        <text x={W / 2}  y={horizY + 23} textAnchor="middle" fontSize={10} fill="#f59e0b" fontWeight="700">☀ {dH}h {dM}m</text>
      </svg>
    </div>
  )
}

/* ── Slovakia Temperature Map ─────────────────────────────────────────── */
function SlovakiaTempMap({ cityTemps }: { cityTemps: { key: string; name: string; temp: number }[] }) {
  // Equirectangular projection for Slovakia
  // Lon range: 16.84 – 22.56  Lat range: 47.73 – 49.61
  const W = 380, H = 128
  const LON_MIN = 16.84, LON_SPAN = 5.72
  const LAT_MAX = 49.61, LAT_SPAN = 1.88
  const UW = W - 20, UH = H - 20  // usable area

  const toX = (lon: number) => Math.round((lon - LON_MIN) / LON_SPAN * UW + 10)
  const toY = (lat: number) => Math.round((LAT_MAX - lat) / LAT_SPAN * UH + 10)

  const CITY_POS: Record<string, { x: number; y: number }> = {
    BA:    { x: toX(17.1077), y: toY(48.1486) },  // ~(27, 95)
    TT:    { x: toX(17.5872), y: toY(48.3774) },  // ~(57, 82)
    NR:    { x: toX(18.0869), y: toY(48.3069) },  // ~(89, 86)
    TN:    { x: toX(18.0435), y: toY(48.8947) },  // ~(86, 52)
    BB:    { x: toX(19.1503), y: toY(48.7356) },  // ~(155, 61)
    ZA:    { x: toX(18.7394), y: toY(49.2231) },  // ~(130, 33)
    PO:    { x: toX(21.2391), y: toY(49.0017) },  // ~(287, 46)
    KE:    { x: toX(21.2611), y: toY(48.7163) },  // ~(288, 62)
    TATRY: { x: toX(20.2129), y: toY(49.1972) },  // ~(222, 34)
  }

  function tempColor(t: number): string {
    if (t >= 28) return '#ef4444'
    if (t >= 22) return '#f97316'
    if (t >= 15) return '#fbbf24'
    if (t >= 8)  return '#4ade80'
    if (t >= 0)  return '#60a5fa'
    if (t >= -8) return '#818cf8'
    return '#c4b5fd'
  }

  // Approximate Slovakia border polygon (clockwise from W)
  const borderPath = 'M 10,98 L 22,66 L 47,48 L 64,34 L 93,22 L 124,14 L 193,10 L 225,21 L 291,14 L 335,16 L 360,52 L 344,84 L 272,101 L 209,119 L 114,119 L 67,119 L 30,104 Z'

  if (cityTemps.length === 0) return null

  return (
    <div className="px-5 pb-4">
      <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mb-2">
        🗺️ Teploty na Slovensku
      </div>
      <div className="bg-white/[0.02] rounded-xl border border-white/5 p-1 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 128 }}>
          {/* Slovakia fill */}
          <path d={borderPath} fill="rgba(30,58,138,0.18)" stroke="rgba(147,197,253,0.28)" strokeWidth={1.5} />

          {/* City temperature dots */}
          {cityTemps.map(city => {
            const pos = CITY_POS[city.key]
            if (!pos) return null
            const color = tempColor(city.temp)
            const label = city.key === 'TATRY' ? 'TT' : city.key
            return (
              <g key={city.key}>
                <circle cx={pos.x} cy={pos.y} r={14} fill={color} opacity={0.10} />
                <circle cx={pos.x} cy={pos.y} r={9}  fill={color} opacity={0.22} stroke={color} strokeWidth={1} />
                <circle cx={pos.x} cy={pos.y} r={4}  fill={color} />
                <text x={pos.x} y={pos.y - 13} textAnchor="middle" fontSize={7.5}
                      fill="rgba(255,255,255,0.55)" fontWeight="600">{label}</text>
                <text x={pos.x} y={pos.y + 21} textAnchor="middle" fontSize={9}
                      fill={color} fontWeight="700">
                  {city.temp}°
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/* ── Temperature range bar ──────────────────────────────────────────── */
function TempBar({ min, max, absMin, absMax }: { min: number; max: number; absMin: number; absMax: number }) {
  const range = absMax - absMin || 1
  const left = ((min - absMin) / range) * 100
  const width = ((max - min) / range) * 100

  return (
    <div className="relative h-1 rounded-full bg-white/5 w-full">
      <div
        className="absolute h-1 rounded-full"
        style={{
          left: `${left}%`,
          width: `${Math.max(width, 4)}%`,
          background: `linear-gradient(90deg, #60a5fa, #f97316)`,
          opacity: 0.7,
        }}
      />
    </div>
  )
}

/* ── Main WeatherPanel ──────────────────────────────────────────────── */
export default function WeatherPanel() {
  const { t, lang } = useLang()
  const { data, loading, refetch } = useWidget<WeatherData>('/api/weather', 10 * 60 * 1000)
  const stats = useWidget<StatsData>('/api/stats', 60 * 1000)
  const [showExtended, setShowExtended] = useState(false)

  const currentInfo = data?.current ? getWeatherInfo(data.current.weather_code) : null
  const animClass   = data?.current ? getWeatherAnimation(data.current.weather_code) : 'anim-float'
  const todayUVMax  = data?.daily?.uv_index_max?.[0] ?? null

  const daysToShow = showExtended ? (data?.daily?.time.length ?? 14) : 7

  const allMins = data?.daily?.temperature_2m_min?.slice(0, daysToShow) ?? []
  const allMaxs = data?.daily?.temperature_2m_max?.slice(0, daysToShow) ?? []
  const absMin = allMins.length ? Math.min(...allMins) : 0
  const absMax = allMaxs.length ? Math.max(...allMaxs) : 30

  const windDir = data?.current?.wind_direction_10m ?? 0
  const windCompass = degreesToCompass(windDir)

  const cityTemps = stats.data?.cityTemps ?? []

  return (
    <WidgetCard accent="blue" className="relative overflow-hidden !p-0" onRefresh={refetch}>
      {loading ? (
        <div className="p-5">
          <div className="flex gap-4 items-center py-4">
            <div className="skeleton h-20 w-32 rounded-xl" />
            <div className="flex-1 grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
            </div>
          </div>
        </div>
      ) : data?.current ? (
        <div>
          {/* ── Hero section ─────────────────────────────────────────────── */}
          <div className="relative px-5 pt-5 pb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/3 pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-start gap-5">

              {/* Left: Big temp display */}
              <div className="flex items-start gap-4 shrink-0">
                <div className="relative">
                  <span className={`text-7xl select-none block ${animClass}`} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
                    {currentInfo?.emoji}
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-extralight text-white tracking-tighter">
                      {Math.round(data.current.temperature_2m)}
                    </span>
                    <span className="text-3xl font-light text-slate-500">°C</span>
                  </div>
                  <div className="text-sm font-medium text-slate-300 mt-0.5">{currentInfo?.label}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-slate-500">
                      {t('weather.feels')} <span className="text-slate-300">{Math.round(data.current.apparent_temperature)}°</span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      💧 <span className="text-slate-300">{data.current.relative_humidity_2m}%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle: Quick stats pills */}
              <div className="flex flex-wrap gap-2 lg:mt-1 flex-1">
                <Pill icon="💨" label={t('weather.wind')} value={`${Math.round(data.current.wind_speed_10m)} km/h`} />
                <Pill
                  icon={<WindArrow degrees={windDir} className="text-sky-300" />}
                  label={lang === 'sk' ? 'Smer' : 'Dir'}
                  value={`${windCompass} ${windDir}°`}
                />
                <Pill icon="🌧️" label={t('weather.precip')} value={`${data.current.precipitation} mm`} />
                {todayUVMax !== null && (
                  <Pill icon="☀️" label="UV" value={`${todayUVMax.toFixed(1)}`} valueColor={uvColor(todayUVMax)} />
                )}
                {data.daily?.temperature_2m_max?.[0] != null && (
                  <Pill icon="🌡️" label={t('weather.maxMin')}
                    value={`${Math.round(data.daily.temperature_2m_max[0])}°/${Math.round(data.daily.temperature_2m_min[0])}°`} />
                )}
                {data.current.surface_pressure != null && (
                  <Pill icon="🌀" label={lang === 'sk' ? 'Tlak' : 'Pressure'} value={`${Math.round(data.current.surface_pressure)} hPa`} />
                )}
                {data.current.cloud_cover != null && (
                  <Pill icon="☁️" label={lang === 'sk' ? 'Oblačnosť' : 'Cloud'} value={`${data.current.cloud_cover}%`} />
                )}
              </div>

              {/* Right: Sunrise/Sunset arc */}
              <div className="lg:ml-auto flex-shrink-0 lg:w-80">
                {data.daily?.sunrise?.[0] && data.daily?.sunset?.[0] && (
                  <SunriseSunset sunrise={data.daily.sunrise[0]} sunset={data.daily.sunset[0]} nightLabel={t('weather.night')} />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span>🌤️ {t('weather.title')}</span>
                <span className="text-slate-700">·</span>
                <span>OpenMeteo</span>
              </div>
              <button
                onClick={() => setShowExtended(!showExtended)}
                className="text-[10px] font-semibold px-3 py-1 rounded-lg border border-white/8 text-slate-400 hover:text-slate-200 hover:border-white/15 transition-all"
              >
                {showExtended ? t('weather.7days') : t('weather.14days')}
              </button>
            </div>
          </div>

          {/* ── Slovakia temp map ──────────────────────────────────────── */}
          {cityTemps.length > 0 && <SlovakiaTempMap cityTemps={cityTemps} />}

          {/* ── Forecast grid — FIXED (no scroll) ─────────────────────── */}
          <div className="px-5 pb-5">
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${daysToShow}, minmax(0, 1fr))` }}
            >
              {data.daily?.time.slice(0, daysToShow).map((day, i) => {
                const { emoji } = getWeatherInfo(data.daily.weather_code[i])
                const max = Math.round(data.daily.temperature_2m_max[i])
                const min = Math.round(data.daily.temperature_2m_min[i])
                const isToday = i === 0
                const rain = data.daily.precipitation_sum[i]
                return (
                  <div
                    key={day}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-center transition-all ${
                      isToday
                        ? 'bg-gradient-to-b from-blue-500/10 to-blue-500/5 border border-blue-500/15 shadow-sm shadow-blue-500/5'
                        : 'bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`text-[9px] font-semibold uppercase tracking-wide leading-none ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>
                      {isToday ? (lang === 'sk' ? 'Dnes' : 'Today') : formatShortDate(day).slice(0, 5)}
                    </div>
                    <div className="text-xl my-0.5 leading-none">{emoji}</div>
                    <div className="text-[11px] font-bold text-white leading-none">{max}°</div>
                    <TempBar min={min} max={max} absMin={absMin} absMax={absMax} />
                    <div className="text-[10px] text-slate-500 leading-none">{min}°</div>
                    {rain > 0 && (
                      <div className="text-[8px] text-blue-400/80 leading-tight mt-0.5">
                        {rain.toFixed(1)}mm
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </WidgetCard>
  )
}

function Pill({ icon, label, value, valueColor }: {
  icon: string | React.ReactNode; label: string; value: string; valueColor?: string
}) {
  return (
    <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 rounded-lg px-2.5 py-1.5">
      <span className="text-xs shrink-0">{icon}</span>
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className="text-[11px] font-semibold" style={{ color: valueColor ?? 'var(--color-body)' }}>{value}</span>
    </div>
  )
}

function uvLabel(uv: number): string {
  // Note: actual translation happens in JSX via t() calls
  if (uv <= 2) return 'weather.uvLow'
  if (uv <= 5) return 'weather.uvMed'
  if (uv <= 7) return 'weather.uvHigh'
  if (uv <= 10) return 'weather.uvVeryHigh'
  return 'weather.uvExtreme'
}
