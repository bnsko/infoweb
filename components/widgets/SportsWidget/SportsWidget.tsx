'use client'

import { useState, useMemo, useEffect } from 'react'
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

interface StandingEntry {
  rank: number; team: string; logo: string | null
  played: number; won: number; drawn: number; lost: number
  goalsFor: number; goalsAgainst: number; points: number; form: string
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
  { key: 'golf', emoji: '⛳', sk: 'Golf', en: 'Golf' },
  { key: 'baseball', emoji: '⚾', sk: 'Baseball', en: 'Baseball' },
  { key: 'cycling', emoji: '🚴', sk: 'Cyklistika', en: 'Cycling' },
  { key: 'skiing', emoji: '⛷️', sk: 'Lyžovanie', en: 'Skiing' },
  { key: 'athletics', emoji: '🏃', sk: 'Atletika', en: 'Athletics' },
  { key: 'boxing', emoji: '🥊', sk: 'Box', en: 'Boxing' },
  { key: 'snooker', emoji: '🎱', sk: 'Snooker', en: 'Snooker' },
  { key: 'darts', emoji: '🎯', sk: 'Šípky', en: 'Darts' },
  { key: 'esports', emoji: '🖥️', sk: 'Esports', en: 'Esports' },
]

type MatchCategory = 'live' | 'halftime' | 'finished' | 'scheduled'
type MainTab = 'scores' | 'standings' | 'facts'
type ScoreFilter = 'all' | 'live' | 'results' | 'upcoming'

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

function FormBadge({ ch }: { ch: string }) {
  const color = ch === 'W' ? 'bg-green-500' : ch === 'L' ? 'bg-red-500' : ch === 'D' ? 'bg-slate-500' : 'bg-amber-500'
  return (
    <span className={`inline-flex w-3.5 h-3.5 ${color} rounded-sm items-center justify-center text-[6px] text-white font-black shrink-0`}>{ch}</span>
  )
}

