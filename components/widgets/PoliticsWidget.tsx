'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Party {
  name: string
  pct: number
  color: string
  change?: number
}

interface PoliticsData {
  parties: Party[]
  source: string
  date: string
  timestamp: number
}

export default function PoliticsWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<PoliticsData>('/api/politics', 60 * 60 * 1000)

  const maxPct = data ? Math.max(...data.parties.map(p => p.pct)) : 100

  return (
    <WidgetCard
      accent="purple"
      title={lang === 'sk' ? 'Preferencie strán' : 'Party Polls'}
      icon="🏛️"
      onRefresh={refetch}
    >
      {loading && <SkeletonRows rows={8} />}
      {!loading && error && <p className="text-xs text-slate-500">{lang === 'sk' ? 'Chyba' : 'Error'}</p>}
      {!loading && data && data.parties.length > 0 && (
        <>
          <div className="space-y-1">
            {data.parties.map((party, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 w-[110px] text-right truncate font-medium">{party.name}</span>
                <div className="flex-1 h-4 bg-white/[0.04] rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(party.pct / maxPct) * 100}%`,
                      backgroundColor: party.color,
                      opacity: 0.85,
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-300 w-[42px] text-right tabular-nums">{party.pct}%</span>
                {party.change !== undefined && party.change !== 0 && (
                  <span className={`text-[9px] w-[30px] text-right ${party.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {party.change > 0 ? '+' : ''}{party.change}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.06]">
            <span className="text-[9px] text-slate-600">{data.source}</span>
            <span className="text-[9px] text-slate-600">{data.date}</span>
          </div>
        </>
      )}
    </WidgetCard>
  )
}
