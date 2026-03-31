'use client'

import { useState, useEffect, useCallback } from 'react'
import { getHoliday } from '@/lib/namedays'
import { useTheme, THEMES } from '@/hooks/useTheme'
import { useLang } from '@/hooks/useLang'

/* ── Live statistics data ── */
const SK = { population: 5_430_000, birthsPerYear: 55_000, deathsPerYear: 58_000 }
const WORLD = { population: 8_100_000_000, birthsPerYear: 140_000_000, deathsPerYear: 60_000_000 }
const JAN1 = new Date(new Date().getFullYear(), 0, 1).getTime()

function ratePerMs(perYear: number) { return perYear / (365.25 * 86_400_000) }
function fmtBig(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(3).replace('.', ',') + ' mld'
  if (n >= 1e6) return (n / 1e6).toFixed(3).replace('.', ',') + ' mil'
  if (n >= 1e3) return Math.round(n).toLocaleString('sk-SK')
  return String(Math.round(n))
}

const COUNTERS = [
  { icon: '🍺', label: 'Pív vypitých', perYear: 450_000_000 },
  { icon: '🚗', label: 'Áut vyrobených', perYear: 1_100_000 },
  { icon: '☕', label: 'Káv vypitých', perYear: 800_000_000 },
  { icon: '🛣️', label: 'Km najazdených', perYear: 30_000_000_000 },
  { icon: '🍕', label: 'Pizz zjedených', perYear: 200_000_000 },
  { icon: '🗑️', label: 'Ton odpadu', perYear: 2_300_000 },
  { icon: '💒', label: 'Svadieb', perYear: 30_000 },
  { icon: '🚑', label: 'Nehôd', perYear: 14_000 },
]

const STATIC_FACTS = [
  { icon: '🏔️', label: 'Najvyšší vrch', value: 'Gerlachovský štít 2 655 m' },
  { icon: '🏰', label: 'Hrady', value: '180+ (najviac v EÚ/obyv.)' },
  { icon: '🧊', label: 'UNESCO jaskyne', value: 'Dobšinská ľadová jaskyňa' },
  { icon: '🚗', label: 'Autá/obyv.', value: '~202 áut/1000 obyv./rok' },
  { icon: '🌲', label: 'Lesy', value: '41 % rozlohy' },
  { icon: '♨️', label: 'Termálne pramene', value: '1 300+' },
  { icon: '🇪🇺', label: 'Členstvo', value: 'EÚ, NATO, Eurozóna' },
  { icon: '📐', label: 'Rozloha', value: '49 035 km²' },
  { icon: '🗣️', label: 'Jazyky', value: 'Slovenčina + 10 menšín' },
]

