'use client'
import { useState } from 'react'
import WidgetCard from '@/components/ui/WidgetCard'
import { useLang } from '@/hooks/useLang'

const EU_MIX = [
  { source: 'Obnoviteľné', pct: 44, color: '#22c55e', emoji: '🌿', sub: 'Vietor, Slnko, Voda' },
  { source: 'Jadrová', pct: 23, color: '#3b82f6', emoji: '⚛️', sub: 'Nízke emisie CO₂' },
  { source: 'Plyn', pct: 18, color: '#f97316', emoji: '🔥', sub: 'Zemný plyn' },
  { source: 'Uhlie', pct: 12, color: '#78716c', emoji: '⬛', sub: 'Hnedé + čierne uhlie' },
  { source: 'Ostatné', pct: 3, color: '#a855f7', emoji: '🧪', sub: 'Biomasa, Ropa' },
]

const SK_MIX = [
  { source: 'Jadrová', pct: 55, color: '#3b82f6', emoji: '⚛️' },
  { source: 'Obnoviteľné', pct: 24, color: '#22c55e', emoji: '🌿' },
  { source: 'Plyn', pct: 12, color: '#f97316', emoji: '🔥' },
  { source: 'Uhlie', pct: 6, color: '#78716c', emoji: '⬛' },
  { source: 'Ostatné', pct: 3, color: '#a855f7', emoji: '🧪' },
]

const COUNTRY_PRICES = [
  { country: 'Nemecko', flag: '🇩🇪', price: 92, carbon: 310, renewable: 52 },
  { country: 'Francúzsko', flag: '🇫🇷', price: 67, carbon: 58, renewable: 28 },
  { country: 'Španielsko', flag: '🇪🇸', price: 55, carbon: 155, renewable: 50 },
  { country: 'Taliansko', flag: '🇮🇹', price: 110, carbon: 290, renewable: 42 },
  { country: 'Poľsko', flag: '🇵🇱', price: 78, carbon: 650, renewable: 22 },
  { country: 'Slovensko', flag: '🇸🇰', price: 65, carbon: 120, renewable: 24 },
  { country: 'Česko', flag: '🇨🇿', price: 72, carbon: 480, renewable: 17 },
  { country: 'Rakúsko', flag: '🇦🇹', price: 80, carbon: 140, renewable: 78 },
  { country: 'Dánsko', flag: '🇩🇰', price: 88, carbon: 95, renewable: 84 },
  { country: 'Holandsko', flag: '🇳🇱', price: 95, carbon: 340, renewable: 33 },
]

const SK_STATS = [
  { label: 'Mochovce 1-4', value: '2×440 + 2×471 MW', emoji: '⚛️' },
  { label: 'Bohunice V2', value: '2×505 MW', emoji: '⚛️' },
  { label: 'Gabčíkovo', value: '720 MW', emoji: '🌊' },
  { label: 'Spotreba SR', value: '~29 TWh/rok', emoji: '⚡' },
  { label: 'Spotr. domácností', value: '~3 200 kWh/rok', emoji: '🏠' },
  { label: 'Cena domácností', value: '~0.18 €/kWh', emoji: '💰' },
  { label: 'Carbon credit EÚ', value: '~68 €/tCO₂', emoji: '🏭' },
]

