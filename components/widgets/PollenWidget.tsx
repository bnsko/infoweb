'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface PollenLevel {
  allergen: string
  emoji: string
  level: number
  levelText: string
  forecast: string
}

interface PollenData {
  allergens: PollenLevel[]
  activeCount: number
  maxLevel: number
  season: boolean
  timestamp: number
}

const LEVEL_COLORS = ['text-slate-500', 'text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400']
const LEVEL_BG = ['bg-slate-500/10', 'bg-green-500/10', 'bg-yellow-500/10', 'bg-orange-500/10', 'bg-red-500/10']

export default function PollenWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<PollenData>('/api/pollen', 60 * 60 * 1000)

  return (
    <WidgetCard accent="green" title={lang === 'sk' ? 'Peľová situácia' : 'Pollen Report'} icon="🌿" onRefresh={refetch}
      badge={data && data.season ? `${data.activeCount} aktívnych` : undefined}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && data && !data.season && (
        <div className="text-center py-4">
          <span className="text-lg">🍂</span>
          <p className="text-[11px] text-slate-400 mt-1">Mimo peľovej sezóny</p>
        </div>
      )}
      {!loading && data && data.season && (
        <div className="space-y-1">
          {data.allergens.filter(a => a.level > 0).map((a, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03]">
              <span className="text-sm">{a.emoji}</span>
              <span className="text-[10px] text-slate-300 flex-1">{a.allergen}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map(l => (
                  <div key={l} className={`w-2.5 h-2.5 rounded-sm ${l <= a.level ? LEVEL_BG[a.level] : 'bg-white/5'}`} />
                ))}
              </div>
              <span className={`text-[9px] font-bold w-16 text-right ${LEVEL_COLORS[a.level]}`}>{a.levelText}</span>
            </div>
          ))}
          {data.allergens.filter(a => a.level === 0).length > 0 && (
            <div className="pt-1 mt-1 border-t border-white/5">
              <p className="text-[9px] text-slate-600 px-2">
                Neaktívne: {data.allergens.filter(a => a.level === 0).map(a => a.allergen).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  )
}