export default function Header() {
  const [now, setNow] = useState<Date | null>(null)
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useLang()
  const [skOpen, setSkOpen] = useState(false)
  const [tick, setTick] = useState(Date.now())

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!skOpen) return
    const iv = setInterval(() => setTick(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [skOpen])

  const closePopup = useCallback(() => setSkOpen(false), [])
  const holiday = now ? getHoliday(now) : null

  const msFromJan1 = tick - JAN1
  const msSinceMidnight = tick - new Date(new Date(tick).setHours(0, 0, 0, 0)).getTime()
  const skPop = SK.population + msFromJan1 * ratePerMs(SK.birthsPerYear - SK.deathsPerYear)
  const worldPop = WORLD.population + msFromJan1 * ratePerMs(WORLD.birthsPerYear - WORLD.deathsPerYear)
  const birthsToday = Math.floor(msSinceMidnight * ratePerMs(SK.birthsPerYear))
  const deathsToday = Math.floor(msSinceMidnight * ratePerMs(SK.deathsPerYear))

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl" style={{ background: 'rgba(10, 12, 18, 0.90)' }}>
      <div className="max-w-[1680px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => setSkOpen(o => !o)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-lg cursor-pointer hover:scale-110 transition-all"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-card)' }}
            title="Slovensko v číslach">🇸🇰</button>
          <div>
            <h1 className="text-lg font-bold text-white leading-none tracking-tight">Slovakia Info</h1>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">{t('subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Year progress */}
          {(() => {
            const n = new Date()
            const dayOfYear = Math.floor((n.getTime() - new Date(n.getFullYear(), 0, 0).getTime()) / 86400000)
            const daysInYear = new Date(n.getFullYear(), 1, 29).getDate() === 29 ? 366 : 365
            const yearPct = Math.round((dayOfYear / daysInYear) * 1000) / 10
            const weekNum = Math.ceil(((n.getTime() - new Date(n.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(n.getFullYear(), 0, 1).getDay()) / 7)
            const remaining = daysInYear - dayOfYear
            return (
              <div className="hidden lg:flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5" suppressHydrationWarning>
                <div className="flex items-center gap-2 text-[9px]">
                  <span className="text-slate-400 font-semibold">Rok {n.getFullYear()}</span>
                  <span className="text-amber-400 font-bold font-mono">{yearPct}%</span>
                </div>
                <div className="w-24 bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all" style={{ width: `${yearPct}%` }} />
                </div>
                <div className="flex items-center gap-2 text-[7px] text-slate-500 font-mono">
                  <span>Týždeň {weekNum}</span>
                  <span>·</span>
                  <span>Deň {dayOfYear}/{daysInYear}</span>
                  <span>·</span>
                  <span>Zostáva {remaining}d</span>
                </div>
              </div>
            )
          })()}
          <div className="hidden sm:flex items-center gap-1.5">
            {THEMES.map((tm) => (
              <button key={tm.key} onClick={() => setTheme(tm.key)}
                className={`w-5 h-5 rounded-full transition-all border-2 ${theme === tm.key ? 'border-white/60 scale-110 shadow-lg' : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'}`}
                style={{ background: tm.color }} title={lang === 'sk' ? tm.label : tm.labelEn} />
            ))}
          </div>
          {holiday && (
            <div className="hidden lg:block text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{t('holiday')}</div>
              <div className="text-sm font-semibold text-rose-400">🎉 {holiday}</div>
            </div>
          )}
          <a href="/admin" className="hidden sm:flex w-7 h-7 items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all" title="Admin">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </a>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {skOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={closePopup}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[520px] bg-[var(--bg-card)] border border-blue-500/20 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-blue-300">🇸🇰 Slovensko – Živé štatistiky</span>
              <button onClick={closePopup} className="text-slate-500 hover:text-white text-lg">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-500/8 border border-blue-500/15 rounded-xl p-3 text-center">
                <div className="text-[9px] text-blue-400 uppercase tracking-wider mb-1">Populácia SR</div>
                <div className="text-lg font-bold font-mono tabular-nums text-white" suppressHydrationWarning>{Math.round(skPop).toLocaleString('sk-SK')}</div>
                <div className="flex justify-center gap-3 mt-1 text-[9px]">
                  <span className="text-emerald-400">👶 +{birthsToday} dnes</span>
                  <span className="text-rose-400">✝ {deathsToday} dnes</span>
                </div>
              </div>
              <div className="bg-indigo-500/8 border border-indigo-500/15 rounded-xl p-3 text-center">
                <div className="text-[9px] text-indigo-400 uppercase tracking-wider mb-1">Populácia sveta</div>
                <div className="text-lg font-bold font-mono tabular-nums text-white" suppressHydrationWarning>{fmtBig(worldPop)}</div>
                <div className="text-[9px] text-slate-500 mt-1">+{Math.round(msSinceMidnight * ratePerMs(WORLD.birthsPerYear)).toLocaleString('sk-SK')} dnes</div>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-2">🔢 Živé počítadlá SR (od 1.1.)</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {COUNTERS.map((c, i) => {
                  const val = msFromJan1 * ratePerMs(c.perYear)
                  return (
                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-lg p-2 text-center">
                      <span className="text-base">{c.icon}</span>
                      <div className="text-[10px] font-bold font-mono tabular-nums text-white mt-0.5" suppressHydrationWarning>{fmtBig(val)}</div>
                      <div className="text-[8px] text-slate-500 mt-0.5">{c.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-2">📊 Fakty o Slovensku</div>
              <div className="grid grid-cols-3 gap-2">
                {STATIC_FACTS.map((f, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-2">
                    <div className="flex items-center gap-1 mb-0.5"><span className="text-sm">{f.icon}</span><span className="text-[8px] text-slate-500 font-semibold">{f.label}</span></div>
                    <div className="text-[9px] text-slate-300">{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
