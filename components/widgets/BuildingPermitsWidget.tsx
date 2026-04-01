'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useState } from 'react'

interface RegionStat {
  region: string
  residential: number
  commercial: number
  industrial: number
  total: number
}

interface BuildingPermitsData {
  byRegion: RegionStat[]
  totalThisYear: number
  totalLastYear: number
  yearOnYearPct: number
  avgProcessingDays: number
  byType: { residential: number; commercial: number; industrial: number; renovation: number }
  updatedAt: string
}

const REGION_CODE: Record<string, string> = { Bratislava: 'BA', Trnava: 'TT', Trenčín: 'TN', Nitra: 'NR', Žilina: 'ZA', 'Banská Bystrica': 'BB', Prešov: 'PO', Košice: 'KE' }

export default function BuildingPermitsWidget() {
  const { data, loading, refetch } = useWidget<BuildingPermitsData>('/api/building-permits', 3600 * 1000)
  const [view, setView] = useState<'region' | 'type'>('region')

  const maxTotal = data ? Math.max(...data.byRegion.map(r => r.total)) : 1

  return (
    <WidgetCard accent="yellow" title="Stavebné povolenia SR" icon="🏗️" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{data.totalThisYear.toLocaleString('sk-SK')}</div>
              <div className="text-[9px] text-slate-500">tento rok</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className={`text-lg font-bold ${data.yearOnYearPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.yearOnYearPct > 0 ? '+' : ''}{data.yearOnYearPct}%
              </div>
              <div className="text-[9px] text-slate-500">rok/rok</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-yellow-400">{data.avgProcessingDays}d</div>
              <div className="text-[9px] text-slate-500">priem. čakanie</div>
            </div>
          </div>

          <div className="flex gap-1">
            {(['region', 'type'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-2.5 py-0.5 rounded text-[10px] border transition-colors ${view === v ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' : 'border-slate-600 text-slate-500 hover:text-slate-300'}`}>
                {v === 'region' ? '🗺️ Kraj' : '🏠 Typ'}
              </button>
            ))}
          </div>

          {view === 'region' ? (
            <div className="space-y-1.5">
              {data.byRegion.sort((a, b) => b.total - a.total).map(r => (
                <div key={r.region} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-8 text-right">{REGION_CODE[r.region] ?? r.region.slice(0, 2).toUpperCase()}</span>
                  <div className="flex-1 h-4 bg-slate-700/40 rounded overflow-hidden">
                    <div className="h-full bg-yellow-500/60 rounded" style={{ width: `${(r.total / maxTotal) * 100}%` }} />
                  </div>
                  <span className="text-[11px] text-white w-12 text-right font-medium">{r.total.toLocaleString('sk-SK')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(data.byType).map(([type, count]) => {
                const labels: Record<string, { label: string; icon: string }> = {
                  residential: { label: 'Bytová výstavba', icon: '🏠' },
                  commercial: { label: 'Komerčné', icon: '🏢' },
                  industrial: { label: 'Priemyselné', icon: '🏭' },
                  renovation: { label: 'Rekonštrukcia', icon: '🔧' },
                }
                const info = labels[type] ?? { label: type, icon: '📋' }
                return (
                  <div key={type} className="bg-slate-700/30 rounded-lg p-2.5 text-center">
                    <div className="text-lg">{info.icon}</div>
                    <div className="text-sm font-bold text-white">{(count as number).toLocaleString('sk-SK')}</div>
                    <div className="text-[9px] text-slate-500">{info.label}</div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="text-[9px] text-slate-600 text-right">ŠÚ SR · Eurostav</div>
        </div>
      )}
    </WidgetCard>
  )
}