function StandingsTable({ sport }: { sport: string }) {
  const { data, loading } = useWidget<{ standings: StandingEntry[]; league: string }>(`/api/sports?sport=${sport}&action=standings`, 60 * 60 * 1000)
  if (loading) return <div className="space-y-1">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-7 rounded" />)}</div>
  if (!data?.standings?.length) return (
    <div className="text-center py-10 text-[11px] text-slate-500">Tabuľka nie je dostupná pre tento šport</div>
  )
  return (
    <div>
      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2 px-1">{data.league}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-[9px]">
          <thead>
            <tr className="text-slate-600 border-b border-white/5">
              <th className="text-left px-1 py-1 font-medium w-6">#</th>
              <th className="text-left px-1 py-1 font-medium">Tím</th>
              <th className="text-center px-1 py-1 font-medium">Z</th>
              <th className="text-center px-1 py-1 font-medium text-green-600">V</th>
              <th className="text-center px-1 py-1 font-medium">R</th>
              <th className="text-center px-1 py-1 font-medium text-red-600">P</th>
              <th className="text-center px-1 py-1 font-medium">Skóre</th>
              <th className="text-center px-1 py-1 font-bold text-slate-300">B</th>
              <th className="text-left px-1 py-1 font-medium">Forma</th>
            </tr>
          </thead>
          <tbody>
            {data.standings.map((s) => {
              const isTop = s.rank <= 4
              const isBottom = s.rank > data.standings.length - 3
              return (
                <tr key={s.rank} className={`border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors
                  ${isTop ? 'text-white' : isBottom ? 'text-rose-400/80' : 'text-slate-300'}`}>
                  <td className="px-1 py-1.5 text-slate-500 font-mono">
                    <span className="flex items-center gap-0.5">
                      {isTop && <span className="w-0.5 h-3.5 bg-green-500 rounded-full" />}
                      {isBottom && <span className="w-0.5 h-3.5 bg-red-500 rounded-full" />}
                      {s.rank}
                    </span>
                  </td>
                  <td className="px-1 py-1.5">
                    <div className="flex items-center gap-1.5">
                      {s.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.logo} alt={s.team} className="w-4 h-4 object-contain shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center text-[6px] font-bold text-slate-500 shrink-0">{s.team.slice(0,2)}</div>
                      )}
                      <span className="truncate max-w-[80px]">{s.team}</span>
                      {s.rank === 1 && <span className="text-[7px]">👑</span>}
                    </div>
                  </td>
                  <td className="px-1 py-1.5 text-center tabular-nums">{s.played}</td>
                  <td className="px-1 py-1.5 text-center tabular-nums text-green-400">{s.won}</td>
                  <td className="px-1 py-1.5 text-center tabular-nums">{s.drawn}</td>
                  <td className="px-1 py-1.5 text-center tabular-nums text-rose-400">{s.lost}</td>
                  <td className="px-1 py-1.5 text-center tabular-nums text-slate-500">{s.goalsFor}:{s.goalsAgainst}</td>
                  <td className="px-1 py-1.5 text-center tabular-nums font-black text-white">{s.points}</td>
                  <td className="px-1 py-1.5">
                    <div className="flex gap-0.5">
                      {(s.form || '').split('').slice(-5).map((c, i) => <FormBadge key={i} ch={c} />)}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[7px] text-slate-600 mt-2 px-1">🟢 TOP 4 · 🔴 Zostup</p>
    </div>
  )
}

function FactsPanel({ sport }: { sport: string }) {
  const { data, loading } = useWidget<{ facts: string[] }>(`/api/sports?sport=${sport}&action=facts`, 24 * 60 * 60 * 1000)
  const [active, setActive] = useState(0)
  useEffect(() => { setActive(0) }, [sport])

  if (loading) return <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
  if (!data?.facts?.length) return <div className="text-center py-10 text-[11px] text-slate-500">Žiadne fakty dostupné</div>

  return (
    <div className="space-y-2">
      <div className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-3">💡 Zaujímavosti &amp; fakty</div>
      {data.facts.map((fact, i) => (
        <div key={i} onClick={() => setActive(i)}
          className={`px-3.5 py-3 rounded-xl border cursor-pointer transition-all select-none ${
            i === active
              ? 'bg-emerald-500/8 border-emerald-500/25 scale-[1.01]'
              : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
          }`}>
          <p className="text-[11px] text-slate-200 leading-relaxed">{fact}</p>
        </div>
      ))}
    </div>
  )
}



export default function SportsWidget() {
  const { lang } = useLang()
  const [sport, setSport] = useState('football')
  const [mainTab, setMainTab] = useState<MainTab>('scores')
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all')
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

  const MAIN_TABS: { key: MainTab; icon: string; label: string }[] = [
    { key: 'scores', icon: '📊', label: lang === 'sk' ? 'Výsledky' : 'Scores' },
    { key: 'standings', icon: '📋', label: lang === 'sk' ? 'Tabuľka' : 'Standings' },
    { key: 'facts', icon: '💡', label: lang === 'sk' ? 'Zaujímavosti' : 'Facts' },
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
          <button key={s.key} onClick={() => { setSport(s.key); setScoreFilter('all') }}
            className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1.5 rounded-lg whitespace-nowrap transition-all shrink-0 ${
              sport === s.key
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
            }`}>
            <span className="text-[11px]">{s.emoji}</span>
            <span>{lang === 'sk' ? s.sk : s.en}</span>
          </button>
        ))}
      </div>

      {/* Main tab bar */}
      <div className="flex gap-0.5 mb-3 bg-white/[0.03] rounded-xl p-0.5 border border-white/5">
        {MAIN_TABS.map(t => (
          <button key={t.key} onClick={() => setMainTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-[9px] font-semibold py-1.5 rounded-lg transition-all ${
              mainTab === t.key
                ? 'bg-emerald-500/15 text-emerald-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── SCORES tab ── */}
      {mainTab === 'scores' && (
        <>
          <div className="flex gap-1 mb-2 overflow-x-auto scrollbar-hide">
            {([
              { key: 'all' as ScoreFilter, label: 'Všetko', count: data?.matches?.length ?? 0 },
              { key: 'live' as ScoreFilter, label: 'LIVE', count: liveCount, isLive: true },
              { key: 'results' as ScoreFilter, label: lang === 'sk' ? 'Výsledky' : 'Results', count: finished.length },
              { key: 'upcoming' as ScoreFilter, label: lang === 'sk' ? 'Plán' : 'Upcoming', count: scheduled.length },
            ]).map(f => (
              <button key={f.key} onClick={() => setScoreFilter(f.key)}
                className={`flex items-center gap-1 text-[8px] font-semibold px-2.5 py-1 rounded-full transition-all whitespace-nowrap shrink-0 ${
                  scoreFilter === f.key
                    ? f.isLive ? 'bg-red-500/20 text-red-400 border border-red-500/25' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/[0.02] text-slate-500 border border-white/5 hover:text-slate-300'
                }`}>
                {f.isLive && liveCount > 0 && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                {f.label}
                {f.count > 0 && <span className="opacity-60">({f.count})</span>}
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
              <p className="text-[10px] text-slate-600 mt-1">{lang === 'sk' ? 'Skúste iný šport alebo zajtra' : 'Try another sport'}</p>
            </div>
          ) : (
            <div className="max-h-[480px] overflow-y-auto scrollbar-hide space-y-3">
              {(scoreFilter === 'all' || scoreFilter === 'live') && liveCount > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">Live</span>
                    <div className="flex-1 h-px bg-red-500/15" />
                    <span className="text-[8px] text-red-400">{liveCount}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[...live, ...halftime].map(m => <LiveMatchCard key={m.id} m={m} />)}
                  </div>
                </div>
              )}
              {(scoreFilter === 'all' || scoreFilter === 'results') && finished.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">✅ {lang === 'sk' ? 'Výsledky' : 'Results'}</span>
                    <div className="flex-1 h-px bg-emerald-500/15" />
                    <span className="text-[8px] text-slate-500">{finished.length}</span>
                  </div>
                  <div className="space-y-0.5">
                    {finished.slice(0, scoreFilter === 'all' ? 10 : 30).map(m => <ResultRow key={m.id} m={m} />)}
                    {scoreFilter === 'all' && finished.length > 10 && (
                      <button onClick={() => setScoreFilter('results')} className="w-full text-[8px] text-slate-600 hover:text-slate-400 py-1.5 text-center">
                        +{finished.length - 10} ďalších výsledkov →
                      </button>
                    )}
                  </div>
                </div>
              )}
              {(scoreFilter === 'all' || scoreFilter === 'upcoming') && scheduled.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-wider">🕐 {lang === 'sk' ? 'Nadchádzajúce' : 'Upcoming'}</span>
                    <div className="flex-1 h-px bg-blue-500/15" />
                    <span className="text-[8px] text-slate-500">{scheduled.length}</span>
                  </div>
                  <div className="space-y-0.5">
                    {scheduled.slice(0, scoreFilter === 'all' ? 8 : 30).map(m => <ScheduledRow key={m.id} m={m} />)}
                  </div>
                </div>
              )}
              {scoreFilter === 'live' && liveCount === 0 && (
                <div className="text-center py-8 text-[11px] text-slate-500">Momentálne žiadne live zápasy</div>
              )}
            </div>
          )}
          <p className="text-[9px] text-slate-600 mt-3 text-center">{data?.source ?? 'ESPN'} · {lang === 'sk' ? 'obnova 30s' : 'refresh 30s'}</p>
        </>
      )}

      {/* ── STANDINGS tab ── */}
      {mainTab === 'standings' && <StandingsTable sport={sport} />}

      {/* ── FACTS tab ── */}
      {mainTab === 'facts' && <FactsPanel sport={sport} />}
    </WidgetCard>
  )
}
