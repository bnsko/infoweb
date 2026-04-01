'use client'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useState } from 'react'

interface RegionStat {
  region: string
  count: number
}

interface TypeStat {
  type: string
  count: number
}

interface PermitsStats {
  permitsIssuedThisYear: number
  permitsIssuedLastYear: number
  averageProcessingDays: number
  pending: number
  approved: number
  rejected: number
  byRegion: RegionStat[]
  byType: TypeStat[]
}

interface BuildingPermitsData {
  stats: PermitsStats
  source: string
  updatedAt: string
}

const REGION_CODE: Record<string, string> = { Bratislava: 'BA', Trnava: 'TT', Trenčín: 'TN', Nitra: 'NR', Žilina: 'ZA', 'Banská Bystrica': 'BB', Prešov: 'PO', Košice: 'KE' }

export default function BuildingPermitsWidget() {
  const { data, loading, refetch } = useWidget<BuildingPermitsData>('/api/building-permits', 3600 * 1000)
  const [view, setView] = useState<'region' | 'type'>('region')

  const maxTotal = data ? Math.max(...data.stats.byRegion.map(r => r.count)) : 1

  const yoyPct = data
    ? (((data.stats.permitsIssuedThisYear - data.stats.permitsIssuedLastYear) / data.stats.permitsIssuedLastYear) * 100).toFixed(1)
    : '0'

  return (
    <WidgetCard accent="yellow" title="Stavebné povolenia SR" icon="🏗️" onRefresh={refetch}>
      {loading || !data ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-slate-700/40 rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-white">{data.stats.permitsIssuedThisYear.toLocaleString('sk-SK')}</div>
              <div className="text-[9px] text-slate-500">tento rok</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className={`text-lg font-bold ${parseFloat(yoyPct) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(yoyPct) > 0 ? '+' : ''}{yoyPct}%
              </div>
              <div className="text-[9px] text-slate-500">rok/rok</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-yellow-400">{data.stats.averageProcessingDays}d</div>
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
              {data.stats.byRegion.sort((a, b) => b.count - a.count).map(r => (
                <div key={r.region} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-8 text-right">{REGION_CODE[r.region] ?? r.region.slice(0, 2).toUpperCase()}</span>
                  <div className="flex-1 h-4 bg-slate-700/40 rounded overflow-hidden">
                    <div className="h-full bg-yellow-500/60 rounded" style={{ width: `${(r.count / maxTotal) * 100}%` }} />
                  </div>
                  <span className="text-[11px] text-white w-12 text-right font-medium">{r.count.toLocaleString('sk-SK')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {data.stats.byType.map(t => (
                <div key={t.type} className="bg-slate-700/30 rounded-lg p-2.5 text-center">
                  <div className="text-sm font-bold text-white">{t.count.toLocaleString('sk-SK')}</div>
                  <div className="text-[9px] text-slate-500">{t.type}</div>
                </div>
              ))}
            </div>
          )}

          <div className="text-[9px] text-slate-600 text-right">ŠÚ SR · Eurostav</div>
        </div>
      )}
    </WidgetCard>
  )
}
