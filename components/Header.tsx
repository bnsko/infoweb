'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { sk } from 'date-fns/locale'
import { getNameday, getHoliday } from '@/lib/namedays'
import { useTheme, THEMES } from '@/hooks/useTheme'

export default function Header() {
  const [now, setNow] = useState<Date | null>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const timeStr = now ? format(now, 'HH:mm:ss') : '--:--:--'
  const dateStr = now ? format(now, 'EEEE, d. MMMM yyyy', { locale: sk }) : ''
  const nameday = now ? getNameday(now) : null
  const holiday = now ? getHoliday(now) : null

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl"
      style={{ background: 'rgba(10, 12, 20, 0.88)' }}
    >
      <div className="max-w-[1680px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-lg"
               style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-card)' }}>
            🇸🇰
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none tracking-tight">InfoSK</h1>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">Slovenský prehľad</p>
          </div>
        </div>

        {/* Center: Clock + Date */}
        <div className="hidden md:flex flex-col items-center">
          <div className="text-2xl font-mono font-bold text-white tabular-nums tracking-tight" suppressHydrationWarning>
            {timeStr}
          </div>
          <div className="text-xs text-slate-400 capitalize" suppressHydrationWarning>{dateStr}</div>
        </div>

        {/* Right: Theme picker + Nameday + Live badge */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme picker */}
          <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className={`text-sm px-2.5 py-1.5 rounded-lg transition-all ${
                  theme === t.key
                    ? 'bg-white/10 shadow-sm'
                    : 'hover:bg-white/5 opacity-50 hover:opacity-80'
                }`}
                title={t.label}
              >
                {t.emoji}
              </button>
            ))}
          </div>
          {holiday && (
            <div className="hidden lg:block text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Sviatok</div>
              <div className="text-sm font-semibold text-rose-400">🎉 {holiday}</div>
            </div>
          )}
          {nameday && (
            <div className="hidden lg:block text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Meniny</div>
              <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>🎂 {nameday}</div>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-medium">Live</span>
          </div>
        </div>
      </div>
    </header>
  )
}
