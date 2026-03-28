'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface InflationEntry {
  country: string; flag: string; current: number; previous: number
  trend: 'up' | 'down' | 'stable'; source: string
}

interface InflationData {
  data: InflationEntry[]
  ecbRate: number
}

export default function InflationWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<InflationData>('/api/inflation', 60 * 60 * 1000)

  const trendIcon = (t: string) => t === 'up' ? '📈' : t === 'down' ? '📉' : '➡️'
  const trendColor = (t: string) => t === 'up' ? 'text-red-400' : t === 'down' ? 'text-green-400' : 'text-slate-400'

  return (
    <WidgetCard accent="rose" title={lang === 'sk' ? 'Inflácia · Stredná Európa' : 'Inflation · Central Europe'} icon="📊" onRefresh={refetch}>
      {loading && <SkeletonRows rows={5} />}
      {!loading && data && (
        <>
          <div className="space-y-1">
            {data.data.map((entry, i) => {
              const diff = Math.round((entry.current - entry.previous) * 10) / 10
              const isSK = entry.flag === '🇸🇰'
              return (
                <div key={i} className={`flex items-center gap-2 rounded-xl p-2 border transition-all ${
                  isSK ? 'bg-violet-500/8 border-violet-500/15' : 'bg-white/[0.02] border-white/5'
                }`}>
                  <span className="text-base shrink-0">{entry.flag}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[11px] font-medium ${isSK ? 'text-white' : 'text-slate-300'}`}>{entry.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold font-mono ${trendColor(entry.trend)}`}>
                      {entry.current}%
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {trendIcon(entry.trend)} {diff > 0 ? '+' : ''}{diff}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ECB Rate */}
          <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl bg-blue-500/8 border border-blue-500/15">
            <span className="text-[10px] text-blue-300 font-semibold">🏦 ECB {lang === 'sk' ? 'sadzba' : 'rate'}</span>
            <span className="text-[12px] text-blue-200 font-bold font-mono">{data.ecbRate}%</span>
          </div>
        </>
      )}
      <p className="text-[10px] text-slate-600 mt-2">Eurostat HICP · {lang === 'sk' ? 'obnova 1 hod' : 'refresh 1 hr'}</p>
    </WidgetCard>
  )
}
