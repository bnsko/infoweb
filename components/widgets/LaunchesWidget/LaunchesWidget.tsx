'use client'

import { useState, useEffect } from 'react'
import { useWidget } from '@/hooks/useWidget'
import WidgetCard from '@/components/ui/WidgetCard'
import WidgetError from '@/components/ui/WidgetError'
import SkeletonRows from '@/components/ui/SkeletonRows'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import { sk, enUS } from 'date-fns/locale'
import { useLang } from '@/hooks/useLang'

function statusColor(abbrev: string): string {
  switch (abbrev) {
    case 'Go':  return 'bg-green-500/15 text-green-300 border-green-500/30'
    case 'TBC': return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
    case 'TBD': return 'bg-slate-500/15 text-slate-400 border-slate-500/30'
    case 'Hold': return 'bg-red-500/15 text-red-300 border-red-500/30'
    default:    return 'bg-blue-500/15 text-blue-300 border-blue-500/30'
  }
}

interface LaunchResult {
  id: string; name: string; statusName: string; statusAbbrev: string; net: string
  provider: string; rocket: string; pad: string; missionDesc: string | null
  imageUrl: string | null; infoUrl: string | null; webcastUrl: string | null;
  launchLibraryUrl: string
}

/* ── Mini rocket widget for main panel ── */
export function LaunchesMini(props: { onOpenChange?: (open: boolean) => void }) {
  const { onOpenChange } = props
  const { lang } = useLang()
  const loc = lang === 'sk' ? sk : enUS
  const [open, setOpen] = useState(false)
  useEffect(() => { onOpenChange?.(open) }, [open, onOpenChange])
  const { data } = useWidget<{ results: LaunchResult[] }>('/api/launches', 60 * 60 * 1000)

  const next = data?.results?.[0]
  if (!next) return null

  const netDate = new Date(next.net)
  const relative = isPast(netDate) ? (lang === 'sk' ? 'Práve vzlietlo' : 'Just launched') : formatDistanceToNow(netDate, { addSuffix: true, locale: loc })

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/8 border border-purple-500/15 hover:bg-purple-500/15 transition-all text-[10px] shrink-0">
        <span>🚀</span>
        <span className="text-purple-300 font-bold truncate max-w-[100px]">{relative}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[400px] bg-[var(--bg-card)] border border-purple-500/20 rounded-2xl shadow-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-purple-300">🚀 {lang === 'sk' ? 'Najbližšie štarty' : 'Upcoming Launches'}</span>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
            </div>
            {data?.results.slice(0, 5).map((launch, i) => {
              const lDate = new Date(launch.net)
              const flown = isPast(lDate)
              const rel = flown ? (lang === 'sk' ? 'Vzlietlo' : 'Launched') : formatDistanceToNow(lDate, { addSuffix: true, locale: loc })
              const formatted = format(lDate, 'd. MMM yyyy HH:mm', { locale: loc })
              const url = launch.infoUrl ?? launch.webcastUrl ?? launch.launchLibraryUrl
              return (
                <div key={launch.id} className={`rounded-xl p-3 border ${i === 0 ? 'bg-purple-500/10 border-purple-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm text-white hover:text-purple-300 transition-colors leading-snug">{launch.name} ↗</a>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusColor(launch.statusAbbrev)}`}>{launch.statusName}</span>
                  </div>
                  <div className="text-xs text-slate-400">📅 {formatted} · {rel}</div>
                  <div className="text-xs text-slate-500 mt-0.5">🏢 {launch.provider} · 📍 {launch.pad}</div>
                  {launch.missionDesc && <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{launch.missionDesc}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

export default function LaunchesWidget() {
  const { t, lang } = useLang()
  const loc = lang === 'sk' ? sk : enUS
  const { data, loading, error, refetch } = useWidget<{ results: LaunchResult[] }>('/api/launches', 60 * 60 * 1000)

  return (
    <WidgetCard accent="purple" title={t('launches.title')} icon="🚀" className="h-full" onRefresh={refetch}>
      {loading && <SkeletonRows rows={4} cols={2} />}
      {!loading && (error || !data) && <WidgetError />}
      {!loading && data && (
        <div className="space-y-3 max-h-[420px] overflow-y-auto">
          {data.results.length === 0 && (
            <p className="text-slate-500 text-sm py-4 text-center">{t('launches.none')}</p>
          )}
          {data.results.map((launch, i) => {
            const netDate = new Date(launch.net)
            const alreadyFlown = isPast(netDate)
            const relative = alreadyFlown
              ? t('launches.justLaunched')
              : formatDistanceToNow(netDate, { addSuffix: true, locale: loc })
            const formatted = format(netDate, 'd. MMM yyyy HH:mm', { locale: loc })
            const primaryUrl = launch.webcastUrl ?? launch.infoUrl ?? launch.launchLibraryUrl

            return (
              <div key={launch.id} className={`rounded-xl p-3 border ${i === 0 ? 'bg-purple-500/10 border-purple-500/20' : 'bg-white/3 border-white/5'}`}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <a href={primaryUrl} target="_blank" rel="noopener noreferrer"
                     className="font-semibold text-sm text-white leading-snug hover:text-purple-300 transition-colors">
                    {launch.name} ↗
                  </a>
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
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <a href={primaryUrl} target="_blank" rel="noopener noreferrer"
                     className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 hover:bg-purple-500/25 transition-colors">
                    🔗 {lang === 'sk' ? 'Detail misie' : 'Mission detail'}
                  </a>
                  {launch.webcastUrl && (
                    <a href={launch.webcastUrl} target="_blank" rel="noopener noreferrer"
                       className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-300 hover:bg-red-500/25 transition-colors">
                      ▶ Livestream
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <p className="text-[10px] text-slate-600 mt-2">{t('launches.source')}</p>
    </WidgetCard>
  )
}