const SOURCES = [
  { name: 'ENTSO-E', url: 'https://transparency.entsoe.eu/' },
  { name: 'Ember Climate', url: 'https://ember-climate.org/data/' },
  { name: 'IEA', url: 'https://www.iea.org/data-and-statistics' },
  { name: 'SEPS', url: 'https://www.sepsas.sk/' },
  { name: 'ÚRSO', url: 'https://www.urso.gov.sk/' },
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
  const { lang } = useLang()
  const [tab, setTab] = useState<Tab>('mix')

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'mix', icon: '🌿', label: lang === 'sk' ? 'Mix' : 'Mix' },
    { key: 'prices', icon: '💰', label: lang === 'sk' ? 'Ceny' : 'Prices' },
    { key: 'co2', icon: '🌍', label: 'CO₂' },
    { key: 'sk', icon: '🇸🇰', label: lang === 'sk' ? 'Slovensko' : 'Slovakia' },
  ]

  return (
    <WidgetCard accent="green" title={lang === 'sk' ? 'Energia EÚ & Slovensko' : 'Energy EU & Slovakia'} icon="⚡" onRefresh={() => {}}>
      <div className="flex gap-1.5 flex-wrap mb-3">
        <span className="bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5 text-[9px] font-semibold">
          {EU_MIX[0].pct}% {lang === 'sk' ? 'obnoviteľné EÚ' : 'renewable EU'}
        </span>
        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5 text-[9px] font-semibold">
          {EU_AVG_PRICE} €/MWh {lang === 'sk' ? 'priemer' : 'average'}
        </span>
        <span className="bg-slate-500/10 text-slate-300 border border-slate-500/20 rounded-full px-2 py-0.5 text-[9px] font-semibold">
          {EU_AVG_CARBON} g CO₂/kWh
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
          <p className="text-[10px] text-slate-500 mb-2 font-semibold">{lang === 'sk' ? 'Energetický mix EÚ 2024' : 'EU Energy Mix 2024'}</p>
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
            <p className="text-[10px] text-blue-300 font-semibold mb-1">⚛️ {lang === 'sk' ? 'Jadrová energia — trend' : 'Nuclear energy — trend'}</p>
            <p className="text-[9px] text-slate-400">{lang === 'sk' ? '14 krajín EÚ prevádzkuje jadrové elektrárne. Francúzsko (56 reaktorov) a Slovensko (5 reaktorov) majú najväčší podiel jadra v mixe.' : '14 EU countries operate nuclear plants. France (56 reactors) and Slovakia (5 reactors) have the highest nuclear share.'}</p>
          </div>
          {/* Carbon footprint info */}
          <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-xl p-2.5 mt-2">
            <p className="text-[10px] text-emerald-300 font-semibold mb-1">🌍 {lang === 'sk' ? 'Uhlíková stopa' : 'Carbon Footprint'}</p>
            <p className="text-[9px] text-slate-400">{lang === 'sk' ? 'Priemerná EÚ domácnosť produkuje ~2.5 t CO₂/rok z elektriny. Slovensko vďaka jadru len ~1.1 t CO₂/rok — tretie najnižšie v EÚ.' : 'Average EU household produces ~2.5 t CO₂/yr from electricity. Slovakia thanks to nuclear only ~1.1 t CO₂/yr — 3rd lowest in EU.'}</p>
          </div>
        </div>
      )}

      {tab === 'prices' && (
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto scrollbar-hide">
          <p className="text-[10px] text-slate-500 mb-1">{lang === 'sk' ? 'Veľkoobchodná cena elektriny €/MWh' : 'Wholesale electricity price €/MWh'}</p>
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
          <p className="text-[8px] text-slate-600 text-center mt-2">{lang === 'sk' ? 'Zdroj' : 'Source'}: <a href="https://transparency.entsoe.eu/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">ENTSO-E Transparency ↗</a></p>
        </div>
      )}

      {tab === 'co2' && (
        <div className="space-y-1.5 max-h-[340px] overflow-y-auto scrollbar-hide">
          <p className="text-[10px] text-slate-500 mb-1">{lang === 'sk' ? 'Uhlíková intenzita g CO₂/kWh' : 'Carbon intensity g CO₂/kWh'}</p>
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
            <span>🟢 &lt;150 {lang === 'sk' ? 'nízke' : 'low'}</span>
            <span>🟡 150-350 {lang === 'sk' ? 'stredné' : 'medium'}</span>
            <span>🔴 &gt;350 {lang === 'sk' ? 'vysoké' : 'high'}</span>
          </div>
          <p className="text-[8px] text-slate-600 text-center">{lang === 'sk' ? 'Zdroj' : 'Source'}: <a href="https://ember-climate.org/data/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">Ember Climate ↗</a></p>
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
          {/* Carbon footprint SK detail */}
          <div className="bg-green-500/8 border border-green-500/15 rounded-xl p-2.5">
            <p className="text-[10px] text-green-300 font-semibold mb-1">🌱 {lang === 'sk' ? 'Uhlíková stopa SR' : 'Slovakia Carbon Footprint'}</p>
            <div className="grid grid-cols-2 gap-2 text-[9px]">
              <div className="bg-white/[0.03] rounded-lg p-1.5 text-center">
                <div className="text-green-400 font-bold">120 g</div>
                <div className="text-slate-500">CO₂/kWh</div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-1.5 text-center">
                <div className="text-green-400 font-bold">~1.1 t</div>
                <div className="text-slate-500">CO₂/dom./rok</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-3 pt-2 border-t border-white/5">
        {SOURCES.map(s => (
          <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[8px] text-slate-600 hover:text-green-400 transition-colors">
            {s.name} ↗
          </a>
        ))}
      </div>
    </WidgetCard>
  )
}
