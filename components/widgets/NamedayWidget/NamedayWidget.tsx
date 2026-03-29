'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { sk, enUS } from 'date-fns/locale'
import { getNameday, getTomorrowNameday, getHoliday, getNextHoliday } from '@/lib/namedays'
import { calculateMoonPhase, nextFullMoon } from '@/lib/moon'
import { useLang } from '@/hooks/useLang'
import WidgetCard from '@/components/ui/WidgetCard'

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((Number(d) - Number(start)) / 86400000)
}

/* ── Mini expandable from main panel ── */
export function NamedayMini({ showLabel }: { showLabel?: boolean }) {
  const [open, setOpen] = useState(false)
  const now = useMemo(() => new Date(), [])
  const { t, lang } = useLang()
  const loc = lang === 'sk' ? sk : enUS

  const today = getNameday(now)
  const tomorrow = getTomorrowNameday(now)
  const holiday = getHoliday(now)
  const nextHol = getNextHoliday(now)
  const moon = calculateMoonPhase(now)
  const fullMoonDate = nextFullMoon(now)
  const dayOfYear = getDayOfYear(now)
  const isLeap = new Date(now.getFullYear(), 1, 29).getDate() === 29
  const daysInYear = isLeap ? 366 : 365
  const yearProgress = Math.round((dayOfYear / daysInYear) * 100)
  const dateLabel = format(now, 'd. MMMM yyyy', { locale: loc })
  const weekday = format(now, 'EEEE', { locale: loc })
  const weekNum = format(now, 'w', { locale: loc })
  const fullMoonLabel = format(fullMoonDate, 'd. MMMM', { locale: loc })

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/8 border border-yellow-500/15 hover:bg-yellow-500/15 transition-all text-[10px] shrink-0">
        {showLabel && <span className="text-slate-400">{lang === 'sk' ? 'Dnes má meniny' : 'Name day'}</span>}
        <span className="text-yellow-300 font-bold">{today}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[360px] bg-[var(--bg-card)] border border-yellow-500/20 rounded-2xl shadow-2xl p-4 space-y-3 max-h-[80vh] overflow-y-auto"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-yellow-300">📅 {t('nameday.title')}</span>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white text-lg">✕</button>
            </div>

            <div>
              <div className="text-xl font-bold text-white capitalize">{weekday}</div>
              <div className="text-sm text-slate-400">{dateLabel}</div>
              <div className="text-xs text-slate-600">{t('nameday.week')} {weekNum}</div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] text-yellow-600 uppercase tracking-wide mb-0.5">{t('nameday.today')}</div>
                  <div className="text-base font-bold text-yellow-300">🎂 {today}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-yellow-700 uppercase tracking-wide mb-0.5">{t('nameday.tomorrow')}</div>
                  <div className="text-sm font-semibold text-yellow-400/70">🎂 {tomorrow}</div>
                </div>
              </div>
            </div>

            {holiday && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
                <div className="text-[10px] text-rose-600 uppercase tracking-wide mb-0.5">{t('holiday')}</div>
                <div className="text-sm font-semibold text-rose-300">🎉 {holiday}</div>
              </div>
            )}

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-2.5">
              <div className="text-[10px] text-purple-500 uppercase tracking-wide mb-1">{t('nameday.moonPhase')}</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl leading-none">{moon.emoji}</div>
                  <div className="text-xs font-semibold text-purple-300 mt-1">{moon.name}</div>
                  <div className="text-[10px] text-slate-500">{t('nameday.illumination')}: {moon.illumination}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">{t('nameday.fullMoon')}:</div>
                  <div className="text-xs font-bold text-yellow-300">{fullMoonLabel}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{t('nameday.inDays')} {moon.daysToFull} {t('nameday.days')}</div>
                </div>
              </div>
            </div>

            {!holiday && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
                <div className="text-[10px] text-emerald-600 uppercase tracking-wide mb-0.5">{t('nameday.nextHoliday')}</div>
                <div className="text-sm font-semibold text-emerald-300">🗓️ {nextHol.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {t('nameday.inDays')} {nextHol.daysUntil} {t('nameday.days')}
                  {' · '}
                  {format(nextHol.date, 'd. MMMM', { locale: loc })}
                </div>
              </div>
            )}

            <div className="border-t border-white/5 pt-2">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>{t('nameday.year')} {now.getFullYear()}</span>
                <span>{yearProgress}% {t('nameday.done')}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full" style={{ width: `${yearProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function NamedayWidget() {
  const now = useMemo(() => new Date(), [])
  const { t, lang } = useLang()
  const loc = lang === 'sk' ? sk : enUS

  const today = getNameday(now)
  const tomorrow = getTomorrowNameday(now)
  const holiday = getHoliday(now)
  const nextHoliday = getNextHoliday(now)
  const moon = calculateMoonPhase(now)
  const fullMoonDate = nextFullMoon(now)
  const dayOfYear = getDayOfYear(now)
  const isLeap = new Date(now.getFullYear(), 1, 29).getDate() === 29
  const daysInYear = isLeap ? 366 : 365
  const yearProgress = Math.round((dayOfYear / daysInYear) * 100)

  const dateLabel = format(now, 'd. MMMM yyyy', { locale: loc })
  const weekday = format(now, 'EEEE', { locale: loc })
  const weekNum = format(now, 'w', { locale: loc })
  const fullMoonLabel = format(fullMoonDate, 'd. MMMM', { locale: loc })

  return (
    <WidgetCard accent="yellow" className="h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
      <div className="relative space-y-2.5">
        <div>
          <div className="widget-title">
            <span>📅</span>
            <span>{t('nameday.title')}</span>
          </div>
          <div className="text-xl font-bold text-white capitalize">{weekday}</div>
          <div className="text-sm text-slate-400">{dateLabel}</div>
          <div className="text-xs text-slate-600 mt-0.5">{t('nameday.week')} {weekNum}</div>
        </div>

        {/* Today + Tomorrow namedays in one box */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] text-yellow-600 uppercase tracking-wide mb-0.5">{t('nameday.today')}</div>
              <div className="text-base font-bold text-yellow-300">🎂 {today}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-yellow-700 uppercase tracking-wide mb-0.5">{t('nameday.tomorrow')}</div>
              <div className="text-sm font-semibold text-yellow-400/70">🎂 {tomorrow}</div>
            </div>
          </div>
        </div>

        {holiday && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5">
            <div className="text-[10px] text-rose-600 uppercase tracking-wide mb-0.5">{t('holiday')}</div>
            <div className="text-sm font-semibold text-rose-300">🎉 {holiday}</div>
          </div>
        )}

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-2.5">
          <div className="text-[10px] text-purple-500 uppercase tracking-wide mb-1">{t('nameday.moonPhase')}</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl leading-none">{moon.emoji}</div>
              <div className="text-xs font-semibold text-purple-300 mt-1">{moon.name}</div>
              <div className="text-[10px] text-slate-500">{t('nameday.illumination')}: {moon.illumination}%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">{t('nameday.fullMoon')}:</div>
              <div className="text-xs font-bold text-yellow-300">{fullMoonLabel}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{t('nameday.inDays')} {moon.daysToFull} {t('nameday.days')}</div>
            </div>
          </div>
          <div className="mt-2 bg-white/5 rounded-full h-1">
            <div className="bg-gradient-to-r from-purple-400 to-yellow-300 h-1 rounded-full" style={{ width: `${moon.illumination}%` }} />
          </div>
        </div>

        {!holiday && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
            <div className="text-[10px] text-emerald-600 uppercase tracking-wide mb-0.5">{t('nameday.nextHoliday')}</div>
            <div className="text-sm font-semibold text-emerald-300">🗓️ {nextHoliday.name}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {t('nameday.inDays')} {nextHoliday.daysUntil} {t('nameday.days')}
              {' · '}
              {format(nextHoliday.date, 'd. MMMM', { locale: loc })}
            </div>
          </div>
        )}

        <div className="border-t border-white/5 pt-2">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>{t('nameday.year')} {now.getFullYear()}</span>
            <span>{yearProgress}% {t('nameday.done')}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full" style={{ width: `${yearProgress}%` }} />
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}
