'use client'

import { useState } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import { useLang } from '@/hooks/useLang'

interface Match {
  id: string; competition: string
  homeTeam: string; awayTeam: string
  homeScore: number | null; awayScore: number | null
  status: string; minute: string | null; startTime: string
}

const SPORTS = [
  { key: 'football', emoji: '⚽', sk: 'Futbal', en: 'Football' },
  { key: 'hockey', emoji: '🏒', sk: 'Hokej', en: 'Hockey' },
  { key: 'basketball', emoji: '🏀', sk: 'Basketbal', en: 'Basketball' },
  { key: 'tennis', emoji: '🎾', sk: 'Tenis', en: 'Tennis' },
  { key: 'f1', emoji: '🏎️', sk: 'F1', en: 'F1' },
  { key: 'mma', emoji: '🥊', sk: 'MMA', en: 'MMA' },
]

function getStatusInfo(status: string): { label: string; color: string; isLive: boolean } {
  const s = status.toUpperCase()
  if (s.includes('LIVE') || s.includes('IN_PLAY') || s.includes('PROGRESS')) return { label: '🔴 LIVE', color: 'text-red-400', isLive: true }
  if (s.includes('PAUSE') || s.includes('HALFTIME')) return { label: '⏸️ HT', color: 'text-yellow-400', isLive: false }
  if (s.includes('FINISH') || s.includes('FINAL')) return { label: '✅', color: 'text-green-400', isLive: false }
  if (s.includes('SCHEDULED')) return { label: '⏰', color: 'text-slate-500', isLive: false }
  return { label: status.slice(0, 10), color: 'text-slate-500', isLive: false }
}

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

export default function SportsWidget() {
  const { t, lang } = useLang()
  const [sport, setSport] = useState('football')
  const { data, loading, refetch } = useWidget<{ matches: Match[]; source: string }>(`/api/sports?sport=${sport}`, 60 * 1000)

  return (
    <WidgetCard accent="green" className="col-span-1 md:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="widget-title mb-0">
          <span>🏆</span>
          <span>{lang === 'sk' ? 'Šport Live' : 'Sports Live'}</span>
          {data?.matches?.some(m => getStatusInfo(m.status).isLive) && (
            <span className="flex items-center gap-1 ml-2 bg-red-500/15 border border-red-500/25 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[9px] text-red-400 font-bold">LIVE</span>
            </span>
          )}
        </div>
        <button onClick={refetch} className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Sport tabs */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto scrollbar-hide">
        {SPORTS.map(s => (
          <button
            key={s.key}
            onClick={() => setSport(s.key)}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              sport === s.key
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>{s.emoji}</span>
            <span>{lang === 'sk' ? s.sk : s.en}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (data?.matches?.length ?? 0) === 0 ? (
        <div className="text-center py-8">
          <span className="text-3xl mb-2 block">🏟️</span>
          <p className="text-sm text-slate-500">{t('sports.noMatches')}</p>
          <p className="text-[10px] text-slate-600 mt-1">
            {lang === 'sk' ? 'Skúste iný šport alebo sa vráťte neskôr' : 'Try another sport or come back later'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 max-h-[500px] overflow-y-auto scrollbar-hide">
          {data!.matches.map(m => {
            const si = getStatusInfo(m.status)
            return (
              <div key={m.id} className={`rounded-xl p-2.5 border transition-all ${
                si.isLive ? 'border-red-500/25 bg-red-500/5' : 'border-white/5 hover:bg-white/3'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wide truncate">{m.competition}</span>
                  <span className={`text-[9px] font-bold ${si.color} shrink-0 ml-1`}>
                    {si.label} {m.minute && si.isLive ? `${m.minute}'` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-medium truncate ${si.isLive ? 'text-white' : 'text-slate-200'}`}>{m.homeTeam}</div>
                    <div className="text-[11px] text-slate-400 truncate">{m.awayTeam}</div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    {m.homeScore !== null ? (
                      <>
                        <div className={`text-sm font-bold tabular-nums ${si.isLive ? 'text-white' : 'text-slate-200'}`}>{m.homeScore}</div>
                        <div className={`text-sm font-bold tabular-nums ${si.isLive ? 'text-white' : 'text-slate-200'}`}>{m.awayScore}</div>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-500">{formatTime(m.startTime)}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">{data?.source ?? 'ESPN'}</p>
    </WidgetCard>
  )
}
