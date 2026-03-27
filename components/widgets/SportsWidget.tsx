'use client'

import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import SkeletonRows from '@/components/ui/SkeletonRows'

interface Match {
  id: string | number
  competition: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  status: string
  minute: string | null
  startTime: string
}

interface SportsData {
  matches: Match[]
  source: string
}

function getStatusLabel(status: string): { label: string; color: string } {
  const s = status.toUpperCase()
  if (s.includes('LIVE') || s.includes('IN_PLAY') || s === 'STATUS_IN_PROGRESS') return { label: '🔴 LIVE', color: 'text-red-400' }
  if (s.includes('PAUSE') || s === 'STATUS_HALFTIME') return { label: '⏸️ Polčas', color: 'text-yellow-400' }
  if (s.includes('FINISH') || s === 'STATUS_FINAL') return { label: '✅ Koniec', color: 'text-green-400' }
  if (s.includes('SCHEDULED') || s === 'STATUS_SCHEDULED') return { label: '⏰ Plán.', color: 'text-slate-500' }
  return { label: status, color: 'text-slate-500' }
}

function formatMatchTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

export default function SportsWidget() {
  const { data, loading, error, refetch } = useWidget<SportsData>('/api/sportscore', 60 * 1000)

  return (
    <WidgetCard accent="green" title="⚽ Šport Live" icon="" onRefresh={refetch}>
      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-xs text-slate-500">Chyba načítania</p>}
      {!loading && data && (
        <div className="space-y-1 max-h-[380px] overflow-y-auto">
          {data.matches.length === 0 && (
            <p className="text-xs text-slate-500 py-4 text-center">Momentálne žiadne zápasy</p>
          )}
          {data.matches.map((m) => {
            const statusInfo = getStatusLabel(m.status)
            const isLive = statusInfo.label.includes('LIVE')
            return (
              <div
                key={m.id}
                className={`rounded-lg p-2 border transition-all ${
                  isLive ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 hover:bg-white/3'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wide">{m.competition}</span>
                  <span className={`text-[9px] font-semibold ${statusInfo.color}`}>
                    {statusInfo.label} {m.minute && isLive ? `· ${m.minute}` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-200 font-medium truncate">{m.homeTeam}</div>
                    <div className="text-xs text-slate-400 truncate">{m.awayTeam}</div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    {m.homeScore !== null ? (
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-bold ${isLive ? 'text-white' : 'text-slate-200'}`}>
                          {m.homeScore}
                        </span>
                        <span className={`text-sm font-bold ${isLive ? 'text-white' : 'text-slate-200'}`}>
                          {m.awayScore}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500">{formatMatchTime(m.startTime)}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">{data?.source ?? 'ESPN'} · obnova 1 min</p>
    </WidgetCard>
  )
}
