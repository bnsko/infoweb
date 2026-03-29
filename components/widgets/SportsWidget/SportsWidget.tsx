'use client'

import { useState, useMemo } from 'react'
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
  { key: 'handball', emoji: '🤾', sk: 'Hádzaná', en: 'Handball' },
  { key: 'volleyball', emoji: '🏐', sk: 'Volejbal', en: 'Volleyball' },
  { key: 'rugby', emoji: '🏉', sk: 'Rugby', en: 'Rugby' },
]

type MatchCategory = 'live' | 'halftime' | 'finished' | 'scheduled'

function categorize(status: string): MatchCategory {
  const s = status.toUpperCase()
  if (s.includes('LIVE') || s.includes('IN_PLAY') || s.includes('PROGRESS')) return 'live'
  if (s.includes('PAUSE') || s.includes('HALFTIME')) return 'halftime'
  if (s.includes('FINISH') || s.includes('FINAL')) return 'finished'
  return 'scheduled'
}

function formatTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString('sk-SK', { day: 'numeric', month: 'short' }) }
  catch { return '' }
}

function TeamLogo({ src, name, size = 8 }: { src?: string | null; name: string; size?: number }) {
  const fallback = name.slice(0, 2).toUpperCase()
  const cls = `w-${size} h-${size}`
  if (!src) return (
    <div className={`${cls} rounded-full bg-white/[0.06] flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0`}
      style={{ width: size * 4, height: size * 4 }}>
      {fallback}
    </div>
  )
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} className="object-contain shrink-0" style={{ width: size * 4, height: size * 4 }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
  )
}

/* ── LIVE Match Card (prominent) ── */
function LiveMatchCard({ m }: { m: Match }) {
  const isHT = categorize(m.status) === 'halftime'
  return (
    <div className={`rounded-xl border p-3 transition-all ${
      isHT ? 'bg-amber-500/8 border-amber-500/20' : 'bg-red-500/8 border-red-500/25 shadow-lg shadow-red-500/5'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider truncate">{m.competition}</span>
        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${isHT ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
          {!isHT && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
          <span className={`text-[9px] font-black ${isHT ? 'text-amber-400' : 'text-red-400'}`}>{isHT ? 'POLČAS' : 'LIVE'}</span>
          {m.minute && <span className={`text-[9px] font-mono ${isHT ? 'text-amber-300' : 'text-red-300'}`}>{m.minute}&apos;</span>}
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <TeamLogo src={m.homeCrest} name={m.homeTeam} size={8} />
          <span className="flex-1 text-[12px] font-bold text-white truncate">{m.homeTeam}</span>
          <span className="text-xl font-black tabular-nums text-white min-w-[28px] text-right">{m.homeScore ?? 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <TeamLogo src={m.awayCrest} name={m.awayTeam} size={8} />
          <span className="flex-1 text-[12px] font-semibold text-slate-200 truncate">{m.awayTeam}</span>
          <span className="text-xl font-black tabular-nums text-white min-w-[28px] text-right">{m.awayScore ?? 0}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Result Row (compact, finished match) ── */
function ResultRow({ m }: { m: Match }) {
  const homeWin = (m.homeScore ?? 0) > (m.awayScore ?? 0)
  const awayWin = (m.awayScore ?? 0) > (m.homeScore ?? 0)
  return (
    <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/[0.03] transition-colors border border-white/[0.03]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <TeamLogo src={m.homeCrest} name={m.homeTeam} size={5} />
          <span className={`text-[11px] truncate ${homeWin ? 'text-white font-bold' : 'text-slate-400'}`}>{m.homeTeam}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <TeamLogo src={m.awayCrest} name={m.awayTeam} size={5} />
          <span className={`text-[11px] truncate ${awayWin ? 'text-white font-bold' : 'text-slate-400'}`}>{m.awayTeam}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-[13px] font-black tabular-nums ${homeWin ? 'text-emerald-400' : 'text-slate-300'}`}>{m.homeScore}</div>
        <div className={`text-[13px] font-black tabular-nums ${awayWin ? 'text-emerald-400' : 'text-slate-300'}`}>{m.awayScore}</div>
      </div>
      <div className="shrink-0 w-12 text-right">
        <span className="text-[8px] text-emerald-400/70 font-semibold">FT</span>
        <div className="text-[8px] text-slate-600">{m.competition}</div>
      </div>
    </div>
  )
}

/* ── Scheduled Row (upcoming) ── */
function ScheduledRow({ m }: { m: Match }) {
  return (
    <div className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/[0.03] transition-colors border border-white/[0.03]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <TeamLogo src={m.homeCrest} name={m.homeTeam} size={5} />
          <span className="text-[11px] text-slate-300 truncate">{m.homeTeam}</span>
          <span className="text-[9px] text-slate-600">vs</span>
          <TeamLogo src={m.awayCrest} name={m.awayTeam} size={5} />
          <span className="text-[11px] text-slate-300 truncate">{m.awayTeam}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-[10px] text-slate-500 font-mono">{formatTime(m.startTime)}</div>
        <div className="text-[8px] text-slate-600">{formatDate(m.startTime)} · {m.competition}</div>
      </div>
    </div>
  )
}

