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

function uvLabel(uv: number): string {
  // Note: actual translation happens in JSX via t() calls
  if (uv <= 2) return 'weather.uvLow'
  if (uv <= 5) return 'weather.uvMed'
  if (uv <= 7) return 'weather.uvHigh'
  if (uv <= 10) return 'weather.uvVeryHigh'
  return 'weather.uvExtreme'
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

  const w = 200, h = 60, pad = 10
  const cx = pad + progress * (w - 2 * pad)
  const cy = h - pad - Math.sin(progress * Math.PI) * (h - 2 * pad)
  const daylightMins = Math.round(total / 60000)
  const dH = Math.floor(daylightMins / 60)
  const dM = daylightMins % 60

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h + 14}`} className="w-full" style={{ maxHeight: 70 }}>
        <defs>
          <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
        <path d={`M ${pad} ${h - pad} Q ${w / 2} ${-h * 0.5} ${w - pad} ${h - pad}`}
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="3 4" />
        {isDaylight && (
          <>
            <path d={`M ${pad} ${h - pad} Q ${w / 2} ${-h * 0.5} ${w - pad} ${h - pad}`}
                  fill="none" stroke="url(#sunGrad)" strokeWidth={2}
                  strokeDasharray={`${progress * 300} 300`} />
            <circle cx={cx} cy={cy} r={8} fill="var(--accent-dim)" />
            <circle cx={cx} cy={cy} r={3.5} fill="var(--accent)" />
          </>
        )}
        {nowMs !== null && !isDaylight && (
          <text x={w / 2} y={h / 2 + 2} textAnchor="middle" className="fill-slate-500 text-[9px]">🌙 {nightLabel}</text>
        )}
        <text x={pad} y={h + 10} textAnchor="start" className="fill-slate-500 text-[7px]">{formatTime(sunrise)}</text>
        <text x={w - pad} y={h + 10} textAnchor="end" className="fill-slate-500 text-[7px]">{formatTime(sunset)}</text>
        <text x={w / 2} y={h + 10} textAnchor="middle" className="text-[7px] font-semibold" fill="var(--accent)">{dH}h {dM}m</text>
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
  const { t } = useLang()
  const { data, loading, refetch } = useWidget<WeatherData>('/api/weather', 10 * 60 * 1000)
  const [showExtended, setShowExtended] = useState(false)

  const currentInfo = data?.current ? getWeatherInfo(data.current.weather_code) : null
  const animClass   = data?.current ? getWeatherAnimation(data.current.weather_code) : 'anim-float'
  const todayUVMax  = data?.daily?.uv_index_max?.[0] ?? null

  const daysToShow = showExtended ? (data?.daily?.time.length ?? 7) : 7

  // For temp range bars
  const allMins = data?.daily?.temperature_2m_min?.slice(0, daysToShow) ?? []
  const allMaxs = data?.daily?.temperature_2m_max?.slice(0, daysToShow) ?? []
  const absMin = allMins.length ? Math.min(...allMins) : 0
  const absMax = allMaxs.length ? Math.max(...allMaxs) : 30

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
              <div className="flex items-start gap-4">
                <div className="relative">
                  <span className={`text-6xl select-none block ${animClass}`} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
                    {currentInfo?.emoji}
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extralight text-white tracking-tighter">
                      {Math.round(data.current.temperature_2m)}
                    </span>
                    <span className="text-2xl font-light text-slate-500">°C</span>
                  </div>
                  <div className="text-sm text-slate-400 mt-0.5">{currentInfo?.label}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {t('weather.feels')} {Math.round(data.current.apparent_temperature)}° · {t('weather.humidity')} {data.current.relative_humidity_2m}%
                  </div>
                </div>
              </div>

              {/* Middle: Quick stats pills */}
              <div className="flex flex-wrap gap-2 lg:mt-1">
                <Pill icon="💨" label={t('weather.wind')} value={`${Math.round(data.current.wind_speed_10m)} km/h`} />
                <Pill icon="💧" label={t('weather.precip')} value={`${data.current.precipitation} mm`} />
                {todayUVMax !== null && (
                  <Pill icon="☀️" label="UV" value={`${todayUVMax.toFixed(1)}`} valueColor={uvColor(todayUVMax)} />
                )}
                {data.daily?.temperature_2m_max?.[0] != null && (
                  <Pill icon="🌡️" label={t('weather.maxMin')} value={`${Math.round(data.daily.temperature_2m_max[0])}°/${Math.round(data.daily.temperature_2m_min[0])}°`} />
                )}
              </div>

              {/* Right: Sun arc */}
              <div className="lg:ml-auto flex-shrink-0 lg:w-48">
                {data.daily?.sunrise?.[0] && data.daily?.sunset?.[0] && (
                  <SunArc sunrise={data.daily.sunrise[0]} sunset={data.daily.sunset[0]} nightLabel={t('weather.night')} />
                )}
              </div>
            </div>

            {/* Header info */}
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

          {/* ── Forecast section ─────────────────────────────────────────── */}
          <div className="px-5 pb-5">
            <div className={`grid gap-1.5 ${showExtended ? 'grid-cols-4 sm:grid-cols-7 lg:grid-cols-14' : 'grid-cols-4 sm:grid-cols-7'}`}>
              {data.daily?.time.slice(0, daysToShow).map((day, i) => {
                const { emoji } = getWeatherInfo(data.daily.weather_code[i])
                const max = Math.round(data.daily.temperature_2m_max[i])
                const min = Math.round(data.daily.temperature_2m_min[i])
                const isToday = i === 0
                const rain = data.daily.precipitation_sum[i]
                return (
                  <div
                    key={day}
                    className={`flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-xl text-center transition-all ${
                      isToday
                        ? 'bg-gradient-to-b from-blue-500/10 to-blue-500/5 border border-blue-500/15 shadow-sm shadow-blue-500/5'
                        : 'bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`text-[10px] font-semibold uppercase tracking-wide leading-none ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>
                      {isToday ? t('weather.today') : formatShortDate(day).split(' ')[0]}
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

function Pill({ icon, label, value, valueColor }: { icon: string; label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 rounded-lg px-2.5 py-1.5">
      <span className="text-xs">{icon}</span>
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className="text-[11px] font-semibold" style={{ color: valueColor ?? 'var(--color-body)' }}>{value}</span>
    </div>
  )
}
