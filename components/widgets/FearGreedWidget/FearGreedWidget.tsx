'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'

interface DayEntry {
  value: number
  label: string
  timestamp: string
}

interface Data {
  current: DayEntry
  history: DayEntry[]
}

const COLORS: Record<string, { bg: string; text: string; border: string; label: string; desc: string }> = {
  'Extreme Fear': { bg: '#ef4444', text: '#fca5a5', border: '#ef4444', label: 'Extrémny strach', desc: 'Investori v panike, možný čas na nákup' },
  Fear:          { bg: '#f97316', text: '#fdba74', border: '#f97316', label: 'Strach', desc: 'Prevláda pesimizmus, ceny môžu byť podhodnotené' },
  Neutral:       { bg: '#eab308', text: '#fde047', border: '#eab308', label: 'Neutrálne', desc: 'Trh je v rovnováhe, čakanie na signál' },
  Greed:         { bg: '#22c55e', text: '#86efac', border: '#22c55e', label: 'Chamtivosť', desc: 'Optimizmus rastie, opatrnosť pri nákupoch' },
  'Extreme Greed': { bg: '#16a34a', text: '#4ade80', border: '#16a34a', label: 'Extrémna chamtivosť', desc: 'Eufória! Riziko prepadu, zvážte predaj' },
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
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="25%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="75%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <path d={trackPath} fill="none" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
      <path d={valuePath} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" opacity="0.9" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="white" />
      <text x={cx} y={cy - 16} textAnchor="middle" fill="white" fontSize="24" fontWeight="800">{value}</text>
    </svg>
  )
}

export default function FearGreedWidget() {
  const { data, loading, error, refetch } = useWidget<Data>('/api/fear-greed', 3600)

  return (
    <WidgetCard accent="orange" title="Fear & Greed Index" icon="😱" onRefresh={refetch}>
      {loading && (
        <div className="flex-1 flex items-center justify-center py-6">
          <span className="text-slate-500 text-sm animate-pulse">Načítavam…</span>
        </div>
      )}

      {error && !data && (
        <div className="text-sm text-red-400 text-center py-4">Chyba načítania</div>
      )}

      {data && (() => {
        const cur = data.current
        const col = getColor(cur.label)
        const prev = data.history[1]
        const diff = prev ? cur.value - prev.value : 0

        return (
          <div className="space-y-3">
            {/* Gauge + label */}
            <div className="flex flex-col items-center">
              <Gauge value={cur.value} color={col.bg} />
              <p className="text-sm font-bold mt-1" style={{ color: col.text }}>
                {col.label}
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5 text-center max-w-[200px]">{col.desc}</p>
              {diff !== 0 && (
                <span className={`text-[10px] font-bold mt-1 ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {diff > 0 ? '▲' : '▼'} {Math.abs(diff)} oproti včerajšku
                </span>
              )}
            </div>

            {/* 7-day history bars */}
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">7-dňový vývoj</p>
              <div className="flex items-end gap-1 h-14">
                {data.history.slice(0, 7).reverse().map((d, i) => {
                  const c = getColor(d.label)
                  const pct = (d.value / 100) * 100
                  const isToday = i === data.history.slice(0, 7).length - 1
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`${c.label}: ${d.value}`}>
                      <div className="w-full rounded-t-sm transition-all" style={{ height: `${pct}%`, background: c.bg, opacity: isToday ? 1 : 0.4 }} />
                      <span className={`text-[9px] font-mono tabular-nums ${isToday ? 'text-white font-bold' : 'text-slate-600'}`}>{d.value}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Compact legend */}
            <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
              {Object.entries(COLORS).map(([key, val]) => (
                <span key={key} className="text-[8px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: val.bg + '20', color: val.text }}>
                  {val.label}
                </span>
              ))}
            </div>
            <p className="text-[8px] text-slate-600">Crypto trh · alternative.me</p>
          </div>
        )
      })()}
    </WidgetCard>
  )
}
