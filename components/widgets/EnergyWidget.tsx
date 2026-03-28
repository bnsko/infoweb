'use client'
import { useState } from 'react'
import WidgetCard from '@/components/ui/WidgetCard'

const EU_MIX = [
  { source: 'Obnovitelne', pct: 44, color: '#22c55e', emoji: '\ud83c\udf3f', sub: 'Vietor, Slnko, Voda' },
  { source: 'Jadrova', pct: 23, color: '#3b82f6', emoji: '\u269b\ufe0f', sub: 'Nizke emisie CO2' },
  { source: 'Plyn', pct: 18, color: '#f97316', emoji: '\ud83d\udd25', sub: 'Zemny plyn' },
  { source: 'Uhlie', pct: 12, color: '#78716c', emoji: '\u2b1b', sub: 'Hnede + cierne uhlie' },
  { source: 'Ostatne', pct: 3, color: '#a855f7', emoji: '\ud83e\uddea', sub: 'Biomasa, Ropa' },
]

const SK_MIX = [
  { source: 'Jadrova', pct: 55, color: '#3b82f6', emoji: '\u269b\ufe0f' },
  { source: 'Obnovitelne', pct: 24, color: '#22c55e', emoji: '\ud83c\udf3f' },
  { source: 'Plyn', pct: 12, color: '#f97316', emoji: '\ud83d\udd25' },
  { source: 'Uhlie', pct: 6, color: '#78716c', emoji: '\u2b1b' },
  { source: 'Ostatne', pct: 3, color: '#a855f7', emoji: '\ud83e\uddea' },
]

const COUNTRY_PRICES = [
  { country: 'Nemecko', flag: '\ud83c\udde9\ud83c\uddea', price: 92, carbon: 310, renewable: 52 },
  { country: 'Francuzsko', flag: '\ud83c\uddeb\ud83c\uddf7', price: 67, carbon: 58, renewable: 28 },
  { country: 'Spanielsko', flag: '\ud83c\uddea\ud83c\uddf8', price: 55, carbon: 155, renewable: 50 },
  { country: 'Taliansko', flag: '\ud83c\uddee\ud83c\uddf9', price: 110, carbon: 290, renewable: 42 },
  { country: 'Polsko', flag: '\ud83c\uddf5\ud83c\uddf1', price: 78, carbon: 650, renewable: 22 },
  { country: 'Slovensko', flag: '\ud83c\uddf8\ud83c\uddf0', price: 65, carbon: 120, renewable: 24 },
  { country: 'Cesko', flag: '\ud83c\udde8\ud83c\uddff', price: 72, carbon: 480, renewable: 17 },
  { country: 'Rakusko', flag: '\ud83c\udde6\ud83c\uddf9', price: 80, carbon: 140, renewable: 78 },
  { country: 'Dansko', flag: '\ud83c\udde9\ud83c\uddf0', price: 88, carbon: 95, renewable: 84 },
  { country: 'Holandsko', flag: '\ud83c\uddf3\ud83c\uddf1', price: 95, carbon: 340, renewable: 33 },
]

const SK_STATS = [
  { label: 'Mochovce 1-4', value: '2\u00d7440 + 2\u00d7471 MW', emoji: '\u269b\ufe0f' },
  { label: 'Bohunice V2', value: '2\u00d7505 MW', emoji: '\u269b\ufe0f' },
  { label: 'Gabcikovo', value: '720 MW', emoji: '\ud83c\udf0a' },
  { label: 'Spotreba SR', value: '~29 TWh/rok', emoji: '\u26a1' },
  { label: 'Spotr. domacnost', value: '~3 200 kWh/rok', emoji: '\ud83c\udfe0' },
  { label: 'Cena domacnost', value: '~0.18 \u20ac/kWh', emoji: '\ud83d\udcb0' },
  { label: 'Carbon credit EU', value: '~68 \u20ac/tCO\u2082', emoji: '\ud83c\udfed' },
]

const SOURCES = [
  { name: 'ENTSO-E', url: 'https://transparency.entsoe.eu/' },
  { name: 'Ember Climate', url: 'https://ember-climate.org/data/' },
  { name: 'IEA', url: 'https://www.iea.org/data-and-statistics' },
  { name: 'SEPS', url: 'https://www.sepsas.sk/' },
  { name: 'URSO', url: 'https://www.urso.gov.sk/' },
]

const EU_AVG_PRICE = Math.round(COUNTRY_PRICES.reduce((s, c) => s + c.price, 0) / COUNTRY_PRICES.length)
const EU_AVG_CARBON = Math.round(COUNTRY_PRICES.reduce((s, c) => s + c.carbon, 0) / COUNTRY_PRICES.length)

type Tab = 'mix' | 'prices' | 'co2' | 'sk'

function DonutChart({ segments, center }: { segments: { pct: number; color: string }[]; center: string }) {
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
    <svg viewBox="0 0 100 100" className="w-28 h-28 shrink-0">
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity="0.88" />)}
      <circle cx={cx} cy={cy} r={20} fill="var(--color-surface, #0f172a)" />
      <text x={cx} y={cy + 3} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">{center}</text>
    </svg>
  )
}

