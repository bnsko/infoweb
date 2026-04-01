'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface ForestAlert {
  id: string; region: string; fireRisk: number; fireRiskLevel: string
  illegalLoggingReports: number; calamityAreaHa: number; lastInspection: string
}
interface FloodWarning {
  id: string; river: string; currentLevel: number; normalLevel: number
  warning: string; trend: string; isWarning: boolean
}
interface ForestStats {
  totalForestAreaKm2: number; protectedAreaPct: number; calamityAreaThisYear: number
  illegalLoggingCasesYTD: number; reforestationHa: number
}
interface ForestsData {
  forestAlerts: ForestAlert[]; floodWarnings: FloodWarning[]; forestStats: ForestStats
  activeFloodWarnings: number; highestFireRisk: ForestAlert
  sourceUrl: string; forestUrl: string; updatedAt: string
}

const FIRE_RISK_COLOR = (level: string) =>
  level === 'vysoké' ? 'text-rose-400' : level === 'stredné' ? 'text-amber-400' : 'text-green-400'

const WARNING_COLOR = (w: string) =>
  w === 'výstraha 3' ? 'text-rose-400' : w === 'výstraha 2' ? 'text-orange-400' : w === 'výstraha 1' ? 'text-amber-400' : w === 'pozor' ? 'text-yellow-400' : 'text-green-400'

export default function ForestsFloodsWidget() {
  const { data, loading, refetch } = useWidget<ForestsData>('/api/forests-floods', 60 * 60 * 1000)
  const [tab, setTab] = useState<'forests' | 'floods'>('forests')

  return (
    <WidgetCard accent="green" title="Lesy & Povodne" icon="🌲" onRefresh={refetch}>
      {loading ? <SkeletonRows rows={7} /> : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col bg-slate-800/50 rounded-xl p-2.5">
              <span className="text-[7px] text-slate-500 uppercase">Najvyššie riziko požiaru</span>
              {data?.highestFireRisk && (
                <>
                  <span className="text-[10px] font-semibold text-white mt-0.5">{data.highestFireRisk.region}</span>
                  <span className={`text-[13px] font-bold ${FIRE_RISK_COLOR(data.highestFireRisk.fireRiskLevel)}`}>
                    {data.highestFireRisk.fireRisk}% — {data.highestFireRisk.fireRiskLevel}
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-col bg-slate-800/50 rounded-xl p-2.5">
              <span className="text-[7px] text-slate-500 uppercase">Aktívne povodňové výstrahy</span>
              <span className={`text-[22px] font-bold mt-1 ${data?.activeFloodWarnings ? 'text-amber-400' : 'text-green-400'}`}>
                {data?.activeFloodWarnings ?? 0}
              </span>
            </div>
          </div>

          <div className="flex gap-1">
            {(['forests', 'floods'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 text-[9px] py-1 rounded-lg transition-colors ${tab === t ? (t === 'forests' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300') : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                {t === 'forests' ? 'Lesy & Požiare' : 'Povodne & Vodné toky'}
              </button>
            ))}
          </div>

          {tab === 'forests' && (
            <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
              {(data?.forestAlerts ?? []).map(a => (
                <div key={a.id} className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-slate-800/40">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium text-white">{a.region}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {a.illegalLoggingReports > 0 && <span className="text-[8px] text-amber-400">🪵 {a.illegalLoggingReports} hlásení</span>}
                      {a.calamityAreaHa > 0 && <span className="text-[8px] text-slate-400">{a.calamityAreaHa} ha kalamita</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-[11px] font-bold ${FIRE_RISK_COLOR(a.fireRiskLevel)}`}>{a.fireRisk}%</div>
                    <div className={`text-[7px] ${FIRE_RISK_COLOR(a.fireRiskLevel)}`}>{a.fireRiskLevel}</div>
                  </div>
                </div>
              ))}
              {data?.forestStats && (
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <div className="px-2.5 py-2 rounded-xl bg-slate-800/30">
                    <div className="text-[8px] text-slate-500">Kalamitná plocha</div>
                    <div className="text-[11px] font-bold text-white">{data.forestStats.calamityAreaThisYear.toLocaleString('sk-SK')} ha</div>
                  </div>
                  <div className="px-2.5 py-2 rounded-xl bg-slate-800/30">
                    <div className="text-[8px] text-slate-500">Neopr. ťažba YTD</div>
                    <div className="text-[11px] font-bold text-amber-400">{data.forestStats.illegalLoggingCasesYTD} príp.</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'floods' && (
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
              {(data?.floodWarnings ?? []).map(w => (
                <div key={w.id} className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ${w.isWarning ? 'bg-amber-500/10' : 'bg-slate-800/30'}`}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${w.isWarning ? 'bg-amber-500 animate-pulse' : 'bg-green-600'}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-medium text-white">{w.river}</span>
                    <div className="text-[8px] text-slate-400">{w.currentLevel} cm · {w.trend}</div>
                  </div>
                  <span className={`text-[9px] font-semibold ${WARNING_COLOR(w.warning)}`}>{w.warning}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <a href={data?.forestUrl ?? 'https://www.lesy.sk'} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center text-[8px] text-slate-500 hover:text-green-400 transition-colors py-1 rounded-lg bg-slate-800/30">
              lesy.sk &rarr;
            </a>
            <a href={data?.sourceUrl ?? 'https://www.shmu.sk'} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center text-[8px] text-slate-500 hover:text-blue-400 transition-colors py-1 rounded-lg bg-slate-800/30">
              shmu.sk &rarr;
            </a>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
