'use client'

import { useWidget } from '@/hooks/useWidget'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Deadline { icon: string; title: string; description: string; daysUntil: number; date: string; month: number; day: number }
interface TaxData { upcoming: Deadline[]; urgent: Deadline[]; totalThisYear: number; timestamp: number }

export default function TaxCalendarWidget() {
  const { lang } = useLang()
  const { data, loading, refetch } = useWidget<TaxData>('/api/taxcalendar', 60 * 60 * 1000)

  return (
    <WidgetCard accent="rose" title={lang === 'sk' ? 'Daňový kalendár' : 'Tax Calendar'} icon="🏛️" onRefresh={refetch}
      badge={data?.urgent && data.urgent.length > 0 ? `${data.urgent.length} urgentné` : undefined}>
      {loading && <SkeletonRows rows={3} />}
      {!loading && data && (
        <div className="space-y-2">
          {data.urgent.length > 0 && (
            <div className="rounded-xl p-2.5 bg-red-500/[0.06] border border-red-500/15">
              <div className="text-[9px] font-bold text-red-400 mb-1">⚠️ Urgentné termíny (do 14 dní)</div>
              {data.urgent.map((d, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <span>{d.icon}</span>
                  <span className="text-[10px] text-slate-200 font-medium flex-1">{d.title}</span>
                  <span className="text-[9px] text-red-400 font-bold">za {d.daysUntil}d</span>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-0.5">
            {data.upcoming.map((d, i) => (
              <div key={i} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 border transition-colors ${
                d.daysUntil <= 7 ? 'bg-red-500/5 border-red-500/10' : d.daysUntil <= 30 ? 'bg-amber-500/5 border-amber-500/10' : 'bg-white/[0.02] border-white/5'
              }`}>
                <span className="text-sm">{d.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-slate-200 font-medium">{d.title}</div>
                  <div className="text-[8px] text-slate-500">{d.description}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-[10px] font-bold ${d.daysUntil <= 7 ? 'text-red-400' : d.daysUntil <= 30 ? 'text-amber-400' : 'text-slate-400'}`}>za {d.daysUntil}d</div>
                  <div className="text-[8px] text-slate-600">{d.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
