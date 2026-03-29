'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Outage {
  provider: string
  region: string
  type: string
  status: string
  affected: string
  since: string
  eta?: string
}

interface OutageData {
  outages: Outage[]
  totalActive: number
  allClear: boolean
  timestamp: number
}

export default function OutagesWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<OutageData>('/api/outages', 5 * 60 * 1000)

  return (
    <WidgetCard accent="orange" title={lang === 'sk' ? 'Výpadky internetu' : 'Internet Outages'} icon="📡"
      onRefresh={refetch} badge={data && !data.allClear ? `${data.totalActive}` : undefined}>
      {loading && <SkeletonRows rows={3} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && data?.allClear && (
        <div className="text-center py-4">
          <span className="text-lg">✅</span>
          <p className="text-[11px] text-emerald-400 mt-1">{lang === 'sk' ? 'Všetko funguje' : 'All clear'}</p>
        </div>
      )}
      {!loading && data && !data.allClear && (
        <div className="space-y-1">
          {data.outages.map((o, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
              <span className="text-sm">{o.type === 'Internet' ? '🌐' : o.type === 'Mobil' ? '📱' : '📺'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-200">{o.provider}</span>
                  <span className="text-[8px] px-1 py-0.5 rounded bg-orange-500/15 text-orange-300">{o.type}</span>
                </div>
                <span className="text-[9px] text-slate-500">{o.region} · od {o.since} · ~{o.affected} používateľov</span>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${o.status === 'fixing' ? 'bg-yellow-500/15 text-yellow-300' : 'bg-red-500/15 text-red-300'}`}>
                  {o.status === 'fixing' ? '🔧 Oprava' : '🔍 Šetrenie'}
                </span>
                {o.eta && <p className="text-[8px] text-slate-500 mt-0.5">ETA: {o.eta}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
