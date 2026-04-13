'use client'
import { useEffect, useState } from 'react'

/** Minimal sunrise/sunset strip — slider ball shows current daylight position */
export default function SunriseSunsetWidget() {
  const [now, setNow] = useState(() => new Date())
  const [sunData, setSunData] = useState<{ rise: string; set: string; daylightH: number } | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        const city = d.cities?.BA ?? d.cities?.[Object.keys(d.cities ?? {})[0]]
        if (!city?.sunrise || !city?.sunset) return
        const rise = city.sunrise as string
        const set  = city.sunset as string
        const riseMin = parseTime(rise)
        const setMin  = parseTime(set)
        setSunData({ rise, set, daylightH: Math.round((setMin - riseMin) / 60 * 10) / 10 })
      })
      .catch(() => setSunData({ rise: '06:15', set: '20:00', daylightH: 13.8 }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!sunData) return null

  const riseMin  = parseTime(sunData.rise)
  const setMin   = parseTime(sunData.set)
  const nowMin   = now.getHours() * 60 + now.getMinutes()
  const t        = Math.max(0, Math.min(1, (nowMin - riseMin) / (setMin - riseMin)))
  const isDaytime = nowMin >= riseMin && nowMin <= setMin
  const pct      = isDaytime ? t * 100 : nowMin < riseMin ? 0 : 100

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] select-none">
      {/* Sunrise */}
      <div className="shrink-0 text-right">
        <div className="text-[9px] text-slate-500 uppercase tracking-wide leading-none mb-0.5">Východ</div>
        <div className="text-[13px] font-mono font-semibold text-amber-300">{sunData.rise}</div>
      </div>

      {/* Slider track */}
      <div className="flex-1 relative h-[6px] rounded-full overflow-visible" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {/* Filled portion */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-[800ms]"
          style={{
            width: `${pct}%`,
            background: isDaytime
              ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
              : 'rgba(100,116,139,0.3)',
          }}
        />
        {/* Ball */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-[800ms]"
          style={{ left: `${pct}%` }}
        >
          <div
            className={[
              'w-[14px] h-[14px] rounded-full border-2',
              isDaytime
                ? 'bg-amber-300 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                : 'bg-slate-600 border-slate-500',
            ].join(' ')}
          />
        </div>
      </div>

      {/* Sunset */}
      <div className="shrink-0">
        <div className="text-[9px] text-slate-500 uppercase tracking-wide leading-none mb-0.5">Západ</div>
        <div className="text-[13px] font-mono font-semibold text-orange-300">{sunData.set}</div>
      </div>

      {/* Daylight */}
      <div className="shrink-0 pl-3 border-l border-white/5 text-[11px] text-slate-500">
        {sunData.daylightH}h
      </div>
    </div>
  )
}

function parseTime(s: string): number {
  const [h, m] = s.split(':').map(Number)
  return h * 60 + (m ?? 0)
}
  const [now, setNow] = useState(() => new Date())
  const [sunData, setSunData] = useState<{ rise: string; set: string; noon: string; daylightH: number } | null>(null)

  // Refresh clock every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Pull from the stats API (already used by DaySummaryWidget)
  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        const city = d.cities?.BA ?? d.cities?.[Object.keys(d.cities ?? {})[0]]
        if (!city?.sunrise || !city?.sunset) return
        const rise = city.sunrise as string   // "HH:MM"
        const set  = city.sunset  as string
        const riseMin = parseTime(rise)
        const setMin  = parseTime(set)
        const noonMin = (riseMin + setMin) / 2
        const daylightH = Math.round((setMin - riseMin) / 60 * 10) / 10
        setSunData({ rise, set, noon: formatTime(noonMin), daylightH })
      })
      .catch(() => {
        // Fallback: approximate values for Slovakia
        setSunData({ rise: '06:15', set: '19:45', noon: '13:00', daylightH: 13.5 })
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!sunData) return null

  const riseMin  = parseTime(sunData.rise)
  const setMin   = parseTime(sunData.set)
  const totalMin = setMin - riseMin
  const nowMin   = now.getHours() * 60 + now.getMinutes()

  // 0…1 position along the arc (0=sunrise, 1=sunset)
  const rawT  = (nowMin - riseMin) / totalMin
  const t     = Math.max(0, Math.min(1, rawT))
  const isDaytime = rawT >= 0 && rawT <= 1

  // Sun travels an arc: parabola y = -4t(t-1) gives 0 at ends, 1 at noon
  const arcPct  = t * 100          // horizontal %
  const arcElevation = isDaytime ? 4 * t * (1 - t) : 0  // 0…1 (peak=0.5 at noon)

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] select-none">
      {/* Sunrise */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-amber-400 text-xs">↑</span>
        <span className="text-[11px] font-mono text-amber-300 font-semibold">{sunData.rise}</span>
      </div>

      {/* Sun arc track */}
      <div className="flex-1 relative" style={{ height: '28px' }}>
        {/* Sky gradient bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[5px] rounded-full overflow-hidden">
          <div
            className="h-full w-full"
            style={{
              background: isDaytime
                ? 'linear-gradient(90deg, #1e3a5f 0%, #3a7bd5 20%, #60a5fa 45%, #f97316 80%, #1e3a5f 100%)'
                : 'linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            }}
          />
          {/* Day progress overlay */}
          {isDaytime && (
            <div
              className="absolute top-0 left-0 h-full bg-amber-400/20 rounded-full transition-all duration-1000"
              style={{ width: `${arcPct}%` }}
            />
          )}
        </div>

        {/* Tick marks: sunrise, noon, sunset */}
        {[0, 50, 100].map(p => (
          <div
            key={p}
            className="absolute bottom-[4px] w-px h-[5px] bg-white/10"
            style={{ left: `${p}%`, transform: 'translateX(-50%)' }}
          />
        ))}

        {/* Sun dot */}
        <div
          className="absolute transition-all duration-[800ms] ease-in-out"
          style={{
            left: `${arcPct}%`,
            bottom: `${6 + arcElevation * 16}px`,
            transform: 'translateX(-50%)',
          }}
        >
          {isDaytime ? (
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 rounded-full bg-amber-400/40 blur-[4px] scale-150" />
              {/* Core */}
              <div
                className="w-[10px] h-[10px] rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                style={{ animation: 'sunPulse 3s ease-in-out infinite' }}
              />
            </div>
          ) : (
            // Moon dot at night
            <div className="w-[8px] h-[8px] rounded-full bg-slate-400/60 shadow-[0_0_4px_rgba(148,163,184,0.4)]" />
          )}
        </div>

        {/* "Now" time label */}
        {isDaytime && (
          <div
            className="absolute text-[8px] font-mono text-amber-300/70 transition-all duration-[800ms]"
            style={{
              left: `${arcPct}%`,
              bottom: `${6 + arcElevation * 16 + 13}px`,
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Sunset */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[11px] font-mono text-orange-300 font-semibold">{sunData.set}</span>
        <span className="text-orange-400 text-xs">↓</span>
      </div>

      {/* Daylight hours */}
      <div className="shrink-0 text-[10px] text-slate-500 pl-1 border-l border-white/5">
        {sunData.daylightH}h
      </div>
    </div>
  )
}

function parseTime(s: string): number {
  const [h, m] = s.split(':').map(Number)
  return h * 60 + (m ?? 0)
}

function formatTime(totalMin: number): string {
  const h = Math.floor(totalMin / 60)
  const m = Math.round(totalMin % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
