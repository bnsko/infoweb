'use client'

import { useWidget } from '@/hooks/useWidget'
import type { LaunchesResponse } from '@/lib/types'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import { sk } from 'date-fns/locale'

function statusColor(abbrev: string): string {
  switch (abbrev) {
    case 'Go':  return 'bg-green-500/15 text-green-300 border-green-500/30'
    case 'TBC': return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
    case 'TBD': return 'bg-slate-500/15 text-slate-400 border-slate-500/30'
    case 'Hold': return 'bg-red-500/15 text-red-300 border-red-500/30'
    default:    return 'bg-blue-500/15 text-blue-300 border-blue-500/30'
  }
}

export default function LaunchesWidget() {
  const { data, loading, error, refetch } = useWidget<LaunchesResponse>('/api/launches', 60 * 60 * 1000)

  return (
    <WidgetCard accent="purple" title="Najbližšie štarty rakiet" icon="🚀" className="h-full" onRefresh={refetch}>
      {loading && <SkeletonRows rows={4} cols={2} />}
      {!loading && (error || !data) && <WidgetError />}
      {!loading && data && (
        <div className="space-y-3 max-h-[420px] overflow-y-auto">
          {data.results.length === 0 && (
            <p className="text-slate-500 text-sm py-4 text-center">Žiadne naplánované štarty.</p>
          )}
          {data.results.map((launch, i) => {
            const netDate = new Date(launch.net)
            const alreadyFlown = isPast(netDate)
            const relative = alreadyFlown
              ? 'Práve štartovalo'
              : formatDistanceToNow(netDate, { addSuffix: true, locale: sk })
            const formatted = format(netDate, 'd. MMM yyyy HH:mm', { locale: sk })

            return (
              <div key={launch.id} className={`rounded-xl p-3 border ${i === 0 ? 'bg-purple-500/10 border-purple-500/20' : 'bg-white/3 border-white/5'}`}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="font-semibold text-sm text-white leading-snug">{launch.name}</div>
                  <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(launch.statusAbbrev)}`}>
                    {launch.statusName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                  <span className="text-slate-500">🏢 {launch.provider}</span>
                  <span className="text-slate-500">📍 {launch.pad}</span>
                  <span className="text-slate-400">📅 {formatted} UTC</span>
                  <span className={`font-semibold ${alreadyFlown ? 'text-green-400' : 'text-purple-300'}`}>
                    ⏱ {relative}
                  </span>
                </div>
                {launch.missionDesc && (
                  <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">{launch.missionDesc}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">Launch Library 2 · obnova 1 hod</p>
    </WidgetCard>
  )
}
