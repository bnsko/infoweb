'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import { getWeatherInfo, formatShortDate } from '@/lib/utils'
import type { WeatherData } from '@/lib/types'
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
      {/* Arrow points FROM which direction wind comes (meteorological convention) */}
      <path d="M9 1 L12 9 L10.5 9 L10.5 17 L7.5 17 L7.5 9 L6 9 Z" fill="currentColor" />
    </svg>
  )
}

/* ── Elegant Sun Arc ─────────────────────────────────────────────────── */
function SunArc({ sunrise, sunset, nightLabel }: { sunrise: string; sunset: string; nightLabel: string }) {
  const [nowMs, setNowMs] = useState<number | null>(null)

  useEffect(() => {
    setNowMs(Date.now())
    const t = setInterval(() => setNowMs(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  const riseMs = new Date(sunrise).getTime()
  const setMs  = new Date(sunset).getTime()
  const total  = setMs - riseMs
  const now    = nowMs ?? riseMs
  const elapsed = Math.max(0, Math.min(total, now - riseMs))
  const progress = total > 0 ? elapsed / total : 0
  const isDaylight = nowMs !== null && now >= riseMs && now <= setMs

  const W = 320, H = 120, pad = 20
  const cx = pad + progress * (W - 2 * pad)
  const cy = H - pad - Math.sin(progress * Math.PI) * (H - 2 * pad - 10)
  const daylightMins = Math.round(total / 60000)
  const dH = Math.floor(daylightMins / 60)
  const dM = daylightMins % 60

  // Progress arc path (partial ellipse)
  const arcProgress = Math.min(progress, 0.999)
  const arcX = pad + arcProgress * (W - 2 * pad)
  const arcY = H - pad - Math.sin(arcProgress * Math.PI) * (H - 2 * pad - 10)

  return (
    <div className="bg-gradient-to-b from-slate-800/40 to-slate-900/20 border border-white/8 rounded-2xl p-4">
      <svg viewBox={`0 0 ${W} ${H + 28}`} className="w-full" style={{ maxHeight: 150 }}>
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDaylight ? '#1e3a5f' : '#0f172a'} stopOpacity="0" />
            <stop offset="100%" stopColor={isDaylight ? '#0ea5e9' : '#1e293b'} stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="sunPathGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
          </linearGradient>
          <filter id="sunGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <radialGradient id="sunRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
            <stop offset="60%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky background */}
        <rect x={0} y={0} width={W} height={H} fill="url(#skyGrad)" />

        {/* Horizon base line */}
        <line x1={pad - 8} y1={H - pad} x2={W - pad + 8} y2={H - pad}
              stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

        {/* Dotted arc path */}
        <path d={`M ${pad} ${H - pad} Q ${W / 2} ${-(H - 2 * pad) * 0.7} ${W - pad} ${H - pad}`}
              fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} strokeDasharray="5 6" />

        {/* Completed progress arc (glowing) */}
        {progress > 0.01 && (
          <path d={`M ${pad} ${H - pad} Q ${W / 2} ${-(H - 2 * pad) * 0.7} ${arcX} ${arcY}`}
                fill="none" stroke="url(#sunPathGrad)" strokeWidth={3}
                strokeLinecap="round" />
        )}

        {isDaylight ? (
          <>
            {/* Sun glow halo */}
            <circle cx={cx} cy={cy} r={22} fill="#fbbf24" opacity="0.07" filter="url(#sunGlow)" />
            <circle cx={cx} cy={cy} r={14} fill="#fbbf24" opacity="0.12" />
            {/* Sun body */}
            <circle cx={cx} cy={cy} r={8} fill="url(#sunRadial)" />
            <circle cx={cx} cy={cy} r={5} fill="#fde68a" />
          </>
        ) : (
          <>
            {/* Moon */}
            <text x={W / 2} y={H / 2 + 8} textAnchor="middle" fontSize="22" opacity="0.6">🌙</text>
            <text x={W / 2} y={H / 2 + 26} textAnchor="middle" fontSize="11" fill="#64748b">{nightLabel}</text>
          </>
        )}

        {/* Sunrise */}
        <text x={pad - 4} y={H + 10} textAnchor="start" fontSize="9" fill="#fbbf24" fontWeight="600">↗ {formatTime(sunrise)}</text>

        {/* Sunset */}
        <text x={W - pad + 4} y={H + 10} textAnchor="end" fontSize="9" fill="#f97316" fontWeight="600">{formatTime(sunset)} ↘</text>

        {/* Duration */}
        <text x={W / 2} y={H + 24} textAnchor="middle" fontSize="11" fontWeight="700" fill="#f59e0b">
          ☀ {dH}h {dM}m
        </text>
      </svg>
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

              {/* Right: Sun arc - bigger */}
              <div className="lg:ml-auto flex-shrink-0 lg:w-80">
                {data.daily?.sunrise?.[0] && data.daily?.sunset?.[0] && (
                  <SunArc sunrise={data.daily.sunrise[0]} sunset={data.daily.sunset[0]} nightLabel={t('weather.night')} />
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
