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
  const W = 560, H = 200

  // Equirectangular projection
  const LON_MIN = 16.84, LON_SPAN = 5.72
  const LAT_MAX = 49.61, LAT_SPAN = 1.88
  const PAD_X = 28, PAD_Y = 18
  const UW = W - 2 * PAD_X, UH = H - 2 * PAD_Y

  const toX = (lon: number) => (lon - LON_MIN) / LON_SPAN * UW + PAD_X
  const toY = (lat: number) => (LAT_MAX - lat) / LAT_SPAN * UH + PAD_Y

  // Improved Slovakia outline — ~50 control points, clockwise from SW
  const pts: [number, number][] = [
    [16.84, 48.25],[16.90, 47.96],[17.07, 47.87],[17.18, 47.76],[17.44, 47.76],
    [17.62, 47.76],[17.80, 47.75],[18.07, 47.76],[18.30, 47.75],[18.62, 47.74],
    [18.84, 47.77],[19.06, 47.75],[19.30, 47.75],[19.54, 47.76],[19.84, 47.76],
    [20.10, 47.76],[20.38, 47.75],[20.66, 47.75],[20.88, 47.76],[21.26, 47.76],
    [21.56, 47.78],[21.76, 47.85],[21.82, 48.00],[22.00, 48.10],[22.54, 48.36],
    [22.56, 48.63],[22.36, 48.95],[21.84, 49.27],[21.30, 49.36],[21.00, 49.44],
    [20.56, 49.39],[20.22, 49.41],[20.07, 49.18],[19.98, 49.20],[19.74, 49.20],
    [19.50, 49.20],[19.38, 49.52],[18.96, 49.52],[18.76, 49.47],[18.54, 49.52],
    [18.24, 49.52],[17.88, 49.52],[17.52, 49.10],[17.30, 48.88],[17.08, 48.84],
    [16.94, 48.62],[16.84, 48.40],[16.84, 48.25],
  ]
  const borderPath = 'M ' + pts.map(([lon, lat]) => `${toX(lon).toFixed(1)},${toY(lat).toFixed(1)}`).join(' L ') + ' Z'

  // River Danube (approximate)
  const danubePts: [number, number][] = [
    [16.84, 47.96],[17.18, 47.76],[17.62, 47.76],[18.07, 47.76],
    [18.62, 47.74],[19.06, 47.75],[19.54, 47.76],[20.10, 47.76],[20.66, 47.75],
  ]
  const danubePath = 'M ' + danubePts.map(([lon, lat]) => `${toX(lon).toFixed(1)},${toY(lat).toFixed(1)}`).join(' L ')

  const CITY_COORDS: Record<string, [number, number]> = {
    BA:    [17.1077, 48.1486],
    TT:    [17.5872, 48.3774],
    NR:    [18.0869, 48.3069],
    TN:    [18.0435, 48.8947],
    BB:    [19.1503, 48.7356],
    ZA:    [18.7394, 49.2231],
    PO:    [21.2391, 49.0017],
    KE:    [21.2611, 48.7163],
    TATRY: [20.2129, 49.1972],
  }

  const CITY_NAMES: Record<string, string> = {
    BA: 'Bratislava', TT: 'Trnava', NR: 'Nitra', TN: 'Trenčín',
    BB: 'B. Bystrica', ZA: 'Žilina', PO: 'Prešov', KE: 'Košice', TATRY: 'Tat. Tatry',
  }

  function tempColor(t: number): string {
    if (t >= 30) return '#ef4444'
    if (t >= 25) return '#f97316'
    if (t >= 20) return '#fb923c'
    if (t >= 15) return '#fbbf24'
    if (t >= 10) return '#86efac'
    if (t >= 5)  return '#4ade80'
    if (t >= 0)  return '#60a5fa'
    if (t >= -5) return '#818cf8'
    return '#c4b5fd'
  }

  if (cityTemps.length === 0) return null

  return (
    <div className="px-5 pb-4">
      <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mb-2">
        🗺️ Teploty na Slovensku
      </div>
      <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(17,24,50,0.95) 100%)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
          <defs>
            <radialGradient id="sk-glow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <filter id="sk-blur">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
          </defs>

          {/* Background glow */}
          <ellipse cx={W/2} cy={H/2} rx={W*0.48} ry={H*0.45} fill="url(#sk-glow)" />

          {/* Slovakia fill with gradient */}
          <path d={borderPath} fill="rgba(30,60,114,0.25)" />

          {/* Slovakia border */}
          <path d={borderPath} fill="none" stroke="rgba(147,197,253,0.5)" strokeWidth={1.5} strokeLinejoin="round" />

          {/* Danube river hint */}
          <path d={danubePath} fill="none" stroke="rgba(96,165,250,0.2)" strokeWidth={1} strokeDasharray="3 3" />

          {/* City temperature bubbles */}
          {cityTemps.map(city => {
            const coords = CITY_COORDS[city.key]
            if (!coords) return null
            const cx = toX(coords[0])
            const cy = toY(coords[1])
            const color = tempColor(city.temp)
            const name = CITY_NAMES[city.key] ?? city.key
            const isShort = name.length <= 7

            return (
              <g key={city.key}>
                {/* Glow ring */}
                <circle cx={cx} cy={cy} r={20} fill={color} opacity={0.06} filter="url(#sk-blur)" />
                <circle cx={cx} cy={cy} r={13} fill={color} opacity={0.12} />
                <circle cx={cx} cy={cy} r={7}  fill={color} opacity={0.35} stroke={color} strokeWidth={1} />
                <circle cx={cx} cy={cy} r={3.5} fill={color} />

                {/* City name */}
                <text x={cx} y={cy - 18} textAnchor="middle" fontSize={isShort ? 8 : 7}
                      fill="rgba(255,255,255,0.70)" fontWeight="700" letterSpacing="0.3">{name}</text>

                {/* Temperature */}
                <text x={cx} y={cy + 24} textAnchor="middle" fontSize={10.5}
                      fill={color} fontWeight="800">{city.temp > 0 ? city.temp : city.temp}°</text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

/* ── Temperature & Precipitation Charts ─────────────────────────────── */
function ForecastCharts({ daily }: { daily: import('@/lib/types').WeatherDaily }) {
  const days = daily.time.length > 14 ? 14 : daily.time.length
  if (days < 3) return null

  const maxTemps  = daily.temperature_2m_max.slice(0, days)
  const minTemps  = daily.temperature_2m_min.slice(0, days)
  const precips   = daily.precipitation_sum.slice(0, days)
  const codes     = daily.weather_code.slice(0, days)
  const times     = daily.time.slice(0, days)

  const W = 600, TH = 90, PH = 50
  const PX = 12, PY_T = 10, PY_B = 14
  const chartW = W - 2 * PX
  const stepX = chartW / (days - 1)

  const allT = [...maxTemps, ...minTemps]
  const tMin = Math.min(...allT) - 2
  const tMax = Math.max(...allT) + 2
  const tRange = tMax - tMin || 1

  const pMax = Math.max(...precips, 0.5)

  const toTX = (i: number) => PX + i * stepX
  const toTY = (t: number) => PY_T + (1 - (t - tMin) / tRange) * (TH - PY_T - PY_B)
  const toBarH = (p: number) => (p / pMax) * (PH - 14)

  const maxLine   = 'M ' + maxTemps.map((t, i) => `${toTX(i).toFixed(1)},${toTY(t).toFixed(1)}`).join(' L ')
  const minLine   = 'M ' + minTemps.map((t, i) => `${toTX(i).toFixed(1)},${toTY(t).toFixed(1)}`).join(' L ')

  // Area between max and min
  const areaPath  = 'M ' + maxTemps.map((t, i) => `${toTX(i).toFixed(1)},${toTY(t).toFixed(1)}`).join(' L ')
    + ' L ' + [...minTemps].reverse().map((t, i) => `${toTX(days-1-i).toFixed(1)},${toTY(t).toFixed(1)}`).join(' L ') + ' Z'

  const today = times[0]
  const labels = times.map(d => {
    const date = new Date(d)
    if (d === today) return 'dnes'
    return date.toLocaleDateString('sk-SK', { weekday: 'short' }).slice(0, 2)
  })

  return (
    <div className="px-5 pb-5 space-y-3">
      {/* Temperature chart */}
      <div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mb-1.5">🌡️ Teplota — 14 dní (°C)</div>
        <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
          <svg viewBox={`0 0 ${W} ${TH + 18}`} className="w-full" style={{ maxHeight: 110 }}>
            <defs>
              <linearGradient id="fg-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.06" />
              </linearGradient>
            </defs>

            {/* Zero line if temps span 0 */}
            {tMin < 0 && tMax > 0 && (
              <line x1={PX} x2={W - PX} y1={toTY(0)} y2={toTY(0)}
                    stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="3 4" />
            )}

            {/* Area fill */}
            <path d={areaPath} fill="url(#fg-area)" />

            {/* Min line */}
            <path d={minLine} fill="none" stroke="#60a5fa" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            {/* Max line */}
            <path d={maxLine} fill="none" stroke="#f97316" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

            {/* Temp labels + day labels */}
            {maxTemps.map((t, i) => (
              <g key={i}>
                <text x={toTX(i)} y={toTY(t) - 4} textAnchor="middle" fontSize={8.5}
                      fill="#f97316" fontWeight="700">{t > 0 ? `+${t}` : t}°</text>
                <text x={toTX(i)} y={TH + 12} textAnchor="middle" fontSize={8.5}
                      fill={i === 0 ? '#a78bfa' : 'rgba(100,116,139,0.9)'} fontWeight={i === 0 ? '800' : '500'}>
                  {labels[i]}
                </text>
              </g>
            ))}
            {minTemps.map((t, i) => (
              <text key={i} x={toTX(i)} y={toTY(t) + 12} textAnchor="middle" fontSize={8}
                    fill="#60a5fa" fontWeight="600">{t}°</text>
            ))}
          </svg>
        </div>
      </div>

      {/* Precipitation chart */}
      <div>
        <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mb-1.5">🌧️ Zrážky — 14 dní (mm)</div>
        <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
          <svg viewBox={`0 0 ${W} ${PH}`} className="w-full" style={{ maxHeight: 60 }}>
            <defs>
              <linearGradient id="fg-rain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {precips.map((p, i) => {
              const bw = (chartW / days) * 0.55
              const x = PX + i * (chartW / days) + (chartW / days) * 0.225
              const bh = toBarH(p)
              const y  = PH - 12 - bh
              return (
                <g key={i}>
                  <rect x={x} y={y} width={bw} height={bh} rx={2} fill="url(#fg-rain)" opacity={p > 0 ? 1 : 0.15} />
                  {p > 0 && (
                    <text x={x + bw/2} y={y - 3} textAnchor="middle" fontSize={7.5} fill="#7dd3fc" fontWeight="700">
                      {p >= 1 ? p.toFixed(1) : p.toFixed(1)}
                    </text>
                  )}
                  {/* weather emoji */}
                  <text x={PX + i * (chartW / days) + (chartW / days) * 0.5} y={PH - 2}
                        textAnchor="middle" fontSize={8.5} fill="rgba(100,116,139,0.7)">{codes[i] >= 61 ? '🌧' : codes[i] >= 51 ? '🌦' : codes[i] >= 3 ? '⛅' : '☀'}</text>
                </g>
              )
            })}
          </svg>
        </div>
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

          {/* ── Forecast Charts (temp line + precip bars) ──────────────── */}
          {data.daily && <ForecastCharts daily={data.daily} />}
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
