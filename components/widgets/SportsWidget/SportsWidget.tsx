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
  homeCrest?: string | null
  awayCrest?: string | null
}

const SPORTS = [
  { key: 'football', emoji: '⚽', sk: 'Futbal', en: 'Football' },
  { key: 'hockey', emoji: '🏒', sk: 'Hokej', en: 'Hockey' },
  { key: 'basketball', emoji: '🏀', sk: 'Basketbal', en: 'Basketball' },
  { key: 'tennis', emoji: '🎾', sk: 'Tenis', en: 'Tennis' },
  { key: 'f1', emoji: '🏎️', sk: 'F1', en: 'F1' },
  { key: 'mma', emoji: '🥊', sk: 'MMA', en: 'MMA' },
]

function getStatusInfo(status: string): { label: string; color: string; bg: string; isLive: boolean } {
  const s = status.toUpperCase()
  if (s.includes('LIVE') || s.includes('IN_PLAY') || s.includes('PROGRESS'))
    return { label: 'LIVE', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', isLive: true }
  if (s.includes('PAUSE') || s.includes('HALFTIME'))
    return { label: 'HT', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25', isLive: false }
  if (s.includes('FINISH') || s.includes('FINAL'))
    return { label: 'FT', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', isLive: false }
  if (s.includes('SCHEDULED'))
    return { label: '', color: 'text-slate-500', bg: 'bg-white/[0.02] border-white/5', isLive: false }
  return { label: status.slice(0, 8), color: 'text-slate-500', bg: 'bg-white/[0.02] border-white/5', isLive: false }
}

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

function TeamLogo({ src, name }: { src?: string | null; name: string }) {
  const fallback = name.slice(0, 2).toUpperCase()
  if (!src) return (
    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
      {fallback}
    </div>
  )
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} className="w-8 h-8 object-contain shrink-0"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
  )
}

function MatchCard({ m }: { m: Match }) {
  const si = getStatusInfo(m.status)
  const hasScore = m.homeScore !== null
  return (
    <div className={`rounded-xl border p-3 transition-all hover:scale-[1.01] ${si.bg} ${si.isLive ? 'shadow-lg shadow-red-500/5' : ''}`}>
      {/* Header: league + status */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider truncate">{m.competition}</span>
        {si.isLive ? (
          <span className="flex items-center gap-1 bg-red-500/20 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[9px] text-red-400 font-black tracking-wide">{si.label}</span>
            {m.minute && <span className="text-[9px] text-red-300 font-mono">{m.minute}&apos;</span>}
          </span>
        ) : si.label ? (
          <span className={`text-[9px] font-bold ${si.color}`}>{si.label}</span>
        ) : null}
      </div>

      {/* Teams + Score */}
      <div className="space-y-1.5">
        {/* Home */}
        <div className="flex items-center gap-2">
          <TeamLogo src={m.homeCrest} name={m.homeTeam} />
          <span className={`flex-1 text-[12px] font-semibold truncate ${si.isLive ? 'text-white' : 'text-slate-200'}`}>{m.homeTeam}</span>
          {hasScore ? (
            <span className={`text-lg font-black tabular-nums min-w-[24px] text-right ${
              si.isLive ? 'text-white' : m.homeScore! > (m.awayScore ?? 0) ? 'text-emerald-400' : 'text-slate-300'
            }`}>{m.homeScore}</span>
          ) : (
            <span className="text-[10px] text-slate-500 font-mono">{formatTime(m.startTime)}</span>
          )}
        </div>
        {/* Away */}
        <div className="flex items-center gap-2">
          <TeamLogo src={m.awayCrest} name={m.awayTeam} />
          <span className={`flex-1 text-[12px] truncate ${si.isLive ? 'text-slate-100' : 'text-slate-400'}`}>{m.awayTeam}</span>
          {hasScore && (
            <span className={`text-lg font-black tabular-nums min-w-[24px] text-right ${
              si.isLive ? 'text-white' : m.awayScore! > (m.homeScore ?? 0) ? 'text-emerald-400' : 'text-slate-300'
            }`}>{m.awayScore}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SportsWidget() {
  const { lang } = useLang()
  const [sport, setSport] = useState('football')
  const { data, loading, refetch } = useWidget<{ matches: Match[]; source: string }>(`/api/sports?sport=${sport}`, 60 * 1000)

  const liveCount = data?.matches?.filter(m => getStatusInfo(m.status).isLive).length ?? 0

  return (
    <WidgetCard accent="green" className="col-span-1 md:col-span-2"
      title={lang === 'sk' ? 'Šport Live' : 'Sports Live'}
      icon="🏆"
      onRefresh={refetch}
      headerRight={liveCount > 0 ? (
        <span className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/25 rounded-full px-2.5 py-1 ml-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-red-400 font-black">{liveCount} LIVE</span>
        </span>
      ) : undefined}
    >
      {/* Sport tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide pb-0.5">
        {SPORTS.map(s => {
          const active = sport === s.key
          return (
            <button
              key={s.key}
              onClick={() => setSport(s.key)}
              className={`flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                active
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="text-sm">{s.emoji}</span>
              <span>{lang === 'sk' ? s.sk : s.en}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : (data?.matches?.length ?? 0) === 0 ? (
        <div className="text-center py-10">
          <span className="text-4xl mb-3 block">🏟️</span>
          <p className="text-sm text-slate-400 font-medium">{lang === 'sk' ? 'Žiadne zápasy' : 'No matches'}</p>
          <p className="text-[10px] text-slate-600 mt-1">
            {lang === 'sk' ? 'Skúste iný šport alebo sa vráťte neskôr' : 'Try another sport or come back later'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[520px] overflow-y-auto scrollbar-hide">
          {data!.matches.map(m => <MatchCard key={m.id} m={m} />)}
        </div>
      )}

      <p className="text-[9px] text-slate-600 mt-3 text-center">{data?.source ?? 'ESPN'} · {lang === 'sk' ? 'obnova 1 min' : 'refresh 1 min'}</p>
    </WidgetCard>
  )
}
