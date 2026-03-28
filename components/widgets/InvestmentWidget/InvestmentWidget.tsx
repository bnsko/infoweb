'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'

interface IndexData { name: string; symbol: string; value: number; change: number; ytd: number; emoji: string }
interface ETFData { name: string; symbol: string; price: number; change: number; ytd: number; expense: number; emoji: string }
interface SectorData { name: string; change: number; ytd: number; emoji: string }
interface HistoryPoint { month: string; value: number }
interface SourceLink { name: string; url: string }
interface InvestData {
  indices: IndexData[]; etfs: ETFData[]; sectors: SectorData[]
  spHistory: HistoryPoint[]; insights: string[]; sources: SourceLink[]
}

type Tab = 'indices' | 'etf' | 'sectors' | 'chart'

function chg(v: number) {
  if (v > 0) return { cls: 'text-green-400', arrow: '\u25b2' }
  if (v < 0) return { cls: 'text-red-400', arrow: '\u25bc' }
  return { cls: 'text-slate-400', arrow: '\u2500' }
}

export default function InvestmentWidget() {
  const [tab, setTab] = useState<Tab>('indices')
  const [insightIdx, setInsightIdx] = useState(0)
  const { data, loading, refetch } = useWidget<InvestData>('/api/investments', 15 * 60 * 1000)

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'indices', icon: '\ud83d\udcc8', label: 'Indexy' },
    { key: 'etf', icon: '\ud83d\udcca', label: 'ETF' },
    { key: 'sectors', icon: '\ud83c\udfed', label: 'Sektory' },
    { key: 'chart', icon: '\ud83d\udcc9', label: 'S&P 500' },
  ]

  const insights = data?.insights ?? []

  return (
    <WidgetCard accent="green" title="\ud83d\udcc8 Investicie & Trhy" icon="" onRefresh={refetch}>
      {/* Rotating insight */}
      {insights.length > 0 && (
        <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-xl px-3 py-2 mb-3 cursor-pointer"
          onClick={() => setInsightIdx(i => (i + 1) % insights.length)}>
          <p className="text-[10px] text-emerald-300/80 leading-relaxed">{'\ud83d\udca1'} {insights[insightIdx % insights.length]}</p>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex items-center gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {TABS.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              tab === tb.key ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{tb.icon}</span>
            <span className="hidden sm:inline">{tb.label}</span>
          </button>
        ))}
      </div>

      {loading && <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>}

      {/* Indices tab */}
      {!loading && tab === 'indices' && (
        <div className="space-y-1.5 max-h-[360px] overflow-y-auto scrollbar-hide">
          {(data?.indices ?? []).map((idx, i) => {
            const c = chg(idx.change)
            const y = chg(idx.ytd)
            return (
              <div key={idx.symbol} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-all ${
                i === 0 ? 'bg-emerald-500/8 border-emerald-500/15' : 'bg-white/[0.02] border-white/5'
              }`}>
                <span className="text-sm shrink-0">{idx.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white">{idx.name}</span>
                    <span className="text-[8px] text-slate-500 font-mono">{idx.symbol}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-bold text-white tabular-nums">{idx.value.toLocaleString('en')}</div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className={`text-[9px] font-bold tabular-nums ${c.cls}`}>{c.arrow}{Math.abs(idx.change)}%</span>
                    <span className={`text-[8px] tabular-nums ${y.cls}`}>YTD {idx.ytd > 0 ? '+' : ''}{idx.ytd}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ETF tab */}
      {!loading && tab === 'etf' && (
        <div className="space-y-1.5 max-h-[360px] overflow-y-auto scrollbar-hide">
          {(data?.etfs ?? []).map(etf => {
            const c = chg(etf.change)
            const y = chg(etf.ytd)
            return (
              <div key={etf.symbol} className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-white/[0.02] border border-white/5 hover:border-emerald-500/15 transition-all">
                <span className="text-sm shrink-0">{etf.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white">{etf.symbol}</span>
                    <span className="text-[8px] text-emerald-400/60 font-mono">{etf.expense}% TER</span>
                  </div>
                  <span className="text-[9px] text-slate-500 truncate block">{etf.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-bold text-white tabular-nums">${etf.price.toFixed(1)}</div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className={`text-[9px] font-bold tabular-nums ${c.cls}`}>{c.arrow}{Math.abs(etf.change)}%</span>
                    <span className={`text-[8px] tabular-nums ${y.cls}`}>YTD {etf.ytd > 0 ? '+' : ''}{etf.ytd}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Sectors tab */}
      {!loading && tab === 'sectors' && (
        <div className="space-y-1.5 max-h-[360px] overflow-y-auto scrollbar-hide">
          {(data?.sectors ?? []).sort((a, b) => b.ytd - a.ytd).map(sec => {
            const c = chg(sec.change)
            const y = chg(sec.ytd)
            const barW = Math.min(Math.abs(sec.ytd) * 4, 100)
            return (
              <div key={sec.name} className="flex items-center gap-2 rounded-lg px-2 py-2 bg-white/[0.02] border border-white/5">
                <span className="text-xs shrink-0">{sec.emoji}</span>
                <span className="text-[10px] font-medium text-slate-300 w-24 shrink-0">{sec.name}</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${sec.ytd >= 0 ? 'bg-emerald-400/60' : 'bg-red-400/60'}`} style={{ width: `${barW}%` }} />
                </div>
                <span className={`text-[9px] font-bold w-10 text-right tabular-nums ${c.cls}`}>{c.arrow}{Math.abs(sec.change)}%</span>
                <span className={`text-[9px] font-bold w-14 text-right tabular-nums ${y.cls}`}>YTD {sec.ytd > 0 ? '+' : ''}{sec.ytd}%</span>
              </div>
            )
          })}
        </div>
      )}

      {/* S&P 500 chart tab */}
      {!loading && tab === 'chart' && data?.spHistory && (
        <div>
          <p className="text-[10px] text-slate-500 mb-2">S&P 500 - poslednych 12 mesiacov</p>
          <div className="relative h-[180px] bg-white/[0.02] rounded-xl border border-white/5 p-3">
            <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="none">
              {(() => {
                const pts = data.spHistory
                const minV = Math.min(...pts.map(p => p.value)) - 50
                const maxV = Math.max(...pts.map(p => p.value)) + 50
                const toX = (i: number) => (i / (pts.length - 1)) * 290 + 5
                const toY = (v: number) => 110 - ((v - minV) / (maxV - minV)) * 100
                const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.value)}`).join(' ')
                const areaPath = linePath + ` L ${toX(pts.length - 1)} 115 L ${toX(0)} 115 Z`
                return (
                  <>
                    <defs><linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.3" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs>
                    <path d={areaPath} fill="url(#ig)" />
                    <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => (
                      <circle key={i} cx={toX(i)} cy={toY(p.value)} r="3" fill="#10b981" stroke="#0f172a" strokeWidth="1.5" />
                    ))}
                  </>
                )
              })()}
            </svg>
          </div>
          <div className="flex justify-between text-[8px] text-slate-600 mt-1 px-1">
            {data.spHistory.filter((_, i) => i % 3 === 0 || i === data.spHistory.length - 1).map((p, i) => (
              <span key={i}>{p.month}</span>
            ))}
          </div>
        </div>
      )}

      {/* Source links */}
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-3 pt-2 border-t border-white/5">
        {(data?.sources ?? []).map(s => (
          <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[8px] text-slate-600 hover:text-emerald-400 transition-colors">
            {s.name} {'\u2197'}
          </a>
        ))}
      </div>
    </WidgetCard>
  )
}