type ViewTab = 'all' | 'live' | 'results' | 'upcoming'

export default function SportsWidget() {
  const { lang } = useLang()
  const [sport, setSport] = useState('football')
  const [view, setView] = useState<ViewTab>('all')
  const { data, loading, refetch } = useWidget<{ matches: Match[]; source: string }>(`/api/sports?sport=${sport}`, 30 * 1000)

  const { live, halftime, finished, scheduled } = useMemo(() => {
    const matches = data?.matches ?? []
    return {
      live: matches.filter(m => categorize(m.status) === 'live'),
      halftime: matches.filter(m => categorize(m.status) === 'halftime'),
      finished: matches.filter(m => categorize(m.status) === 'finished'),
      scheduled: matches.filter(m => categorize(m.status) === 'scheduled'),
    }
  }, [data])

  const liveCount = live.length + halftime.length

  const VIEWS: { key: ViewTab; label: string; badge?: number }[] = [
    { key: 'all', label: lang === 'sk' ? 'Všetko' : 'All', badge: data?.matches?.length },
    { key: 'live', label: 'LIVE', badge: liveCount || undefined },
    { key: 'results', label: lang === 'sk' ? 'Výsledky' : 'Results', badge: finished.length || undefined },
    { key: 'upcoming', label: lang === 'sk' ? 'Nadchádzajúce' : 'Upcoming', badge: scheduled.length || undefined },
  ]

  return (
    <WidgetCard accent="green" className="col-span-1 md:col-span-2"
      title={lang === 'sk' ? 'Šport' : 'Sports'}
      icon="🏆"
      onRefresh={refetch}
      headerRight={liveCount > 0 ? (
        <span className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/25 rounded-full px-2.5 py-1 ml-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-red-400 font-black">{liveCount} LIVE</span>
        </span>
      ) : undefined}
    >
      {/* Sport selector */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto scrollbar-hide pb-0.5">
        {SPORTS.map(s => (
          <button key={s.key} onClick={() => setSport(s.key)}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              sport === s.key
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
            }`}>
            <span className="text-xs">{s.emoji}</span>
            <span>{lang === 'sk' ? s.sk : s.en}</span>
          </button>
        ))}
      </div>

      {/* View tabs */}
      <div className="flex gap-0.5 mb-3 bg-white/[0.03] rounded-lg p-0.5 border border-white/5">
        {VIEWS.map(v => (
          <button key={v.key} onClick={() => setView(v.key)}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1.5 rounded-md transition-all ${
              view === v.key
                ? v.key === 'live' ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}>
            {v.key === 'live' && liveCount > 0 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
            <span>{v.label}</span>
            {v.badge ? <span className="text-[8px] opacity-60">({v.badge})</span> : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : (data?.matches?.length ?? 0) === 0 ? (
        <div className="text-center py-8">
          <span className="text-3xl mb-2 block">🏟️</span>
          <p className="text-sm text-slate-400 font-medium">{lang === 'sk' ? 'Žiadne zápasy' : 'No matches'}</p>
          <p className="text-[10px] text-slate-600 mt-1">{lang === 'sk' ? 'Skúste iný šport' : 'Try another sport'}</p>
        </div>
      ) : (
        <div className="max-h-[480px] overflow-y-auto scrollbar-hide space-y-3">
          {/* LIVE section */}
          {(view === 'all' || view === 'live') && (live.length > 0 || halftime.length > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Live</span>
                <div className="flex-1 h-px bg-red-500/15" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[...live, ...halftime].map(m => <LiveMatchCard key={m.id} m={m} />)}
              </div>
            </div>
          )}

          {/* RESULTS section */}
          {(view === 'all' || view === 'results') && finished.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  {lang === 'sk' ? '✅ Výsledky' : '✅ Results'}
                </span>
                <div className="flex-1 h-px bg-emerald-500/15" />
              </div>
              <div className="space-y-0.5">
                {finished.map(m => <ResultRow key={m.id} m={m} />)}
              </div>
            </div>
          )}

          {/* UPCOMING section */}
          {(view === 'all' || view === 'upcoming') && scheduled.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'sk' ? '🕐 Nadchádzajúce' : '🕐 Upcoming'}
                </span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="space-y-0.5">
                {scheduled.map(m => <ScheduledRow key={m.id} m={m} />)}
              </div>
            </div>
          )}

          {/* Empty state for specific views */}
          {view === 'live' && liveCount === 0 && (
            <div className="text-center py-6 text-slate-500 text-[11px]">
              {lang === 'sk' ? 'Momentálne žiadne live zápasy' : 'No live matches right now'}
            </div>
          )}
          {view === 'results' && finished.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-[11px]">
              {lang === 'sk' ? 'Žiadne dnešné výsledky' : 'No results today'}
            </div>
          )}
          {view === 'upcoming' && scheduled.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-[11px]">
              {lang === 'sk' ? 'Žiadne naplánované zápasy' : 'No upcoming matches'}
            </div>
          )}
        </div>
      )}

      <p className="text-[9px] text-slate-600 mt-3 text-center">{data?.source ?? 'ESPN'} · {lang === 'sk' ? 'obnova 30s' : 'refresh 30s'}</p>
    </WidgetCard>
  )
}
