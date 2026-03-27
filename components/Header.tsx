'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { sk, enUS } from 'date-fns/locale'
import { getHoliday } from '@/lib/namedays'
import { useTheme, THEMES } from '@/hooks/useTheme'
import { useLang } from '@/hooks/useLang'

export default function Header() {
  const [now, setNow] = useState<Date | null>(null)
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useLang()

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const loc = lang === 'sk' ? sk : enUS
  const timeStr = now ? format(now, 'HH:mm:ss') : '--:--:--'
  const dateStr = now ? format(now, 'EEEE, d. MMMM yyyy', { locale: loc }) : ''
  const holiday = now ? getHoliday(now) : null

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl"
      style={{ background: 'rgba(10, 12, 18, 0.90)' }}
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
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">{t('subtitle')}</p>
          </div>
        </div>

        {/* Center: Clock + Date */}
        <div className="hidden md:flex flex-col items-center">
          <div className="text-2xl font-mono font-bold text-white tabular-nums tracking-tight" suppressHydrationWarning>
            {timeStr}
          </div>
          <div className="text-xs text-slate-400 capitalize" suppressHydrationWarning>{dateStr}</div>
        </div>

        {/* Right: Lang + Theme circles + Holiday + Live */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language switcher */}
          <div className="hidden sm:flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/5">
            <button
              onClick={() => setLang('sk')}
              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${lang === 'sk' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              SK
            </button>
            <button
              onClick={() => setLang('en')}
              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${lang === 'en' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              EN
            </button>
          </div>

          {/* Theme circles */}
          <div className="hidden sm:flex items-center gap-1.5">
            {THEMES.map((tm) => (
              <button
                key={tm.key}
                onClick={() => setTheme(tm.key)}
                className={`w-5 h-5 rounded-full transition-all border-2 ${
                  theme === tm.key ? 'border-white/60 scale-110 shadow-lg' : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                }`}
                style={{ background: tm.color }}
                title={lang === 'sk' ? tm.label : tm.labelEn}
              />
            ))}
          </div>

          {holiday && (
            <div className="hidden lg:block text-center">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{t('holiday')}</div>
              <div className="text-sm font-semibold text-rose-400">🎉 {holiday}</div>
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
