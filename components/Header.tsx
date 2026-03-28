'use client'

import { useState, useEffect } from 'react'
import { getHoliday } from '@/lib/namedays'
import { useTheme, THEMES } from '@/hooks/useTheme'
import { useLang } from '@/hooks/useLang'

export default function Header() {
  const [now, setNow] = useState<Date | null>(null)
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useLang()

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

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
            <h1 className="text-lg font-bold text-white leading-none tracking-tight">Slovakia Info</h1>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">{t('subtitle')}</p>
          </div>
        </div>

        {/* Right: Lang + Theme circles + Holiday + Live */}
        <div className="flex items-center gap-3 shrink-0">
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
          {/* Admin gear */}
          <a
            href="/admin"
            className="hidden sm:flex w-7 h-7 items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"
            title="Admin"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </a>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-medium">Live</span>
          </div>
        </div>
      </div>
    </header>
  )
}