export default function EnergyWidget() {
  const [tab, setTab] = useState<Tab>('mix')

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'mix', icon: '\ud83c\udf3f', label: 'Mix' },
    { key: 'prices', icon: '\ud83d\udcb0', label: 'Ceny' },
    { key: 'co2', icon: '\ud83d\udca8', label: 'CO\u2082' },
    { key: 'sk', icon: '\ud83c\uddf8\ud83c\uddf0', label: 'Slovensko' },
  ]

  return (
    <WidgetCard accent="green" title="\u26a1 Energia EU & SK" icon="" onRefresh={() => {}}>
      <div className="flex gap-1.5 flex-wrap mb-3">
        <span className="bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5 text-[9px] font-semibold">
          {EU_MIX[0].pct}% obnovitelne EU
        </span>
        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5 text-[9px] font-semibold">
          {EU_AVG_PRICE} \u20ac/MWh priemer
        </span>
        <span className="bg-slate-500/10 text-slate-300 border border-slate-500/20 rounded-full px-2 py-0.5 text-[9px] font-semibold">
          {EU_AVG_CARBON} g CO\u2082/kWh
        </span>
      </div>

      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === tb.key ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{tb.icon}</span>
            <span className="hidden sm:inline">{tb.label}</span>
          </button>
        ))}
      </div>

      {tab === 'mix' && (
        <div>
          <p className="text-[10px] text-slate-500 mb-2 font-semibold">Energeticky mix EU 2024</p>
          <div className="flex gap-3 items-center mb-3">
            <DonutChart segments={EU_MIX} center={`${EU_MIX[0].pct}%`} />
            <div className="flex-1 space-y-1">
              {EU_MIX.map(m => (
                <div key={m.source} className="flex items-center gap-2">
                  <span className="text-xs">{m.emoji}</span>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                  <span className="text-[10px] font-medium text-slate-300 flex-1">{m.source}</span>
                  <span className="text-[10px] font-bold text-white">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-500/8 border border-blue-500/15 rounded-xl p-2.5">
            <p className="text-[10px] text-blue-300 font-semibold mb-1">{'\u269b\ufe0f'} Jadrova energia - trend</p>
            <p className="text-[9px] text-slate-400">14 krajin EU prevadzkuje jadrove elektrarne. Francuzsko (56 reaktorov) a Slovensko (5 reaktorov) maju najvacsi podiel jadra v mixe.</p>
          </div>
        </div>
      )}

      {tab === 'prices' && (
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto scrollbar-hide">
          <p className="text-[10px] text-slate-500 mb-1">Velkoobchodna cena elektriny \u20ac/MWh</p>
          {[...COUNTRY_PRICES].sort((a, b) => a.price - b.price).map(c => {
            const bar = Math.round((c.price / 120) * 100)
            return (
              <div key={c.country} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 border ${c.country === 'Slovensko' ? 'bg-green-500/8 border-green-500/15' : 'bg-white/[0.02] border-white/5'}`}>
                <span className="text-sm">{c.flag}</span>
                <span className={`w-20 text-[10px] font-medium shrink-0 ${c.country === 'Slovensko' ? 'text-green-300' : 'text-slate-300'}`}>{c.country}</span>
                <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-orange-400/70" style={{ width: `${bar}%` }} />
                </div>
                <span className="w-8 text-right text-[10px] font-bold text-white tabular-nums">{c.price}</span>
              </div>
            )
          })}
          <p className="text-[8px] text-slate-600 text-center mt-2">Zdroj: ENTSO-E Transparency</p>
        </div>
      )}

      {tab === 'co2' && (
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto scrollbar-hide">
          <p className="text-[10px] text-slate-500 mb-1">Uhlikova intenzita g CO\u2082/kWh</p>
          {[...COUNTRY_PRICES].sort((a, b) => a.carbon - b.carbon).map(c => {
            const bar = Math.round((c.carbon / 700) * 100)
            const color = c.carbon < 150 ? '#22c55e' : c.carbon < 350 ? '#eab308' : '#ef4444'
            return (
              <div key={c.country} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 border ${c.country === 'Slovensko' ? 'bg-green-500/8 border-green-500/15' : 'bg-white/[0.02] border-white/5'}`}>
                <span className="text-sm">{c.flag}</span>
                <span className="w-20 text-[10px] font-medium text-slate-300 shrink-0">{c.country}</span>
                <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${bar}%`, background: color }} />
                </div>
                <span className="w-8 text-right text-[10px] font-bold text-white tabular-nums">{c.carbon}</span>
              </div>
            )
          })}
          <div className="flex gap-3 text-[8px] text-slate-600 justify-center mt-2">
            <span>{'\ud83d\udfe2'} &lt;150 nizke</span>
            <span>{'\ud83d\udfe1'} 150-350 stredne</span>
            <span>{'\ud83d\udd34'} &gt;350 vysoke</span>
          </div>
          <p className="text-[8px] text-slate-600 text-center">Zdroj: Ember Climate</p>
        </div>
      )}

      {tab === 'sk' && (
        <div className="space-y-3">
          <div className="flex gap-3 items-center">
            <DonutChart segments={SK_MIX} center="55%" />
            <div className="flex-1 space-y-1">
              {SK_MIX.map(m => (
                <div key={m.source} className="flex items-center gap-2">
                  <span className="text-xs">{m.emoji}</span>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                  <span className="text-[10px] font-medium text-slate-300 flex-1">{m.source}</span>
                  <span className="text-[10px] font-bold text-white">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            {SK_STATS.map(s => (
              <div key={s.label} className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-white/[0.02] border border-white/5">
                <span className="text-xs">{s.emoji}</span>
                <span className="text-[10px] text-slate-400 flex-1">{s.label}</span>
                <span className="text-[10px] font-bold text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-3 pt-2 border-t border-white/5">
        {SOURCES.map(s => (
          <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[8px] text-slate-600 hover:text-green-400 transition-colors">
            {s.name} {'\u2197'}
          </a>
        ))}
      </div>
    </WidgetCard>
  )
}
