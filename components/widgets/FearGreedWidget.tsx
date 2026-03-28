'use client'
import { useWidget } from '@/hooks/useWidget'

interface DayEntry {
  value: number
  label: string
  timestamp: string
}

interface Data {
  current: DayEntry
  history: DayEntry[]
}

const COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  'Extreme Fear': { bg: '#ef4444', text: '#fca5a5', border: '#ef4444', label: 'Extrémny strach' },
  Fear:          { bg: '#f97316', text: '#fdba74', border: '#f97316', label: 'Strach' },
  Neutral:       { bg: '#eab308', text: '#fde047', border: '#eab308', label: 'Neutrálne' },
  Greed:         { bg: '#22c55e', text: '#86efac', border: '#22c55e', label: 'Chamtivosť' },
  'Extreme Greed': { bg: '#16a34a', text: '#4ade80', border: '#16a34a', label: 'Extrémna chamtivosť' },
}

function getColor(label: string) {
  return COLORS[label] ?? COLORS['Neutral']
}

/** Semicircular gauge 0..100 */
function Gauge({ value, color }: { value: number; color: string }) {
  const R = 60
  const cx = 80
  const cy = 80
  const startAngle = -180
  const sweepAngle = 180
  const angle = startAngle + (sweepAngle * value) / 100

  const toRad = (deg: number) => (deg * Math.PI) / 180

  const arcX = (deg: number) => cx + R * Math.cos(toRad(deg))
  const arcY = (deg: number) => cy + R * Math.sin(toRad(deg))

  const trackPath = `M ${arcX(-180)} ${arcY(-180)} A ${R} ${R} 0 0 1 ${arcX(0)} ${arcY(0)}`
  const valuePath = `M ${arcX(-180)} ${arcY(-180)} A ${R} ${R} 0 ${value > 50 ? 1 : 0} 1 ${arcX(angle)} ${arcY(angle)}`

  const needleX = cx + (R - 10) * Math.cos(toRad(angle))
  const needleY = cy + (R - 10) * Math.sin(toRad(angle))

  return (
    <svg viewBox="0 0 160 90" className="w-full max-w-[180px]">
      {/* Track */}
      <path d={trackPath} fill="none" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      {/* Value arc */}
      <path d={valuePath} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" opacity="0.9" />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="white" />
      {/* Value */}
      <text x={cx} y={cy - 16} textAnchor="middle" fill="white" fontSize="22" fontWeight="700">{value}</text>
    </svg>
  )
}

export default function FearGreedWidget() {
  const { data, loading, error, refetch } = useWidget<Data>('/api/fear-greed', 3600)

  return (
    <div className="widget-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="widget-title">😱 Fear &amp; Greed Index</h2>
        <button onClick={refetch} className="text-xs text-muted hover:text-primary transition-colors">↻</button>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-muted text-sm animate-pulse">Načítavam…</span>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 text-center py-4">Chyba načítania</div>
      )}

      {data && (() => {
        const cur = data.current
        const col = getColor(cur.label)

        return (
          <>
            {/* Gauge */}
            <div className="flex flex-col items-center mb-3">
              <Gauge value={cur.value} color={col.bg} />
              <p className="text-sm font-semibold mt-1" style={{ color: col.text }}>
                {col.label}
              </p>
              <p className="text-xs text-muted mt-0.5">Crypto trh — dnes</p>
            </div>

            {/* 7-day history bars */}
            <p className="text-xs text-muted mb-2">Posledných 7 dní</p>
            <div className="flex items-end gap-1.5 h-16">
              {data.history.slice(0, 7).reverse().map((d, i) => {
                const c = getColor(d.label)
                const pct = (d.value / 100) * 100
                const isToday = i === data.history.slice(0, 7).length - 1
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t" style={{ height: `${pct}%`, background: c.bg, opacity: isToday ? 1 : 0.5 }} />
                    <span className="text-xs text-muted">{d.value}</span>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Object.entries(COLORS).map(([key, val]) => (
                <span key={key} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: val.bg + '22', color: val.text, border: `1px solid ${val.border}44` }}>
                  {val.label}
                </span>
              ))}
            </div>
          </>
        )
      })()}
    </div>
  )
}
