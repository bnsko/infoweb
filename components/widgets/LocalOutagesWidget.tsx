'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface LocalOutage {
  type: 'electricity' | 'construction' | 'nightDisturbance'
  title: string
  location: string
  city: string
  since: string
  until?: string
  provider?: string
  note?: string
}

interface LocalOutagesData {
  outages: LocalOutage[]
  timestamp: number
}

const TYPE_STYLE: Record<string, { emoji: string; bg: string; text: string }> = {
  electricity: { emoji: '⚡', bg: 'bg-yellow-500/10', text: 'text-yellow-300' },
  construction: { emoji: '🚧', bg: 'bg-orange-500/10', text: 'text-orange-300' },
  nightDisturbance: { emoji: '🌙', bg: 'bg-purple-500/10', text: 'text-purple-300' },
}

export default function LocalOutagesWidget() {
  const { lang } = useLang()
  const { data, loading, error, refetch } = useWidget<LocalOutagesData>('/api/localoutages', 10 * 60 * 1000)

  const outages = data?.outages ?? []

  return (
    <WidgetCard accent="orange" title={lang === 'sk' ? 'Lokálne narušenia' : 'Local Disruptions'} icon="⚠️" onRefresh={refetch}
      badge={outages.length > 0 ? `${outages.length}` : undefined}>
      {loading && <SkeletonRows rows={3} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba</p>}
      {!loading && outages.length === 0 && (
        <div className="text-center py-4">
          <span className="text-lg">✅</span>
          <p className="text-[11px] text-emerald-400 mt-1">{lang === 'sk' ? 'Bez narušení' : 'All clear'}</p>
        </div>
      )}
      {!loading && outages.length > 0 && (
        <div className="space-y-1">
          {outages.map((o, i) => {
            const s = TYPE_STYLE[o.type] ?? TYPE_STYLE.construction
            return (
              <div key={i} className={`px-2 py-1.5 rounded-lg ${s.bg} border border-white/5`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{s.emoji}</span>
                  <span className={`text-[10px] font-semibold ${s.text}`}>{o.title}</span>
                  {o.provider && <span className="text-[8px] text-slate-500">{o.provider}</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5 pl-6 text-[9px] text-slate-500">
                  <span>📍 {o.city}, {o.location}</span>
                  <span>· {o.since}{o.until ? ` – ${o.until}` : ''}</span>
                </div>
                {o.note && <p className="text-[8px] text-slate-500 pl-6 mt-0.5">{o.note}</p>}
              </div>
            )
          })}
        </div>
      )}
    </WidgetCard>
  )
}
