'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Listing {
  id: string; title: string; type: string; area: string; street: string
  sqm: number; price: number; pricePerSqm: number; floor: number; floors: number
  energyClass: string; condition: string; elevator: boolean; balcony: boolean
  parking: boolean; daysAgo: number; listedAt: string; url: string; bytyUrl: string; source: string
}
interface MarketStats {
  avgPricePerSqm: number; minListingPrice: number; maxListingPrice: number
  totalListings: number; newListingsToday: number; pricesTrend: string; yoyChange: number
}
interface RealEstateData { listings: Listing[]; marketStats: MarketStats; updatedAt: string }

const TYPES = ['všetky', 'garsónka', '1-izbový', '2-izbový', '3-izbový', '4-izbový']

function priceTag(p: number) {
  return p >= 1_000_000 ? `${(p / 1_000_000).toFixed(2)}M` : `${(p / 1000).toFixed(0)}k`
}

export default function RealEstateSKWidget() {
  const { data, loading, refetch } = useWidget<RealEstateData>('/api/realestate-sk', 30 * 60 * 1000)
  const [typeFilter, setTypeFilter] = useState('všetky')
  const [sortBy, setSortBy] = useState<'price' | 'sqm' | 'new'>('new')

  const listings = (data?.listings ?? [])
    .filter(l => typeFilter === 'všetky' || l.type === typeFilter)
    .sort((a, b) => sortBy === 'price' ? a.price - b.price : sortBy === 'sqm' ? b.sqm - a.sqm : a.daysAgo - b.daysAgo)

  const stats = data?.marketStats
  const trendColor = stats?.pricesTrend === 'up' ? 'text-rose-400' : stats?.pricesTrend === 'down' ? 'text-green-400' : 'text-slate-400'
  const trendIcon = stats?.pricesTrend === 'up' ? '↑' : stats?.pricesTrend === 'down' ? '↓' : '→'

  return (
    <WidgetCard accent="cyan" title="Reality Bratislava" icon="🏘️" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={7} /> : (
        <div className="space-y-3">
          {stats && (
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase tracking-wider">Cena/m²</span>
                <span className="text-[14px] font-bold text-white">{stats.avgPricePerSqm.toLocaleString('sk-SK')} €</span>
              </div>
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase tracking-wider">Trend</span>
                <span className={`text-[14px] font-bold ${trendColor}`}>{trendIcon} {Math.abs(stats.yoyChange)}%</span>
              </div>
              <div className="flex flex-col items-center bg-slate-800/50 rounded-xl p-2">
                <span className="text-[7px] text-slate-500 uppercase tracking-wider">Nové dnes</span>
                <span className="text-[14px] font-bold text-cyan-400">+{stats.newListingsToday}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 flex-wrap">
            {TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`text-[8px] px-2 py-0.5 rounded-full transition-colors ${typeFilter === t ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                {t}
              </button>
            ))}
            <div className="ml-auto flex gap-1">
              {(['new', 'price', 'sqm'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`text-[8px] px-2 py-0.5 rounded-full transition-colors ${sortBy === s ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                  {s === 'new' ? 'nové' : s === 'price' ? 'cena' : 'm²'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-0.5">
            {listings.map(l => (
              <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-white truncate">{l.type} · {l.sqm} m²</span>
                    {l.daysAgo === 0 && <span className="text-[7px] bg-cyan-500/20 text-cyan-400 px-1 rounded">nové</span>}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">{l.area} · {l.condition}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {l.balcony && <span className="text-[8px] text-slate-500" title="balkón">🏠</span>}
                    {l.elevator && <span className="text-[8px] text-slate-500" title="výťah">🛗</span>}
                    {l.parking && <span className="text-[8px] text-slate-500" title="parking">🅿️</span>}
                    <span className="text-[8px] text-slate-500">{l.floor}/{l.floors}p · {l.energyClass}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[13px] font-bold text-cyan-400">{priceTag(l.price)} €</div>
                  <div className="text-[8px] text-slate-500">{l.pricePerSqm.toLocaleString('sk-SK')} €/m²</div>
                  <div className="text-[7px] text-slate-600">{l.daysAgo === 0 ? 'dnes' : `pred ${l.daysAgo}d`}</div>
                </div>
              </a>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <a href="https://www.reality.sk" target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center text-[8px] text-slate-500 hover:text-cyan-400 transition-colors py-1 rounded-lg bg-slate-800/40 hover:bg-slate-700/40">
              reality.sk &rarr;
            </a>
            <a href="https://www.byty.sk" target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center text-[8px] text-slate-500 hover:text-cyan-400 transition-colors py-1 rounded-lg bg-slate-800/40 hover:bg-slate-700/40">
              byty.sk &rarr;
            </a>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
