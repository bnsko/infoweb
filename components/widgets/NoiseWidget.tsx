'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface NoiseCity {
  city: string
  overall: number
  traffic: number
  construction: number
  nightAvg: number
  level: string
  zones: { name: string; db: number }[]
}

interface NoiseData {
  cities: NoiseCity[]
  timestamp: number
}

const LEVEL_COLORS: Record<string, string> = {
  'nízky': 'text-green-400',
  'stredný': 'text-yellow-400',
  'vysoký': 'text-orange-400',
  'veľmi vysoký': 'text-red-400',
}

export default function NoiseWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<NoiseData>('/api/noise', 60 * 60 * 1000)

  const cities = data?.cities ?? []

  return (
    <WidgetCard accent="orange" title={lang === 'sk' ? 'Hluk v mestách' : 'City Noise'} icon="🔊" onRefresh={refetch}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && cities.length > 0 && (
        <div className="space-y-1">
          {cities.map((c, i) => (
            <div key={i} className="px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-200 flex-1">{c.city}</span>
                <span className={`text-[11px] font-bold tabular-nums ${LEVEL_COLORS[c.level] ?? 'text-slate-400'}`}>{c.overall} dB</span>
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${c.level === 'veľmi vysoký' ? 'bg-red-500/15 text-red-300' : c.level === 'vysoký' ? 'bg-orange-500/15 text-orange-300' : c.level === 'stredný' ? 'bg-yellow-500/15 text-yellow-300' : 'bg-green-500/15 text-green-300'}`}>
                  {c.level}
                </span>
              </div>
              <div className="flex gap-3 mt-0.5 text-[8px] text-slate-500 pl-0">
                <span>🚗 {c.traffic} dB</span>
                <span>🏗️ {c.construction} dB</span>
                <span>🌙 {c.nightAvg} dB</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
