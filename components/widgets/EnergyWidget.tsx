'use client'
import { useState } from 'react'

// Static EU energy data — updated periodically
// Sources: Ember (ember-climate.org), ENTSO-E, IEA
const EU_MIX = [
  { source: 'Obnoviteľné', pct: 44, color: '#22c55e', sub: 'Vietor, Slnko, Voda' },
  { source: 'Jadrová', pct: 23, color: '#3b82f6', sub: 'Nízke emisie CO₂' },
  { source: 'Plyn', pct: 18, color: '#f97316', sub: 'Zemný plyn' },
  { source: 'Uhlie', pct: 12, color: '#78716c', sub: 'Hnedé + čierne uhlie' },
  { source: 'Ostatné', pct: 3, color: '#a855f7', sub: 'Biomasa, Ropa' },
]

const COUNTRY_PRICES = [
  { country: 'Nemecko', flag: '🇩🇪', price: 92, carbon: 310 },
  { country: 'Francúzsko', flag: '🇫🇷', price: 67, carbon: 58 },
  { country: 'Španielsko', flag: '🇪🇸', price: 55, carbon: 155 },
  { country: 'Taliansko', flag: '🇮🇹', price: 110, carbon: 290 },
  { country: 'Poľsko', flag: '🇵🇱', price: 78, carbon: 650 },
  { country: 'Slovensko', flag: '🇸🇰', price: 65, carbon: 120 },
  { country: 'Česko', flag: '🇨🇿', price: 72, carbon: 480 },
  { country: 'Rakúsko', flag: '🇦🇹', price: 80, carbon: 140 },
]

const EU_AVG_PRICE = Math.round(COUNTRY_PRICES.reduce((s, c) => s + c.price, 0) / COUNTRY_PRICES.length)
const EU_AVG_CARBON = Math.round(COUNTRY_PRICES.reduce((s, c) => s + c.carbon, 0) / COUNTRY_PRICES.length)

const RENEWABLE_PCT = EU_MIX.find(m => m.source === 'Obnoviteľné')?.pct ?? 0

const TABS = ['Mix', 'Ceny', 'CO₂'] as const
type Tab = typeof TABS[number]

/** Mini donut/pie chart */
function DonutChart({ segments }: { segments: { pct: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.pct, 0)
  const R = 38; const cx = 50; const cy = 50
  let cumulative = 0

  const slices = segments.map(seg => {
    const start = (cumulative / total) * 360 - 90
    cumulative += seg.pct
    const end = (cumulative / total) * 360 - 90
    const toRad = (d: number) => (d * Math.PI) / 180
    const x1 = cx + R * Math.cos(toRad(start))
    const y1 = cy + R * Math.sin(toRad(start))
    const x2 = cx + R * Math.cos(toRad(end))
    const y2 = cy + R * Math.sin(toRad(end))
    const large = end - start > 180 ? 1 : 0
    return { ...seg, path: `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z` }
  })

  return (
    <svg viewBox="0 0 100 100" className="w-32 h-32">
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity="0.88" />)}
      {/* Center donut hole */}
      <circle cx={cx} cy={cy} r={22} fill="var(--color-surface, #1e293b)" />
      <text x={cx} y={cy + 2} textAnchor="middle" fill="white" fontSize="10" fontWeight="700">
        {RENEWABLE_PCT}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#94a3b8" fontSize="6">
        obnoviteľné
      </text>
    </svg>
  )
}

export default function EnergyWidget() {
  const [tab, setTab] = useState<Tab>('Mix')

  return (
    <div className="widget-card h-full flex flex-col">
      <h2 className="widget-title mb-3">⚡ Energia EÚ</h2>

      {/* Summary pills */}
      <div className="flex gap-2 flex-wrap mb-3">
        <span className="bg-green-500/15 text-green-400 border border-green-500/25 rounded-full px-2.5 py-0.5 text-xs font-medium">
          🌿 {RENEWABLE_PCT}% obnoviteľné
        </span>
        <span className="bg-orange-500/15 text-orange-400 border border-orange-500/25 rounded-full px-2.5 py-0.5 text-xs font-medium">
          ⚡ {EU_AVG_PRICE} €/MWh priemer
        </span>
        <span className="bg-slate-500/15 text-slate-300 border border-slate-500/25 rounded-full px-2.5 py-0.5 text-xs font-medium">
          💨 {EU_AVG_CARBON} g CO₂/kWh
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              tab === t ? 'bg-primary text-white' : 'bg-surface2 text-muted hover:text-primary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Energy Mix */}
      {tab === 'Mix' && (
        <div className="flex gap-4 items-center">
          <DonutChart segments={EU_MIX} />
          <ul className="flex-1 space-y-1.5 text-sm">
            {EU_MIX.map(m => (
              <li key={m.source} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.color }} />
                <span className="font-medium">{m.source}</span>
                <span className="ml-auto text-muted">{m.pct}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tab: Prices */}
      {tab === 'Ceny' && (
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs text-muted mb-2">Veľkoobchodná cena elektriny €/MWh</p>
          <ul className="space-y-1.5">
            {COUNTRY_PRICES.sort((a, b) => a.price - b.price).map(c => {
              const bar = Math.round((c.price / 130) * 100)
              return (
                <li key={c.country} className="flex items-center gap-2 text-xs">
                  <span className="w-20 shrink-0">{c.flag} {c.country}</span>
                  <div className="flex-1 bg-surface2 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-orange-400" style={{ width: `${bar}%` }} />
                  </div>
                  <span className="w-10 text-right font-mono text-muted">{c.price}</span>
                </li>
              )
            })}
          </ul>
          <p className="text-xs text-muted mt-3 italic">Zdroj: ENTSO-E · aktualizácia mesačne</p>
        </div>
      )}

      {/* Tab: CO₂ */}
      {tab === 'CO₂' && (
        <div className="flex-1 overflow-y-auto">
          <p className="text-xs text-muted mb-2">Uhlíková intenzita g CO₂/kWh</p>
          <ul className="space-y-1.5">
            {COUNTRY_PRICES.sort((a, b) => a.carbon - b.carbon).map(c => {
              const bar = Math.round((c.carbon / 700) * 100)
              const color = c.carbon < 150 ? '#22c55e' : c.carbon < 350 ? '#eab308' : '#ef4444'
              return (
                <li key={c.country} className="flex items-center gap-2 text-xs">
                  <span className="w-20 shrink-0">{c.flag} {c.country}</span>
                  <div className="flex-1 bg-surface2 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${bar}%`, background: color }} />
                  </div>
                  <span className="w-10 text-right font-mono text-muted">{c.carbon}</span>
                </li>
              )
            })}
          </ul>
          <p className="text-xs text-muted mt-3">
            🟢 &lt;150 nízke · 🟡 150–350 stredné · 🔴 &gt;350 vysoké
          </p>
          <p className="text-xs text-muted mt-1 italic">Zdroj: Ember Climate · aktualizácia mesačne</p>
        </div>
      )}
    </div>
  )
}
