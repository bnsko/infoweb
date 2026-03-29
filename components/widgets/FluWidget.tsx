'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface FluData {
  week: number
  incidence: number
  trend: string
  level: string
  regions: { name: string; incidence: number }[]
  dominant: string
  vaccinated: number
}

interface FluResponse {
  flu: FluData
  timestamp: number
}

const LEVEL_STYLE: Record<string, { bg: string; text: string }> = {
  'nízka': { bg: 'bg-green-500/15', text: 'text-green-300' },
  'bežná': { bg: 'bg-yellow-500/15', text: 'text-yellow-300' },
  'zvýšená': { bg: 'bg-orange-500/15', text: 'text-orange-300' },
  'epidémia': { bg: 'bg-red-500/15', text: 'text-red-300' },
}

export default function FluWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<FluResponse>('/api/flu', 60 * 60 * 1000)

  const flu = data?.flu

  return (
    <WidgetCard accent="rose" title={lang === 'sk' ? 'Chrípkový index' : 'Flu Index'} icon="🦠" onRefresh={refetch}
      badge={flu ? flu.level : undefined}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && flu && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-white/[0.02]">
            <div className="flex-1">
              <div className="text-[9px] text-slate-500">Týždeň {flu.week} · Výskyt</div>
              <div className="text-lg font-bold text-white tabular-nums">{flu.incidence.toLocaleString('sk-SK')}<span className="text-[10px] text-slate-500 font-normal"> /100k</span></div>
            </div>
            <div className="text-right">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${LEVEL_STYLE[flu.level]?.bg ?? 'bg-slate-500/15'} ${LEVEL_STYLE[flu.level]?.text ?? 'text-slate-300'}`}>
                {flu.level}
              </span>
              <div className="text-[8px] text-slate-500 mt-0.5">{flu.trend === 'stúpa' ? '📈 Stúpa' : flu.trend === 'klesá' ? '📉 Klesá' : '➡️ Stabilný'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[9px] text-slate-500 px-2">
            <span>🧪 Dominantný: <strong className="text-slate-300">{flu.dominant}</strong></span>
            <span>💉 Zaočkovanosť: <strong className="text-slate-300">{flu.vaccinated}%</strong></span>
          </div>
          <div className="space-y-0.5">
            {flu.regions.map(r => (
              <div key={r.name} className="flex items-center gap-2 px-2 py-0.5">
                <span className="text-[9px] text-slate-400 flex-1">{r.name}</span>
                <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-rose-500/60" style={{ width: `${Math.min(100, r.incidence / 30)}%` }} />
                </div>
                <span className="text-[9px] text-slate-400 tabular-nums w-12 text-right">{r.incidence.toLocaleString('sk-SK')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
